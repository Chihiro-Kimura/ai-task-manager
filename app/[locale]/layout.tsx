import { Noto_Sans_JP } from 'next/font/google';
import { unstable_setRequestLocale } from 'next-intl/server';
import { type ReactNode } from 'react';

import { Providers } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';
import enMessages from '@/messages/en.json';
import jaMessages from '@/messages/ja.json';
import '@/styles/globals.css';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'AI Task Manager',
    template: '%s | AI Task Manager',
  },
  description: 'AIを活用したタスク管理アプリ',
};

const messages = {
  ja: jaMessages,
  en: enMessages,
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps): Promise<ReactNode> {
  const { locale } = await params;
  unstable_setRequestLocale(locale);

  return (
    <html lang={locale} className="dark">
      <body className={notoSansJP.className}>
        <Providers messages={messages[locale as keyof typeof messages]}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
