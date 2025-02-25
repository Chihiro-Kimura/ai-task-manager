import Header from '@/components/(dashboard)/Header';
import { ListTodo, StickyNote } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* サイドバーナビゲーション */}
        <nav className="w-64 border-r border-zinc-800 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/tasks"
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <ListTodo className="w-4 h-4" />
                <span>タスク</span>
              </Link>
            </li>
            <li>
              <Link
                href="/notes"
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <StickyNote className="w-4 h-4" />
                <span>メモ帳</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* メインコンテンツ */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
