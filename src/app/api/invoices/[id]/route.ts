import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
        salesman: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // 1. Restore stock quantities
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            refType: 'INVOICE_CANCEL',
            refId: invoice.id,
            note: `Stock restored from deleted Invoice #RT-${invoice.invoiceNo}`,
            createdBy: 'admin',
          }
        });
      }

      // 2. Restore customer balance if credit was given
      if (invoice.customerId && Number(invoice.dueAmount) > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { currentBalance: { decrement: Number(invoice.dueAmount) } }
        });
      }

      // 3. Delete invoice (cascade deletes items and payments)
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const invoice = await db.invoice.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
        salesman: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      customerId,
      customerNameSnap,
      customerPhoneSnap,
      dateTime,
      type = 'CASH',
      narration,
      grossAmount,
      discountAmount = 0,
      extraAmount = 0,
      netAmount,
      paidAmount = 0,
      dueAmount = 0,
      status,
      items,
      payments = [],
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invoice must contain at least 1 item' }, { status: 400 });
    }

    const existing = await db.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const numGross = Number(grossAmount);
    const numDiscount = Number(discountAmount);
    const numExtra = Number(extraAmount);
    const numNet = Number(netAmount);
    const numPaid = Number(paidAmount);
    const numDue = Number(dueAmount);

    const amountInWordsEn = kwdToWordsEn(numNet);
    const amountInWordsAr = kwdToWordsAr(numNet);

    const computedStatus = status || (numDue <= 0 ? 'PAID' : numPaid > 0 ? 'PARTIAL' : 'UNPAID');

    const updatedInvoice = await db.$transaction(async (tx) => {
      // 1. Revert previous stock movements (increment stock by previous item qty)
      for (const oldItem of existing.items) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: { stockQty: { increment: oldItem.qty } },
        });
      }

      // 2. Deduct new items stock (decrement stock by new item qty)
      for (const newItem of items) {
        await tx.product.update({
          where: { id: newItem.productId },
          data: { stockQty: { decrement: Number(newItem.qty) } },
        });

        await tx.stockMovement.create({
          data: {
            productId: newItem.productId,
            type: 'OUT',
            qty: Number(newItem.qty),
            refType: 'INVOICE_EDIT',
            refId: existing.id,
            note: `Stock adjusted from edited Invoice #RT-${existing.invoiceNo}`,
            createdBy: 'admin',
          },
        });
      }

      // 3. Customer balance adjustments
      // Revert old invoice credit balance
      if (existing.customerId && Number(existing.dueAmount) > 0) {
        await tx.customer.update({
          where: { id: existing.customerId },
          data: { currentBalance: { decrement: Number(existing.dueAmount) } },
        });
      }

      // Apply new invoice credit balance
      if (customerId && numDue > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { currentBalance: { increment: numDue } },
        });
      }

      // 4. Delete existing invoice items & payments
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.payment.deleteMany({ where: { invoiceId: id } });

      // 5. Update invoice record and recreate items & payments
      const inv = await tx.invoice.update({
        where: { id },
        data: {
          customerId: customerId || null,
          customerNameSnap: customerNameSnap || 'Cash Customer',
          customerPhoneSnap: customerPhoneSnap || null,
          dateTime: dateTime ? new Date(dateTime) : existing.dateTime,
          type,
          narration: narration || null,
          grossAmount: numGross,
          discountAmount: numDiscount,
          extraAmount: numExtra,
          netAmount: numNet,
          paidAmount: numPaid,
          dueAmount: numDue,
          status: computedStatus,
          amountInWordsEn,
          amountInWordsAr,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              itemCodeSnap: item.itemCodeSnap || item.product?.itemCode || '',
              nameEnSnap: item.nameEnSnap || item.product?.nameEn || '',
              nameArSnap: item.nameArSnap || item.product?.nameAr || '',
              qty: Number(item.qty),
              price: Number(item.price),
              lineDiscount: Number(item.lineDiscount || 0),
              amount: Number(item.amount),
            })),
          },
          payments: {
            create: (payments && payments.length > 0 ? payments : [{ mode: type === 'CREDIT' ? 'Credit' : 'Cash', amount: numPaid }]).map((p: any) => ({
              mode: p.mode || 'Cash',
              amount: Number(p.amount),
              reference: p.reference || null,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          payments: true,
          salesman: true,
        },
      });

      return inv;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error('Invoice update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

