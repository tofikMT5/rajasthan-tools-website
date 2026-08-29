'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, signOut } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n/i18n-context';

export function Providers({ children }: { children: React.ReactNode }) {
  // Enforce fresh login on app launch by checking sessionStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSessionActive = sessionStorage.getItem('app-session-active');
      if (!isSessionActive) {
        sessionStorage.setItem('app-session-active', 'true');
        if (window.location.pathname !== '/login') {
          signOut({ redirect: false }).then(() => {
            window.location.href = window.location.origin + '/login';
          });
        }
      }
    }
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>{children}</I18nProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
