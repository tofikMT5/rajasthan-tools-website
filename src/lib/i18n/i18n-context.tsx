'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from './en';
import { ar } from './ar';

type Language = 'en' | 'ar';
type Dictionary = typeof en;

interface I18nContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  t: (key: keyof Dictionary) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('rt_lang') as Language;
    if (savedLang === 'en' || savedLang === 'ar') {
      setLang(savedLang);
    }
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('rt_lang', newLang);
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'ar' : 'en');
  };

  const dictionary = lang === 'ar' ? ar : en;

  const t = (key: keyof Dictionary): string => {
    return dictionary[key] || en[key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ lang, dir, t, setLanguage, toggleLanguage }}>
      <div dir={dir} className={lang === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
