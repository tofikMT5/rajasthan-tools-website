import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { OR: [{ nameEn: { not: '' } }] },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = categorySchema.parse(body);

    const category = await db.category.create({
      data: {
        nameEn: validated.nameEn,
        nameAr: validated.nameAr,
        slug: validated.slug,
        icon: validated.icon || '📦',
        parentId: validated.parentId || null,
        showOnWebsite: validated.showOnWebsite,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
