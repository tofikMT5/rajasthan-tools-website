'use client';

import React from 'react';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const { language, dir } = useLanguage();
  const t = translations[language];

  const whatsappMessage = encodeURIComponent('Hello Rajasthan Tools Q8, I have an inquiry.');
  const whatsappUrl = `https://wa.me/96590997484?text=${whatsappMessage}`;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" dir={dir}>
            {t.contact}
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto" dir={dir}>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {language === 'en' ? 'Get in Touch' : 'ابقى على تواصل'}
            </h2>
            
            <div className="space-y-8">
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0 mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {language === 'en' ? 'Our Location' : 'موقعنا'}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Kuwait City, Kuwait<br />
                    (Full address available upon request)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0 mt-1">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {language === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                  </h3>
                  <p className="text-slate-600 text-lg font-medium" dir="ltr">
                    +965 9099 7484
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {language === 'en' ? 'Available on WhatsApp' : 'متوفر على الواتساب'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0 mt-1">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                  </h3>
                  <p className="text-slate-600 text-lg">
                    info@rajasthantools.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0 mt-1">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {language === 'en' ? 'Business Hours' : 'ساعات العمل'}
                  </h3>
                  <div className="text-slate-600 space-y-1">
                    <p>{language === 'en' ? 'Saturday - Thursday: 8:00 AM - 8:00 PM' : 'السبت - الخميس: 8:00 صباحاً - 8:00 مساءً'}</p>
                    <p>{language === 'en' ? 'Friday: Closed' : 'الجمعة: مغلق'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Action / Map Area */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-center text-center items-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {language === 'en' ? 'Fastest way to reach us?' : 'أسرع طريقة للوصول إلينا؟'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md">
              {language === 'en' 
                ? 'Send us a message directly on WhatsApp for the quickest response regarding products, prices, and availability.' 
                : 'أرسل لنا رسالة مباشرة على الواتساب للحصول على أسرع استجابة بخصوص المنتجات والأسعار والتوافر.'}
            </p>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white py-4 px-10 rounded-xl font-bold text-lg flex items-center gap-3 transition-colors shadow-lg shadow-green-600/30"
            >
              <Send size={20} />
              {language === 'en' ? 'Message on WhatsApp' : 'رسالة على الواتساب'}
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
