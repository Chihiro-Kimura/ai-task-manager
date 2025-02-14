// src/components/TaskList.tsx
'use client';

import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import EditTaskForm from './EditTaskForm';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskList() {
  const { data: tasks, error, isLoading } = useSWR('/api/tasks', fetcher);
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState(null);

  // タスク削除ハンドラー
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      toast({
        title: res.ok ? '🗑️ タスク削除' : '❌ エラー',
        description: res.ok
          ? 'タスクを削除しました'
          : 'タスク削除に失敗しました',
        variant: res.ok ? undefined : 'destructive',
      });
      if (res.ok) mutate('/api/tasks');
    } catch {
      toast({
        title: '❌ エラー',
        description: '通信エラーが発生しました',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <p>🌀 読み込み中...</p>;
  if (error) return <p>❌ エラーが発生しました</p>;
  if (!tasks?.length) return <p>📭 タスクがありません</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🗂️ タスク一覧</h2>
      <ul className="space-y-2">
        {tasks.map(({ id, title, description }) => (
          <li
            key={id}
            className="p-2 border rounded-md flex justify-between items-center"
          >
            <div>
              <strong>{title}</strong>
              <p className="text-sm text-gray-500">
                {description || '詳細なし'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setEditingTask({ id, title, description })}
                className="bg-yellow-500 text-white"
              >
                編集
              </Button>
              <Button
                onClick={() => handleDeleteTask(id)}
                className="bg-red-500 text-white"
              >
                削除
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {editingTask && (
        <EditTaskForm
          taskId={editingTask.id}
          currentTitle={editingTask.title}
          currentDescription={editingTask.description}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
