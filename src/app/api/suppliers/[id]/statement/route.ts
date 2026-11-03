import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const supplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Date range filtering
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    // Default: last 60 days (2 months) if not specified
    const defaultFrom = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const fromDate = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : defaultFrom;
    const toDate = toParam ? new Date(`${toParam}T23:59:59.999Z`) : new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');

    // Build query for purchases
    const whereClause: any = {
      supplierId: supplier.id,
    };

    if (fromParam || toParam) {
      whereClause.date = {
        gte: fromDate,
        lte: toDate,
      };
    }

    // Fetch purchases within date range
    const purchases = await db.purchase.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc', // Chronological statement order
      },
    });

    // Compute summary metrics for the selected period
    let totalGross = 0;
    let totalDiscount = 0;
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    const paymentModes: Record<string, number> = {
      Cash: 0,
      'K-Net': 0,
      'Visa / Card': 0,
      Cheque: 0,
      Other: 0,
    };

    const formattedPurchases = purchases.map((p) => {
      const gross = Number(p.subtotal ?? p.total ?? 0);
      const discount = Number(p.discount ?? 0);
      const net = Number(p.total ?? 0);
      const normStatus = (p.status || 'PAID').toUpperCase();

      let paid = 0;
      let due = 0;

      if (normStatus === 'PAID') {
        paid = net;
        due = 0;
      } else if (normStatus === 'UNPAID') {
        paid = 0;
        due = net;
      } else if (normStatus === 'PARTIAL') {
        const storedPaid = Number(p.paidAmount ?? 0);
        paid = storedPaid > 0 ? storedPaid : 0;
        due = Math.max(0, Number((net - paid).toFixed(3)));
      } else {
        const storedPaid = Number(p.paidAmount ?? 0);
        const storedDue = Number(p.dueAmount ?? 0);
        if (storedPaid > 0 && storedDue === 0) {
          paid = net;
          due = 0;
        } else {
          paid = storedPaid;
          due = storedDue > 0 ? storedDue : Math.max(0, net - paid);
        }
      }

      totalGross += gross;
      totalDiscount += discount;
      totalPurchases += net;
      totalPaid += paid;
      totalDue += due;

      if (due <= 0) {
        paidCount += 1;
      } else {
        unpaidCount += 1;
      }

      // Allocate to payment modes
      const method = p.paymentMethod || 'Cash';
      const mUpper = method.toUpperCase();
      if (paid > 0) {
        if (mUpper.includes('KNET') || mUpper.includes('K-NET')) {
          paymentModes['K-Net'] += paid;
        } else if (mUpper.includes('VISA') || mUpper.includes('CARD')) {
          paymentModes['Visa / Card'] += paid;
        } else if (mUpper.includes('CHEQUE')) {
          paymentModes['Cheque'] += paid;
        } else if (mUpper.includes('CASH')) {
          paymentModes['Cash'] += paid;
        } else {
          paymentModes['Other'] += paid;
        }
      }

      const items = (p.items as any[]) || [];

      return {
        id: p.id,
        purchaseNo: p.purchaseNo,
        date: p.date,
        status: normStatus,
        paymentMethod: method,
        grossAmount: gross,
        discountAmount: discount,
        totalAmount: net,
        paidAmount: paid,
        dueAmount: due,
        itemsCount: items.length,
        notes: p.notes || '',
      };
    });

    return NextResponse.json({
      supplier: {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        balance: Number(supplier.balance || 0),
        createdAt: supplier.createdAt,
      },
      period: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
      },
      summary: {
        purchasesCount: formattedPurchases.length,
        paidPurchasesCount: paidCount,
        unpaidPurchasesCount: unpaidCount,
        totalGross: Number(totalGross.toFixed(3)),
        totalDiscount: Number(totalDiscount.toFixed(3)),
        totalPurchases: Number(totalPurchases.toFixed(3)),
        totalPaid: Number(totalPaid.toFixed(3)),
        totalDue: Number(totalDue.toFixed(3)),
        currentSupplierBalance: Number(supplier.balance || 0),
        paymentModes: {
          Cash: Number(paymentModes.Cash.toFixed(3)),
          'K-Net': Number(paymentModes['K-Net'].toFixed(3)),
          'Visa / Card': Number(paymentModes['Visa / Card'].toFixed(3)),
          Cheque: Number(paymentModes.Cheque.toFixed(3)),
          Other: Number(paymentModes.Other.toFixed(3)),
        },
      },
      purchases: formattedPurchases,
    });
  } catch (error: any) {
    console.error('Supplier statement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
