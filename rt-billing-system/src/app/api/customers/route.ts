import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customerSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;

    const customers = await db.customer.findMany({
      where,
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = customerSchema.parse(body);

    const customer = await db.customer.create({
      data: {
        nameEn: validated.nameEn,
        nameAr: validated.nameAr,
        phone: validated.phone,
        altPhone: validated.altPhone,
        email: validated.email || null,
        companyName: validated.companyName,
        civilId: validated.civilId,
        address: validated.address,
        addressAr: validated.addressAr,
        area: validated.area,
        type: validated.type,
        creditLimit: validated.creditLimit,
        openingBalance: validated.openingBalance,
        currentBalance: validated.openingBalance,
        tradeLicense: validated.tradeLicense,
        notes: validated.notes,
        referredBy: validated.referredBy,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
