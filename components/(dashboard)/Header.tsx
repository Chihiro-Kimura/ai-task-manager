'use client';

import { Layout, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { type ReactElement } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Header(): ReactElement {
  const { data: session, status } = useSession();

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center justify-between pl-4 pr-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-zinc-100"
        >
          <Layout className="h-6 w-6" />
          AIタスク管理
        </Link>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="text-sm text-zinc-400">読み込み中...</div>
          ) : session ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-zinc-800">
                  <AvatarImage
                    src={session.user.image ?? ''}
                    alt={session.user.name ?? 'ユーザー'}
                  />
                  <AvatarFallback className="bg-zinc-900 text-zinc-400">
                    {session.user.name?.[0] ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button
                variant="outline"
                className="border-zinc-800 text-zinc-100"
              >
                ログイン
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
