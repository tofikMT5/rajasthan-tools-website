'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    itemCode?: string;
    nameEn: string;
    nameAr: string;
    images: string[];
    salePrice: number;
    category?: {
      nameEn: string;
      nameAr: string;
    };
    brand?: {
      name: string;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, dir } = useLanguage();
  const t = translations[language];

  const name = language === 'ar' && product.nameAr ? product.nameAr : product.nameEn;
  const categoryName = product.category 
    ? (language === 'ar' && product.category.nameAr ? product.category.nameAr : product.category.nameEn)
    : '';

  const imageUrl = product.images.length > 0 ? product.images[0] : '/placeholder-product.png';

  const price = Number(product.salePrice).toFixed(3);

  const whatsappMessage = encodeURIComponent(`Hello, I am interested in purchasing the following product:\n\n*${product.nameEn}*\nCode: ${product.itemCode}\nPrice: ${price} ${t.kwd}\n\nCould you please provide more details about ${product.nameEn}?`);
  const whatsappUrl = `https://wa.me/96590997484?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative aspect-square bg-slate-100 overflow-hidden p-4">
        {imageUrl !== '/placeholder-product.png' ? (
           <img 
             src={imageUrl} 
             alt={name}
             className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
           />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
             <ShoppingCart size={48} className="opacity-20" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {categoryName && (
          <span className="text-xs font-semibold text-blue-600 mb-2 tracking-wide uppercase">
            {categoryName}
          </span>
        )}
        
        <Link href={`/catalog/${product.id}`} className="block mb-2 flex-grow">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" dir={dir}>
            {name}
          </h3>
        </Link>
        
        {product.brand && (
          <div className="text-sm text-slate-500 mb-4 font-medium">
            {t.brand}: {product.brand.name}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="font-bold text-xl text-slate-900" dir="ltr">
            {price} <span className="text-sm font-normal text-slate-500 ml-1">{t.kwd}</span>
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2.5 transition-colors shadow-sm"
            aria-label={t.buyNow}
            title={t.buyNow}
          >
            <ShoppingCart size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
