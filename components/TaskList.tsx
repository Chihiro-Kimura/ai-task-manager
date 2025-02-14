// src/components/TaskList.tsx
'use client';

import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import EditTaskForm from './EditTaskForm';
import { useSession } from 'next-auth/react';

export default function TaskList() {
  const { data: session } = useSession();
  const {
    data: tasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR(
    session?.user?.id ? '/api/tasks' : null,
    (url) =>
      fetch(url, {
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      }).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState(null);

  // タスク削除ハンドラー
  const handleDeleteTask = async (taskId: string) => {
    if (!session?.user?.id) return;
    try {
      console.log('Deleting task:', { taskId, userId: session.user.id }); // デバッグログを追加

      const res = await fetch(`/api/tasks/${taskId}`, { 
        method: 'DELETE',
        headers: {
          'X-User-Id': session.user.id
        }
      });
      
      const data = await res.json(); // レスポンスデータを取得
      console.log('Delete response:', data); // デバッグログを追加

      if (res.ok) {
        await mutateTasks();
        toast({
          title: '🗑️ タスク削除',
          description: 'タスクを削除しました'
        });
      } else {
        toast({
          title: '❌ エラー',
          description: data.error || 'タスク削除に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete error:', error); // エラーログを追加
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
