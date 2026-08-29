import React from 'react';
import { LanguageProvider } from '@/components/website/LanguageProvider';
import { Navbar } from '@/components/website/navbar';
import { Footer } from '@/components/website/footer';

export const metadata = {
  title: 'Rajasthan Tools Q8 | Premium Tools & Hardware',
  description: 'High quality industrial tools, construction equipment, and hardware supplies in Kuwait.',
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
