'use client';

import { useSession } from 'next-auth/react';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AIタスク管理アプリ
        </Link>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="text-sm text-gray-500">読み込み中...</div>
          ) : session ? (
            <>
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="outline">ログイン</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
