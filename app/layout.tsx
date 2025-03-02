import { Noto_Sans_JP } from 'next/font/google';
import { type ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

import { Providers } from './providers';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata = {
  title: 'AIタスク管理アプリ',
  description: 'AIによるタスク管理アプリ',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="ja" className="dark">
      <body className={notoSansJP.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
