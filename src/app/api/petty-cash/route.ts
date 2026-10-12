import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build filter where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { voucherNo: { contains: search, mode: 'insensitive' } },
        { paidTo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // 1. Fetch all vouchers ordered chronologically (oldest to newest) to calculate sequential running balances
    const allChronological = await (db as any).pettyCashVoucher.findMany({
      orderBy: [
        { date: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    let cumulativeBalance = 0;
    let globalTotalIn = 0;
    let globalTotalOut = 0;

    const vouchersWithRunningBalanceMap = new Map<string, number>();

    for (const v of allChronological) {
      const amt = Number(v.amount) || 0;
      if (v.type === 'RECEIPT') {
        cumulativeBalance += amt;
        globalTotalIn += amt;
      } else {
        cumulativeBalance -= amt;
        globalTotalOut += amt;
      }
      vouchersWithRunningBalanceMap.set(v.id, cumulativeBalance);
    }

    // 2. Fetch filtered records
    const filteredVouchers = await (db as any).pettyCashVoucher.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // 3. Attach running balance and format response
    const enrichedVouchers = filteredVouchers.map((v: any) => ({
      ...v,
      amount: Number(v.amount),
      runningBalance: vouchersWithRunningBalanceMap.get(v.id) ?? Number(v.runningBalance),
    }));

    // Filter-specific totals
    let filteredTotalIn = 0;
    let filteredTotalOut = 0;
    for (const v of enrichedVouchers) {
      if (v.type === 'RECEIPT') {
        filteredTotalIn += v.amount;
      } else {
        filteredTotalOut += v.amount;
      }
    }

    return NextResponse.json({
      vouchers: enrichedVouchers,
      summary: {
        currentBalance: cumulativeBalance,
        totalCashIn: globalTotalIn,
        totalCashOut: globalTotalOut,
        totalCount: allChronological.length,
        filteredTotalIn,
        filteredTotalOut,
        filteredCount: enrichedVouchers.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching petty cash vouchers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      voucherNo: customVoucherNo,
      date,
      type = 'PAYMENT',
      paidTo,
      paymentMethod = 'Cash',
      category,
      description,
      amount,
      preparedBy,
      approvedBy,
      receivedBy,
      status = 'APPROVED',
    } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount greater than 0' }, { status: 400 });
    }

    if (!paidTo || !paidTo.trim()) {
      return NextResponse.json({ error: 'Paid To / Received From name is required' }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Expense Category is required' }, { status: 400 });
    }

    let finalVoucherNo = customVoucherNo?.trim();

    // Auto-generate voucher number if not provided
    if (!finalVoucherNo) {
      const prefix = type === 'RECEIPT' ? 'PCR' : 'PCV';
      const existing = await (db as any).pettyCashVoucher.findMany({
        where: { voucherNo: { startsWith: prefix } },
        select: { voucherNo: true },
      });

      let maxNum = 0;
      for (const item of existing) {
        const match = item.voucherNo.match(new RegExp(`${prefix}-(\\d+)`, 'i'));
        if (match && match[1]) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }
      const nextNum = maxNum + 1;
      finalVoucherNo = `${prefix}-${String(nextNum).padStart(4, '0')}`;
    }

    // Check uniqueness of voucherNo
    const existingVoucher = await (db as any).pettyCashVoucher.findUnique({
      where: { voucherNo: finalVoucherNo },
    });

    if (existingVoucher) {
      return NextResponse.json({ error: `Voucher number ${finalVoucherNo} already exists. Please choose a different number.` }, { status: 400 });
    }

    const created = await (db as any).pettyCashVoucher.create({
      data: {
        voucherNo: finalVoucherNo,
        date: date ? new Date(date) : new Date(),
        type: type === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT',
        paidTo: paidTo.trim(),
        paymentMethod: paymentMethod || 'Cash',
        category: category.trim(),
        description: (description || '').trim(),
        amount: numAmount,
        preparedBy: preparedBy ? preparedBy.trim() : null,
        approvedBy: approvedBy ? approvedBy.trim() : null,
        receivedBy: receivedBy ? receivedBy.trim() : null,
        status: status || 'APPROVED',
      },
    });

    return NextResponse.json({
      success: true,
      voucher: {
        ...created,
        amount: Number(created.amount),
      },
    });
  } catch (error: any) {
    console.error('Error creating petty cash voucher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
