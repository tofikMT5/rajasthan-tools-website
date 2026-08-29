'use client';

import React from 'react';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Rajasthan Tools Q8</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-sm">
              {t.welcomeSubtitle}
            </p>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">{t.contactUs}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-blue-500" />
                <span>Kuwait City, Kuwait</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-blue-500" />
                <span dir="ltr">+965 9099 7484</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-blue-500" />
                <span>info@rajasthantools.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-4">Business Hours</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Saturday - Thursday: 8:00 AM - 8:00 PM</p>
              <p>Friday: Closed</p>
            </div>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Rajasthan Tools Q8. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
