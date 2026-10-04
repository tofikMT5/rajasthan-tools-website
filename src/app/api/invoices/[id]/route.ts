import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
        salesman: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // 1. Restore stock quantities
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            qty: item.qty,
            refType: 'INVOICE_CANCEL',
            refId: invoice.id,
            note: `Stock restored from deleted Invoice #RT-${invoice.invoiceNo}`,
            createdBy: 'admin',
          }
        });
      }

      // 2. Restore customer balance if credit was given
      if (invoice.customerId && Number(invoice.dueAmount) > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: { currentBalance: { decrement: Number(invoice.dueAmount) } }
        });
      }

      // 3. Delete invoice (cascade deletes items and payments)
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const invoice = await db.invoice.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
        salesman: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
