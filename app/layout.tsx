// src/app/layout.tsx
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'AIタスク管理アプリ',
  description: 'Next.js + Supabase + useSWR で作るタスク管理アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 text-gray-900">
        {children}
        {/* トースト通知を全体に設置 */}
        <Toaster />
      </body>
    </html>
  );
}
