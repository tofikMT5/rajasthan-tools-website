import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      include: {
        _count: {
          select: { products: true, purchases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(suppliers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, address } = body;

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }

    const supplier = await db.supplier.create({
      data: { name, phone, email, address },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
