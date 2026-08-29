'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/website/LanguageProvider';
import { translations } from '@/lib/translations';
import { Globe, Wrench, Home, Package, Info, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: t.home, icon: Home },
    { href: '/catalog', label: t.products, icon: Package },
    { href: '/about', label: t.about, icon: Info },
    { href: '/contact', label: t.contact, icon: Phone },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Wrench size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Rajasthan Tools <span className="text-blue-600">Q8</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? 'text-blue-600' : 'text-slate-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Toggle Language"
            >
              <Globe size={18} className="text-blue-600" />
              <span className="font-semibold text-sm">
                {language === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
          </div>

        </div>
      </div>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[60]">
        <div className="flex justify-around items-center h-16 px-2 pb-safe">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                <span className="text-[10px] font-bold">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
