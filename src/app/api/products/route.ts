import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const brandId = searchParams.get('brandId') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { itemCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = productSchema.parse(body);

    const product = await db.product.create({
      data: {
        itemCode: validated.itemCode,
        barcode: validated.barcode || validated.itemCode,
        nameEn: validated.nameEn,
        nameAr: validated.nameAr,
        descriptionEn: validated.descriptionEn,
        descriptionAr: validated.descriptionAr,
        categoryId: validated.categoryId,
        brandId: validated.brandId || null,
        model: validated.model,
        unit: validated.unit,
        costPrice: validated.costPrice,
        salePrice: validated.salePrice,
        wholesalePrice: validated.wholesalePrice || null,
        stockQty: validated.stockQty,
        minStockAlert: validated.minStockAlert,
        warranty: validated.warranty,
        origin: validated.origin,
        showOnWebsite: validated.showOnWebsite,
        isFeatured: validated.isFeatured,
        status: validated.status,
        images: validated.images || [],
      },
    });

    // Log initial stock movement
    if (validated.stockQty > 0) {
      await db.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          qty: validated.stockQty,
          refType: 'INITIAL_STOCK',
          note: 'Opening stock entry',
          createdBy: 'system',
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
