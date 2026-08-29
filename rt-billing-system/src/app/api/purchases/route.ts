import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const supplierId = searchParams.get('supplierId') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { purchaseNo: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (supplierId) where.supplierId = supplierId;

    const purchases = await db.purchase.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(purchases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierId, purchaseNo, date, notes, items, total } = body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Supplier and at least 1 item are required' }, { status: 400 });
    }

    const generatedNo = purchaseNo || `PUR-${Date.now()}`;

    // 1. Create Purchase record first
    const purchase = await db.purchase.create({
      data: {
        purchaseNo: generatedNo,
        supplierId,
        date: date ? new Date(date) : new Date(),
        total: Number(total),
        notes: notes || null,
        items: items,
      },
      include: {
        supplier: true,
      },
    });

    // 2. Prepare array of update queries for products & stock movements
    const productUpdatePromises = items.map((item: any) =>
      db.product.update({
        where: { id: item.productId },
        data: {
          stockQty: { increment: Number(item.qty) },
          costPrice: Number(item.costPrice),
        },
      })
    );

    const stockMovementPromises = items.map((item: any) =>
      db.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'IN',
          qty: Number(item.qty),
          refType: 'PURCHASE',
          refId: purchase.id,
          note: `Stock intake from Purchase #${generatedNo}`,
          createdBy: 'admin',
        },
      })
    );

    // 3. Prepare supplier balance update
    const supplierUpdatePromise = db.supplier.update({
      where: { id: supplierId },
      data: {
        balance: { increment: Number(total) },
      },
    });

    // 4. Execute all updates in a fast parallel transaction batch
    await db.$transaction([
      ...productUpdatePromises,
      ...stockMovementPromises,
      supplierUpdatePromise,
    ]);

    return NextResponse.json(purchase, { status: 201 });

  } catch (error: any) {
    console.error('Purchase creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
