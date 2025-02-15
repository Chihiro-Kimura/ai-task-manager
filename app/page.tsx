'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import Header from '@/components/Header';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
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

        {/* タスク追加フォーム */}
        <div className="mb-8 w-full max-w-md space-y-4">
          <AddTaskForm />
        </div>

        {/* タスク一覧 */}
        <div className="w-full max-w-md">
          <TaskList />
        </div>
      </main>
    </div>
  );
}
