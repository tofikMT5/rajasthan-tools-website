'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { ProductCard } from '@/components/website/product-card';
import { ArrowRight, ShieldCheck, Headset, Truck } from 'lucide-react';

interface HomePageClientProps {
  featuredProducts: any[];
  categories: any[];
}

export function HomePageClient({ featuredProducts, categories }: HomePageClientProps) {
  const { language, dir } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 lg:py-32 relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight" dir={dir}>
                {t.welcomeTitle}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed" dir={dir}>
                {t.welcomeSubtitle}
              </p>
              <div className="flex flex-wrap gap-4" dir={dir}>
                <Link 
                  href="/catalog" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {t.exploreProducts}
                  {language === 'en' && <ArrowRight size={20} />}
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 hidden lg:flex justify-center relative items-center h-full">
              <style>{`
                @keyframes float-tool {
                  0% { transform: translateY(0px) rotate(-2deg); }
                  50% { transform: translateY(-20px) rotate(2deg); }
                  100% { transform: translateY(0px) rotate(-2deg); }
                }
                .animate-float-tool {
                  animation: float-tool 5s ease-in-out infinite;
                }
              `}</style>
              <div className="relative w-[400px] h-[400px] animate-float-tool flex items-center justify-center">
                <img 
                  src="/hero-drill.jpg" 
                  alt="Professional Tool" 
                  className="max-w-full max-h-full object-contain mix-blend-lighten opacity-95"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Optional - showing just an elegant strip) */}
      {categories.length > 0 && (
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide">
              {categories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={`/catalog?category=${cat.id}`}
                  className="flex-shrink-0 px-6 py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full text-slate-700 font-semibold transition-colors"
                >
                  {language === 'ar' && cat.nameAr ? cat.nameAr : cat.nameEn}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900" dir={dir}>
                {t.featuredProducts}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mt-4 rounded-full"></div>
            </div>
            <Link href="/catalog" className="hidden sm:flex text-blue-600 hover:text-blue-800 font-semibold items-center gap-1 transition-colors">
              {t.allCategories} {language === 'en' && <ArrowRight size={16} />}
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-lg">{t.noProducts}</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900" dir={dir}>{t.whyChooseUs}</h2>
            <div className="w-20 h-1 bg-blue-600 mt-4 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" dir={dir}>{t.qualityAssured}</h3>
              <p className="text-slate-600 leading-relaxed" dir={dir}>{t.qualityDesc}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Headset size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" dir={dir}>{t.expertSupport}</h3>
              <p className="text-slate-600 leading-relaxed" dir={dir}>{t.expertDesc}</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" dir={dir}>{t.fastDelivery}</h3>
              <p className="text-slate-600 leading-relaxed" dir={dir}>{t.fastDesc}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
