import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const purchase = await db.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const purchase = await db.purchase.findUnique({ where: { id } });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const items = (purchase.items as any[]) || [];

    await db.$transaction(async (tx) => {
      // 1. Reverse stock quantities for each item
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: { decrement: Number(item.qty) },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              qty: Number(item.qty),
              refType: 'PURCHASE_CANCEL',
              refId: purchase.id,
              note: `Stock reversed for cancelled Purchase #${purchase.purchaseNo}`,
              createdBy: 'admin',
            },
          });
        }
      }

      // 2. Decrement supplier balance
      if (purchase.supplierId) {
        await tx.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            balance: { decrement: Number(purchase.total) },
          },
        });
      }

      // 3. Delete Purchase
      await tx.purchase.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
