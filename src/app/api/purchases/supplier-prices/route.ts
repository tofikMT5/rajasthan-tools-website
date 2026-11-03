import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || '';
    const query = searchParams.get('query') || searchParams.get('search') || '';

    // 1. Find matching products
    let matchingProducts: any[] = [];
    let selectedProduct: any = null;

    if (productId) {
      selectedProduct = await db.product.findUnique({
        where: { id: productId },
        include: { category: true, supplier: true },
      });
      if (selectedProduct) {
        matchingProducts = [selectedProduct];
      }
    } else if (query.trim()) {
      const q = query.trim().toLowerCase();
      matchingProducts = await db.product.findMany({
        where: {
          AND: [
            { itemCode: { not: 'DUMMY' } },
            {
              OR: [
                { nameEn: { contains: q, mode: 'insensitive' } },
                { nameAr: { contains: q, mode: 'insensitive' } },
                { itemCode: { contains: q, mode: 'insensitive' } },
                { barcode: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: { category: true, supplier: true },
        take: 15,
      });

      if (matchingProducts.length > 0) {
        selectedProduct = matchingProducts[0];
      }
    } else {
      // Default: fetch recently purchased products for quick display
      matchingProducts = await db.product.findMany({
        where: { itemCode: { not: 'DUMMY' } },
        orderBy: { updatedAt: 'desc' },
        take: 8,
      });
      if (matchingProducts.length > 0) {
        selectedProduct = matchingProducts[0];
      }
    }

    if (!selectedProduct) {
      return NextResponse.json({
        product: null,
        matchingProducts: [],
        suppliers: [],
        history: [],
        summary: null,
      });
    }

    // 2. Fetch all purchases to find matching items
    const allPurchases = await db.purchase.findMany({
      include: {
        supplier: true,
      },
      orderBy: { date: 'desc' },
    });

    const history: any[] = [];
    for (const p of allPurchases) {
      const items = (p.items as any[]) || [];
      for (const item of items) {
        const isMatch =
          (item.productId && item.productId === selectedProduct.id) ||
          (item.itemCode && selectedProduct.itemCode && item.itemCode.toLowerCase() === selectedProduct.itemCode.toLowerCase());

        if (isMatch) {
          history.push({
            purchaseId: p.id,
            purchaseNo: p.purchaseNo,
            date: p.date,
            status: p.status,
            supplierId: p.supplierId,
            supplierName: p.supplier?.name || 'Unknown Supplier',
            supplierPhone: p.supplier?.phone || '',
            costPrice: Number(item.costPrice),
            qty: Number(item.qty),
            unit: item.unit || 'PCS',
            lineTotal: Number(item.lineTotal || item.costPrice * item.qty),
          });
        }
      }
    }

    if (history.length === 0) {
      return NextResponse.json({
        product: selectedProduct,
        matchingProducts,
        suppliers: [],
        history: [],
        summary: {
          lowestCostPrice: Number(selectedProduct.costPrice || 0),
          lowestSupplierName: selectedProduct.supplier?.name || 'Primary Supplier',
          latestCostPrice: Number(selectedProduct.costPrice || 0),
          latestSupplierName: selectedProduct.supplier?.name || 'Primary Supplier',
          highestCostPrice: Number(selectedProduct.costPrice || 0),
          totalPurchasesCount: 0,
          totalQtyBought: 0,
          hasPurchaseHistory: false,
        },
      });
    }

    // 3. Compute stats across suppliers
    const costPrices = history.map((h) => h.costPrice);
    const lowestCostPrice = Math.min(...costPrices);
    const highestCostPrice = Math.max(...costPrices);
    const latestCostPrice = history[0].costPrice;
    const latestSupplierName = history[0].supplierName;
    const lowestMatch = history.find((h) => h.costPrice === lowestCostPrice);
    const lowestSupplierName = lowestMatch ? lowestMatch.supplierName : 'Unknown';
    const totalQtyBought = history.reduce((acc, h) => acc + h.qty, 0);

    // Group by supplier
    const supplierMap = new Map<string, any>();
    for (const h of history) {
      const existing = supplierMap.get(h.supplierId);
      if (!existing) {
        supplierMap.set(h.supplierId, {
          supplierId: h.supplierId,
          supplierName: h.supplierName,
          supplierPhone: h.supplierPhone,
          minPrice: h.costPrice,
          maxPrice: h.costPrice,
          lastPrice: h.costPrice,
          lastDate: h.date,
          totalQty: h.qty,
          purchaseCount: 1,
        });
      } else {
        existing.minPrice = Math.min(existing.minPrice, h.costPrice);
        existing.maxPrice = Math.max(existing.maxPrice, h.costPrice);
        existing.totalQty += h.qty;
        existing.purchaseCount += 1;
      }
    }

    const suppliers = Array.from(supplierMap.values())
      .map((s) => ({
        ...s,
        isLowest: s.minPrice === lowestCostPrice,
      }))
      .sort((a, b) => a.minPrice - b.minPrice);

    return NextResponse.json({
      product: selectedProduct,
      matchingProducts,
      suppliers,
      history,
      summary: {
        lowestCostPrice,
        lowestSupplierName,
        latestCostPrice,
        latestSupplierName,
        highestCostPrice,
        totalPurchasesCount: history.length,
        totalQtyBought,
        hasPurchaseHistory: true,
      },
    });
  } catch (error: any) {
    console.error('Supplier prices comparison error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

