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
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6">AIタスク管理アプリ</h1>

        {/* タスク追加フォーム */}
        <div className="mb-8 w-full max-w-md">
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
