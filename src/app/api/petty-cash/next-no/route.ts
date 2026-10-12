import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'PAYMENT';
    const prefix = type === 'RECEIPT' ? 'PCR' : 'PCV';

    // Find all vouchers with this prefix to calculate next sequential number
    const vouchers = await (db as any).pettyCashVoucher.findMany({
      where: {
        voucherNo: {
          startsWith: prefix,
        },
      },
      select: { voucherNo: true },
    });

    let maxNum = 0;
    for (const v of vouchers) {
      const match = v.voucherNo.match(new RegExp(`${prefix}-(\\d+)`, 'i'));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNumber = maxNum + 1;
    const padded = String(nextNumber).padStart(4, '0');
    const nextVoucherNo = `${prefix}-${padded}`;

    return NextResponse.json({ nextVoucherNo, nextNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
