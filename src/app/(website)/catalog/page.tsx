import { db } from '@/lib/db';
import { ProductsClient } from './products-client';

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const whereClause: any = {
    showOnWebsite: true,
    status: 'ACTIVE',
  };

  if (resolvedSearchParams.category) {
    whereClause.categoryId = resolvedSearchParams.category;
  }

  if (resolvedSearchParams.search) {
    whereClause.OR = [
      { nameEn: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { nameAr: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { itemCode: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
    ];
  }

  const products = await db.product.findMany({
    where: whereClause,
    include: {
      category: { select: { nameEn: true, nameAr: true } },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    where: { showOnWebsite: true },
    orderBy: { sortOrder: 'asc' },
  });

  const serializedProducts = products.map(p => ({
    ...p,
    salePrice: p.salePrice.toNumber(),
    costPrice: p.costPrice.toNumber(),
    wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null,
  }));

  return (
    <ProductsClient 
      products={serializedProducts} 
      categories={categories}
      initialCategory={resolvedSearchParams.category}
    />
  );
}
