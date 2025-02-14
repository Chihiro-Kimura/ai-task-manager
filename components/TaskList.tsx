// src/components/TaskList.tsx
'use client';

import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import EditTaskForm from './EditTaskForm';
import { useSession } from 'next-auth/react';
import { ListTodo, Pencil, Trash2 } from 'lucide-react';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

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
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': session.user.id,
        },
      });

      const data = await res.json();

      if (res.ok) {
        await mutateTasks();
        toast({
          title: 'タスク削除',
          description: 'タスクを削除しました',
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        toast({
          title: 'エラー',
          description: data.error || 'タスク削除に失敗しました',
          variant: 'destructive',
          icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '通信エラーが発生しました',
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  if (isLoading) return <p className="text-zinc-400">読み込み中...</p>;
  if (error) return <p className="text-zinc-400">エラーが発生しました</p>;
  if (!tasks?.length)
    return <p className="text-zinc-400">タスクがありません</p>;

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-zinc-100">
        <ListTodo className="h-5 w-5" />
        タスク一覧
      </h2>
      <ul className="space-y-2">
        {tasks.map(({ id, title, description }) => (
          <li
            key={id}
            className="p-3 border border-zinc-800 bg-zinc-900 rounded-md flex justify-between items-center"
          >
            <div>
              <strong className="text-zinc-100">{title}</strong>
              <p className="text-sm text-zinc-400">
                {description || '詳細なし'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setEditingTask({ id, title, description })}
                variant="outline"
                size="sm"
                className="border-zinc-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDeleteTask(id)}
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:bg-red-900 hover:text-red-100"
              >
                <Trash2 className="h-4 w-4" />
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
