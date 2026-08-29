import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session?.user || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin role required to wipe test data.' }, { status: 403 });
    }

    const userId = (session.user as any).id || 'admin';
    const { options } = await req.json().catch(() => ({ options: {} }));

    await db.$transaction(async (tx) => {
      // Delete transactional invoice data
      await tx.invoiceItem.deleteMany({});
      await tx.payment.deleteMany({});
      await tx.invoice.deleteMany({});

      // Delete purchases & stock movements
      await tx.stockMovement.deleteMany({});
      await tx.purchase.deleteMany({});
      await tx.activityLog.deleteMany({});

      // Reset invoice number counter in settings
      await tx.settings.updateMany({
        data: { currentInvoiceNo: 1000 },
      });

      // Delete non-default test customers
      await tx.customer.deleteMany({
        where: {
          phone: { not: '90000000' },
        },
      });

      // Reset customer balances for remaining customers
      await tx.customer.updateMany({
        data: { currentBalance: 0, openingBalance: 0 },
      });

      // Reset supplier balances
      await tx.supplier.updateMany({
        data: { balance: 0 },
      });

      // If requested to wipe test products
      if (options?.wipeProducts) {
        await tx.product.deleteMany({});
      } else {
        await tx.product.updateMany({
          data: { stockQty: 0 },
        });
      }

      // Record clean activity log
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'WIPE_DATA',
          entityType: 'SYSTEM',
          details: { message: 'Super Admin wiped all transactional test data for production handover.' },
        },
      });
    });

    return NextResponse.json({ success: true, message: 'All test data wiped successfully.' });
  } catch (error: any) {
    console.error('Data wipe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
