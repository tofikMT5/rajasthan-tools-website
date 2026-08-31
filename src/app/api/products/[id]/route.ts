import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = productSchema.parse(body);

    const product = await db.product.update({
      where: { id },
      data: {
        itemCode: validated.itemCode,
        barcode: validated.barcode || validated.itemCode,
        nameEn: validated.nameEn,
        nameAr: validated.nameAr,
        categoryId: validated.categoryId,
        unit: validated.unit,
        costPrice: validated.costPrice,
        salePrice: validated.salePrice,
        wholesalePrice: validated.wholesalePrice || null,
        stockQty: validated.stockQty,
        minStockAlert: validated.minStockAlert,
        origin: validated.origin,
        images: validated.images || [],
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
