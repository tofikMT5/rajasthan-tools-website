import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'RT Billing System | Rajasthan Tools Q8',
  description: 'Billing & Inventory Management System for Rajasthan Tools Q8 (Kuwait)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
