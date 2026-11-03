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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      supplierId, 
      date, 
      notes, 
      items, 
      total,
      subtotal,
      discount,
      paidAmount,
      dueAmount,
      paymentMethod,
      status 
    } = body;

    const existingPurchase = await db.purchase.findUnique({ where: { id } });
    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const oldItems = (existingPurchase.items as any[]) || [];
    const numTotal = Number(total);
    const numSubtotal = subtotal !== undefined ? Number(subtotal) : (existingPurchase.subtotal ? Number(existingPurchase.subtotal) : numTotal);
    const numDiscount = discount !== undefined ? Number(discount) : (existingPurchase.discount ? Number(existingPurchase.discount) : 0);
    const numPaid = paidAmount !== undefined ? Number(paidAmount) : (existingPurchase.paidAmount ? Number(existingPurchase.paidAmount) : numTotal);
    const numDue = dueAmount !== undefined ? Number(dueAmount) : (existingPurchase.dueAmount ? Number(existingPurchase.dueAmount) : 0);

    await db.$transaction(async (tx) => {
      // 1. Revert old stock
      for (const oldItem of oldItems) {
        if (oldItem.productId) {
          await tx.product.update({
            where: { id: oldItem.productId },
            data: { stockQty: { decrement: Number(oldItem.qty) } }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: oldItem.productId,
              type: 'OUT',
              qty: Number(oldItem.qty),
              refType: 'PURCHASE_EDIT_REVERT',
              refId: existingPurchase.id,
              note: `Reverted stock for editing Purchase #${existingPurchase.purchaseNo}`,
              createdBy: 'admin',
            }
          });
        }
      }

      // 2. Revert old supplier balance
      if (existingPurchase.supplierId) {
        await tx.supplier.update({
          where: { id: existingPurchase.supplierId },
          data: { balance: { decrement: Number(existingPurchase.total) } }
        });
      }

      // 3. Update Purchase record
      const updatedPurchase = await tx.purchase.update({
        where: { id },
        data: {
          supplierId,
          date: date ? new Date(date) : existingPurchase.date,
          subtotal: numSubtotal,
          discount: numDiscount,
          total: numTotal,
          paidAmount: numPaid,
          dueAmount: numDue,
          paymentMethod: paymentMethod || existingPurchase.paymentMethod || 'Cash',
          status: status || existingPurchase.status || 'PAID',
          notes: notes !== undefined ? notes : existingPurchase.notes,
          items: items,
        }
      });

      // 4. Apply new stock
      for (const newItem of items) {
        if (newItem.productId) {
          await tx.product.update({
            where: { id: newItem.productId },
            data: {
              stockQty: { increment: Number(newItem.qty) },
              costPrice: Number(newItem.costPrice),
            }
          });

          await tx.stockMovement.create({
            data: {
              productId: newItem.productId,
              type: 'IN',
              qty: Number(newItem.qty),
              refType: 'PURCHASE_EDIT_APPLY',
              refId: updatedPurchase.id,
              note: `Applied new stock for edited Purchase #${existingPurchase.purchaseNo}`,
              createdBy: 'admin',
            }
          });
        }
      }

      // 5. Apply new supplier balance
      if (supplierId) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: { balance: { increment: Number(total) } }
        });
      }
    });

    const finalPurchase = await db.purchase.findUnique({
      where: { id },
      include: { supplier: true }
    });

    return NextResponse.json(finalPurchase);
  } catch (error: any) {
    console.error('Purchase edit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const existing = await db.purchase.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const updateData: any = { status };
    if (status === 'PAID') {
      updateData.paidAmount = existing.total;
      updateData.dueAmount = 0;
    } else if (status === 'UNPAID') {
      updateData.paidAmount = 0;
      updateData.dueAmount = existing.total;
    }

    const purchase = await db.purchase.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
