'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useSettingsStore } from '@/store/settings-store';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
}

export function Providers({ children, messages }: ProvidersProps): ReactNode {
  const { language } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <NextIntlClientProvider locale={language} messages={messages}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </NextIntlClientProvider>
        </NextThemesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
} 