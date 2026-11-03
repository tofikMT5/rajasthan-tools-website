import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const customer = await db.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Date range filtering
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    // Default: last 60 days (2 months) if not specified
    const defaultFrom = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const fromDate = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : defaultFrom;
    const toDate = toParam ? new Date(`${toParam}T23:59:59.999Z`) : new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');

    // Build query for invoices
    const whereClause: any = {
      isDeleted: false,
      OR: [
        { customerId: customer.id },
        ...(customer.phone ? [{ customerPhoneSnap: customer.phone }] : []),
      ],
    };

    if (fromParam || toParam) {
      whereClause.dateTime = {
        gte: fromDate,
        lte: toDate,
      };
    }

    // Fetch invoices within date range
    const invoices = await db.invoice.findMany({
      where: whereClause,
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        dateTime: 'asc', // Chronological statement order
      },
    });

    // Compute summary metrics for the selected period
    let totalGross = 0;
    let totalDiscount = 0;
    let totalNet = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const paymentModes: Record<string, number> = {
      Cash: 0,
      'K-Net': 0,
      'Visa / Card': 0,
      Online: 0,
      Cheque: 0,
      Other: 0,
    };

    const formattedInvoices = invoices.map((inv) => {
      const gross = Number(inv.grossAmount || 0);
      const discount = Number(inv.discountAmount || 0);
      const net = Number(inv.netAmount || 0);
      const paid = Number(
        inv.paidAmount !== undefined && inv.paidAmount !== null
          ? inv.paidAmount
          : inv.status === 'PAID'
          ? net
          : 0
      );
      const due = Number(
        inv.dueAmount !== undefined && inv.dueAmount !== null
          ? inv.dueAmount
          : Math.max(0, net - paid)
      );

      totalGross += gross;
      totalDiscount += discount;
      totalNet += net;
      totalPaid += paid;
      totalDue += due;

      // Determine payment methods from payments array
      const paymentList = inv.payments || [];
      const modesFound: string[] = [];

      if (paymentList.length > 0) {
        for (const p of paymentList) {
          const modeUpper = (p.mode || '').toUpperCase();
          const pAmt = Number(p.amount || 0);
          if (modeUpper.includes('KNET') || modeUpper.includes('K-NET')) {
            paymentModes['K-Net'] += pAmt;
            if (!modesFound.includes('K-Net')) modesFound.push('K-Net');
          } else if (modeUpper.includes('VISA') || modeUpper.includes('CARD') || modeUpper.includes('MASTER')) {
            paymentModes['Visa / Card'] += pAmt;
            if (!modesFound.includes('Visa / Card')) modesFound.push('Visa / Card');
          } else if (modeUpper.includes('CHEQUE')) {
            paymentModes['Cheque'] += pAmt;
            if (!modesFound.includes('Cheque')) modesFound.push('Cheque');
          } else if (modeUpper.includes('ONLINE') || modeUpper.includes('LINK')) {
            paymentModes['Online'] += pAmt;
            if (!modesFound.includes('Online')) modesFound.push('Online');
          } else if (modeUpper.includes('CASH')) {
            paymentModes['Cash'] += pAmt;
            if (!modesFound.includes('Cash')) modesFound.push('Cash');
          } else {
            paymentModes['Other'] += pAmt;
            if (!modesFound.includes(p.mode)) modesFound.push(p.mode);
          }
        }
      } else {
        // Fallback based on invoice status / type
        if (inv.status === 'PAID' || paid > 0) {
          const typeUpper = (inv.type || 'CASH').toUpperCase();
          if (typeUpper.includes('KNET')) {
            paymentModes['K-Net'] += paid;
            modesFound.push('K-Net');
          } else {
            paymentModes['Cash'] += paid;
            modesFound.push('Cash');
          }
        }
      }

      const methodLabel = modesFound.length > 0 ? modesFound.join(', ') : inv.status === 'UNPAID' ? 'Credit / Unpaid' : 'Cash';

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        dateTime: inv.dateTime,
        type: inv.type,
        status: inv.status,
        paymentMethod: methodLabel,
        grossAmount: gross,
        discountAmount: discount,
        netAmount: net,
        paidAmount: paid,
        dueAmount: due,
        itemsCount: inv.items?.length || 0,
        narration: inv.narration || '',
        isDummy: inv.isDummy || false,
      };
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        nameEn: customer.nameEn,
        nameAr: customer.nameAr,
        phone: customer.phone,
        type: customer.type,
        area: customer.area,
        address: customer.address,
        creditLimit: Number(customer.creditLimit || 0),
        currentBalance: Number(customer.currentBalance || 0),
        openingBalance: Number(customer.openingBalance || 0),
        createdAt: customer.createdAt,
      },
      period: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      },
      summary: {
        invoicesCount: formattedInvoices.length,
        totalGross: Number(totalGross.toFixed(3)),
        totalDiscount: Number(totalDiscount.toFixed(3)),
        totalNet: Number(totalNet.toFixed(3)),
        totalPaid: Number(totalPaid.toFixed(3)),
        totalDue: Number(totalDue.toFixed(3)),
        currentAccountBalance: Number(customer.currentBalance || 0),
        paymentModes: {
          Cash: Number(paymentModes.Cash.toFixed(3)),
          'K-Net': Number(paymentModes['K-Net'].toFixed(3)),
          'Visa / Card': Number(paymentModes['Visa / Card'].toFixed(3)),
          Cheque: Number(paymentModes.Cheque.toFixed(3)),
          Online: Number(paymentModes.Online.toFixed(3)),
          Other: Number(paymentModes.Other.toFixed(3)),
        },
      },
      invoices: formattedInvoices,
    });
  } catch (error: any) {
    console.error('Customer statement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

