// src/components/TaskList.tsx
'use client';

import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskList() {
  const { data: tasks, error, isLoading } = useSWR('/api/tasks', fetcher);
  const { toast } = useToast();

  // タスク削除ハンドラー
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: '🗑️ タスク削除', description: 'タスクを削除しました' });
        mutate('/api/tasks'); // 一覧を再取得
      } else {
        toast({
          title: '❌ エラー',
          description: 'タスク削除に失敗しました',
          variant: 'destructive',
        });
      }
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
  if (!tasks || tasks.length === 0) return <p>📭 タスクがありません</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🗂️ タスク一覧</h2>
      <ul className="space-y-2">
        {tasks.map((task: any) => (
          <li
            key={task.id}
            className="p-2 border rounded-md flex justify-between items-center"
          >
            <div>
              <strong>{task.title}</strong>
              <p className="text-sm text-gray-500">
                {task.description || '詳細なし'}
              </p>
            </div>
            <Button
              onClick={() => handleDeleteTask(task.id)}
              className="bg-red-500 text-white"
            >
              削除
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
