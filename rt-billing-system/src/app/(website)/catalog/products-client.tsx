'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { ProductCard } from '@/components/website/product-card';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductsClient({ products, categories, initialCategory }: { products: any[], categories: any[], initialCategory?: string }) {
  const { language, dir } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(search)}`);
    } else {
      router.push(`/catalog`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-24 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4" dir={dir}>{t.search}</h3>
              <form onSubmit={handleSearch} className="relative mb-8 text-slate-900">
                <input 
                  type="text"
                  placeholder={t.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
                  dir={dir}
                />
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </form>

              <h3 className="text-lg font-bold text-slate-900 mb-4" dir={dir}>{t.category}</h3>
              <div className="flex flex-wrap gap-2" dir={dir}>
                <a 
                  href="/catalog" 
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors ${!initialCategory ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {t.allCategories}
                </a>
                {categories.map(cat => (
                  <a 
                    key={cat.id} 
                    href={`/catalog?category=${cat.id}`}
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors ${initialCategory === cat.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {language === 'ar' && cat.nameAr ? cat.nameAr : cat.nameEn}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <h1 className="text-3xl font-bold text-slate-900 mb-8" dir={dir}>
              {t.products}
            </h1>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500 text-lg">{t.noProducts}</p>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
