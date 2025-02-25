'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function NotesPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-zinc-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">メモ帳</h1>
      {/* メモ帳機能のコンポーネントをここに追加 */}
    </div>
  );
}
