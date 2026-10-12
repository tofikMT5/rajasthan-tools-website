import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const voucher = await (db as any).pettyCashVoucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json({ error: 'Petty cash voucher not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...voucher,
      amount: Number(voucher.amount),
      runningBalance: Number(voucher.runningBalance),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      voucherNo,
      date,
      type,
      paidTo,
      paymentMethod,
      category,
      description,
      amount,
      preparedBy,
      approvedBy,
      receivedBy,
      status,
    } = body;

    const existing = await (db as any).pettyCashVoucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Petty cash voucher not found' }, { status: 404 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount greater than 0' }, { status: 400 });
    }

    // Check if voucherNo is being changed and if new voucherNo collides
    if (voucherNo && voucherNo.trim() !== existing.voucherNo) {
      const duplicate = await (db as any).pettyCashVoucher.findUnique({
        where: { voucherNo: voucherNo.trim() },
      });
      if (duplicate) {
        return NextResponse.json({ error: `Voucher number ${voucherNo} already exists` }, { status: 400 });
      }
    }

    const updated = await (db as any).pettyCashVoucher.update({
      where: { id },
      data: {
        ...(voucherNo ? { voucherNo: voucherNo.trim() } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(type ? { type: type === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT' } : {}),
        ...(paidTo ? { paidTo: paidTo.trim() } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
        ...(category ? { category: category.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(amount ? { amount: numAmount } : {}),
        ...(preparedBy !== undefined ? { preparedBy: preparedBy ? preparedBy.trim() : null } : {}),
        ...(approvedBy !== undefined ? { approvedBy: approvedBy ? approvedBy.trim() : null } : {}),
        ...(receivedBy !== undefined ? { receivedBy: receivedBy ? receivedBy.trim() : null } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      voucher: {
        ...updated,
        amount: Number(updated.amount),
        runningBalance: Number(updated.runningBalance),
      },
    });
  } catch (error: any) {
    console.error('Error updating petty cash voucher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await (db as any).pettyCashVoucher.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Petty cash voucher not found' }, { status: 404 });
    }

    await (db as any).pettyCashVoucher.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Voucher ${existing.voucherNo} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting petty cash voucher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
