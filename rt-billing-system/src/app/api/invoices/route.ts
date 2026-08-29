import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoiceCreateSchema } from '@/lib/validations';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      const numSearch = parseInt(search);
      where.OR = [
        { customerNameSnap: { contains: search, mode: 'insensitive' } },
        ...(isNaN(numSearch) ? [] : [{ invoiceNo: numSearch }]),
      ];
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { invoiceNo: 'desc' },
      take: 50,
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = invoiceCreateSchema.parse(body);

    // Atomic DB transaction to generate invoiceNo and update stock
    const result = await db.$transaction(async (tx) => {
      // 1. Get Settings for invoice prefix & current number
      let settings = await tx.settings.findUnique({ where: { id: 'main' } });
      if (!settings) {
        settings = await tx.settings.create({
          data: {
            id: 'main',
            companyNameEn: 'Rajasthan Retail Co.',
            companyNameAr: 'شركة راجستان للبيع بالتجزئة',
            addressEn: 'Shuwaikh Industrial Area 2, Kuwait',
            addressAr: 'الشويخ الصناعية ٢، الكويت',
            phone: '+965 9099 7484',
            email: 'rajasthantools.q8@gmail.com',
            declarationEn: 'Goods Sold can be exchanged within 14 days.',
            declarationAr: 'يمكن استبدال البضائع خلال ١٤ يومًا.',
            currentInvoiceNo: 1001,
          },
        });
      }

      const nextInvoiceNo = settings.currentInvoiceNo;

      // Update next invoice number
      await tx.settings.update({
        where: { id: 'main' },
        data: { currentInvoiceNo: nextInvoiceNo + 1 },
      });

      // Amount in words
      const amountInWordsEn = kwdToWordsEn(validated.netAmount);
      const amountInWordsAr = kwdToWordsAr(validated.netAmount);

      // 2. Create Invoice Record
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo: nextInvoiceNo,
          type: validated.type,
          customerId: validated.customerId || null,
          customerNameSnap: validated.customerNameSnap,
          customerPhoneSnap: validated.customerPhoneSnap || null,
          salesmanId: validated.salesmanId || null,
          narration: validated.narration || null,
          grossAmount: validated.grossAmount,
          discountAmount: validated.discountAmount,
          extraAmount: validated.extraAmount,
          netAmount: validated.netAmount,
          paidAmount: validated.paidAmount,
          dueAmount: validated.dueAmount,
          status: validated.dueAmount <= 0 ? 'PAID' : validated.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
          amountInWordsEn,
          amountInWordsAr,
          createdBy: 'admin',
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              itemCodeSnap: item.itemCodeSnap,
              nameEnSnap: item.nameEnSnap,
              nameArSnap: item.nameArSnap,
              qty: item.qty,
              price: item.price,
              lineDiscount: item.lineDiscount,
              amount: item.amount,
            })),
          },
          payments: {
            create: validated.payments.map((p) => ({
              mode: p.mode,
              amount: p.amount,
              reference: p.reference || null,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });

      // 3. Update Customer Balance if Credit or Due amount
      if (validated.customerId && validated.dueAmount > 0) {
        await tx.customer.update({
          where: { id: validated.customerId },
          data: {
            currentBalance: { increment: validated.dueAmount },
          },
        });
      }

      return invoice;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    // 4. Batch Product Stock Decrements and Stock Movements
    const productDecrementPromises = validated.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: {
          stockQty: { decrement: item.qty },
        },
      })
    );

    const stockMovementPromises = validated.items.map((item) =>
      db.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          qty: item.qty,
          refType: 'INVOICE',
          refId: result.id,
          note: `Invoice #RT-${result.invoiceNo}`,
          createdBy: 'admin',
        },
      })
    );

    await db.$transaction([
      ...productDecrementPromises,
      ...stockMovementPromises,
    ]);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
