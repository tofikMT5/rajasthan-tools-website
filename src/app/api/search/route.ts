import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    if (!q || q.length < 2) return NextResponse.json({ products: [], invoices: [], customers: [] });

    const numSearch = parseInt(q);

    const [products, invoices, customers] = await Promise.all([
      db.product.findMany({
        where: {
          OR: [
            { nameEn: { contains: q, mode: 'insensitive' } },
            { nameAr: { contains: q, mode: 'insensitive' } },
            { itemCode: { contains: q, mode: 'insensitive' } },
            { barcode: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      db.invoice.findMany({
        where: {
          OR: [
            { customerNameSnap: { contains: q, mode: 'insensitive' } },
            ...(isNaN(numSearch) ? [] : [{ invoiceNo: numSearch }]),
          ],
        },
        take: 5,
      }),
      db.customer.findMany({
        where: {
          OR: [
            { nameEn: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ products, invoices, customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
