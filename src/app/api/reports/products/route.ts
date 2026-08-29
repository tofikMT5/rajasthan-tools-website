import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        invoiceItems: {
          where: {
            invoice: {
              isDeleted: false
            }
          }
        }
      }
    });

    const reportData = products.map((p) => {
      let totalQty = 0;
      let totalRevenue = 0;
      
      p.invoiceItems.forEach(item => {
        totalQty += item.qty;
        totalRevenue += Number(item.amount);
      });

      return {
        id: p.id,
        itemCode: p.itemCode,
        barcode: p.barcode,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        category: p.category.nameEn,
        totalQtySold: totalQty,
        totalRevenue: totalRevenue,
        currentStock: p.stockQty,
      };
    });

    // Sort by revenue desc
    reportData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json(reportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
