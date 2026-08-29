import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await db.product.findUnique({
    where: {
      id: id,
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
    }
  });

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    ...product,
    salePrice: product.salePrice.toNumber(),
    costPrice: product.costPrice.toNumber(),
    wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toNumber() : null,
  };

  return <ProductDetailClient product={serializedProduct} />;
}
