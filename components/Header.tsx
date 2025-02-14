'use client';

import { useSession } from 'next-auth/react';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import { Button } from './ui/button';
import { Layout } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Layout className="h-6 w-6" />
          AIタスク管理
        </Link>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="text-sm text-zinc-400">読み込み中...</div>
          ) : session ? (
            <>
              <span className="text-sm text-zinc-400">
                {session.user?.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="outline" className="border-zinc-800 text-zinc-100">
                ログイン
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
