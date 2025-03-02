'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ReactElement } from 'react';

import TaskList from '@/components/(tasks)/list/TaskList';

export default function TasksPage(): ReactElement {
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
    <div className="container mx-auto ">
      <TaskList />
    </div>
  );
}
