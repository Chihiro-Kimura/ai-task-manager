// src/app/page.tsx
'use client';

import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
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

      {/* トースト通知 */}
      <Toaster />
    </main>
  );
}
