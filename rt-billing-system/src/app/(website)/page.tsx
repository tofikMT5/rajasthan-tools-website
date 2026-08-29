import { db } from '@/lib/db';
import { HomePageClient } from '@/components/website/home-page-client';
import { Product, Category } from '@prisma/client';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function WebsiteHomePage() {
  // Fetch featured products (showOnWebsite = true)
  const featuredProducts = await db.product.findMany({
    where: {
      showOnWebsite: true,
      status: 'ACTIVE'
    },
    include: {
      category: {
        select: { nameEn: true, nameAr: true }
      },
      brand: {
        select: { name: true }
      }
    },
    take: 8,
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch categories (showOnWebsite = true)
  const categories = await db.category.findMany({
    where: {
      showOnWebsite: true,
    },
    orderBy: {
      sortOrder: 'asc'
    },
    take: 10
  });

  // Convert Decimals to string/numbers for Client Component serialization
  const serializedProducts = featuredProducts.map(p => ({
    ...p,
    salePrice: p.salePrice.toNumber(),
    costPrice: p.costPrice.toNumber(),
    wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null,
  }));

  return (
    <HomePageClient 
      featuredProducts={serializedProducts} 
      categories={categories} 
    />
  );
}
