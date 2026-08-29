'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { ShoppingCart, Share2, Shield, Info } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { language, dir } = useLanguage();
  const t = translations[language];

  const name = language === 'ar' && product.nameAr ? product.nameAr : product.nameEn;
  const description = language === 'ar' && product.descriptionAr ? product.descriptionAr : product.descriptionEn;
  const categoryName = product.category 
    ? (language === 'ar' && product.category.nameAr ? product.category.nameAr : product.category.nameEn)
    : '';

  const [activeImage, setActiveImage] = useState(
    product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.png'
  );

  const price = Number(product.salePrice).toFixed(3);

  const whatsappMessage = encodeURIComponent(`Hello, I am interested in purchasing the following product:\n\n*${product.nameEn}*\nCode: ${product.itemCode}\nPrice: ${price} ${t.kwd}\n\nCould you please provide more details about ${product.nameEn}?`);
  const whatsappUrl = `https://wa.me/96590997484?text=${whatsappMessage}`;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-slate-50 border-b border-slate-200 py-4 mb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-slate-500 font-medium flex items-center gap-2" dir={dir}>
            <a href="/" className="hover:text-blue-600 transition-colors">{t.home}</a>
            <span>/</span>
            <a href="/catalog" className="hover:text-blue-600 transition-colors">{t.products}</a>
            {categoryName && (
              <>
                <span>/</span>
                <a href={`/catalog?category=${product.category.id}`} className="hover:text-blue-600 transition-colors">
                  {categoryName}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Images Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="bg-slate-100 rounded-2xl p-4 sm:p-8 flex items-center justify-center aspect-square border border-slate-200">
               {activeImage !== '/placeholder-product.png' ? (
                 <img src={activeImage} alt={name} className="w-full h-full object-contain max-h-[500px]" />
               ) : (
                 <ShoppingCart size={100} className="text-slate-300" />
               )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-24 rounded-lg border-2 p-2 flex-shrink-0 bg-white transition-all ${activeImage === img ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-blue-300'}`}
                  >
                    <img src={img} alt={`${name} ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2" dir={dir}>
            {product.brand && (
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full mb-4">
                {product.brand.name}
              </span>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              {name}
            </h1>
            
            <p className="text-sm text-slate-500 mb-6">
              Item Code: {product.itemCode} {product.model && `| Model: ${product.model}`}
            </p>

            <div className="text-4xl font-bold text-slate-900 mb-8" dir="ltr">
              {price} <span className="text-xl font-normal text-slate-500">{t.kwd}</span>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[250px] bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-600/30"
              >
                <ShoppingCart size={24} />
                {t.buyNow}
              </a>
            </div>

            <div className="space-y-6">
              {description && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Info size={20} className="text-blue-600" />
                    {t.description}
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Shield size={20} className="text-blue-600" />
                  {t.specifications}
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <ul className="space-y-3 text-sm">
                    {product.brand && (
                      <li className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{t.brand}</span>
                        <span className="font-semibold text-slate-900">{product.brand.name}</span>
                      </li>
                    )}
                    {categoryName && (
                      <li className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{t.category}</span>
                        <span className="font-semibold text-slate-900">{categoryName}</span>
                      </li>
                    )}
                    {product.model && (
                      <li className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{t.model}</span>
                        <span className="font-semibold text-slate-900" dir="ltr">{product.model}</span>
                      </li>
                    )}
                    {product.origin && (
                      <li className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{t.origin}</span>
                        <span className="font-semibold text-slate-900">{product.origin}</span>
                      </li>
                    )}
                    {product.warranty && (
                      <li className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{t.warranty}</span>
                        <span className="font-semibold text-slate-900">{product.warranty}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
