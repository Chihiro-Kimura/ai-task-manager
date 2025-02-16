'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import Header from '@/components/Header';
import { useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-start px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-zinc-100">
          AIタスク管理アプリ
        </h1>

        {/* タスク追加フォームとタスク一覧を同じ幅のコンテナで囲む */}
        <div className="w-full max-w-md space-y-8">
          {/* タスク追加フォーム */}
          <AddTaskForm sortBy={sortBy} />

          {/* タスク一覧 */}
          <TaskList sortBy={sortBy} setSortBy={setSortBy} />
        </div>
      </main>
    </div>
  );
}
