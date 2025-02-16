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
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AddTaskForm sortBy={sortBy} />
          </div>
          <div className="md:col-span-2">
            <TaskList />
          </div>
        </div>
      </main>
    </div>
  );
}
