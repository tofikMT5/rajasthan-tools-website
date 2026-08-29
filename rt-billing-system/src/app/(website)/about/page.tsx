'use client';

import React from 'react';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { ShieldCheck, Truck, Users, Award } from 'lucide-react';

export default function AboutPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" dir={dir}>
            {t.about}
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto" dir={dir}>
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
              {language === 'en' ? 'Welcome to Rajasthan Tools Q8' : 'مرحباً بكم في أدوات راجستان الكويت'}
            </h2>
            <div className="text-lg text-slate-600 leading-relaxed space-y-6">
              <p>
                {language === 'en' 
                  ? 'Rajasthan Tools Q8 is a premier supplier of high-quality industrial tools, hardware, and construction equipment in Kuwait. With years of experience serving both professional contractors and DIY enthusiasts, we have built a reputation for reliability, quality, and exceptional customer service.'
                  : 'أدوات راجستان الكويت هي المورد الأول للأدوات الصناعية والأجهزة ومعدات البناء عالية الجودة في الكويت. بفضل سنوات من الخبرة في خدمة المقاولين المحترفين وهواة الأعمال اليدوية، قمنا ببناء سمعة طيبة من حيث الموثوقية والجودة وخدمة العملاء الاستثنائية.'}
              </p>
              <p>
                {language === 'en'
                  ? 'Our comprehensive catalog features top global brands, ensuring that our customers have access to the best tools for any job. Whether you are working on a massive construction project or a small home repair, we have exactly what you need.'
                  : 'يضم الكتالوج الشامل الخاص بنا أفضل العلامات التجارية العالمية، مما يضمن حصول عملائنا على أفضل الأدوات لأي وظيفة. سواء كنت تعمل في مشروع بناء ضخم أو إصلاح منزلي صغير، فلدينا ما تحتاجه بالضبط.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.qualityAssured}</h3>
              <p className="text-slate-600">{t.qualityDesc}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.expertSupport}</h3>
              <p className="text-slate-600">{t.expertDesc}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.fastDelivery}</h3>
              <p className="text-slate-600">{t.fastDesc}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {language === 'en' ? 'Trusted Brands' : 'علامات تجارية موثوقة'}
              </h3>
              <p className="text-slate-600">
                {language === 'en' ? 'We partner with the world\'s leading tool manufacturers.' : 'نحن نتشارك مع الشركات الرائدة في تصنيع الأدوات في العالم.'}
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
