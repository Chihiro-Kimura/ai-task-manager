// src/components/TaskList.tsx
'use client';

import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import EditTaskForm from './EditTaskForm';
import { useSession } from 'next-auth/react';
import { ListTodo, Pencil, Trash2 } from 'lucide-react';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TaskList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');

  const {
    data: tasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR(
    session?.user?.id ? `/api/tasks?sortBy=${sortBy}` : null,
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

      <div className="mb-4">
        <label className="text-sm font-medium text-zinc-400 mr-2">
          並び順:
        </label>
        <Select
          value={sortBy}
          onValueChange={(value) =>
            setSortBy(value as 'priority' | 'createdAt')
          }
        >
          <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors [&_span]:text-zinc-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800">
            <SelectItem
              value="priority"
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-zinc-100"
            >
              優先度順
            </SelectItem>
            <SelectItem
              value="createdAt"
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-zinc-100"
            >
              追加順
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-3">
        {tasks.map(({ id, title, description, priority }) => (
          <li
            key={id}
            className="p-4 border border-zinc-800 bg-zinc-900/50 rounded-lg flex justify-between items-center hover:bg-zinc-900 transition-colors"
          >
            <div className="space-y-1.5">
              <strong className="text-zinc-100 font-semibold">{title}</strong>
              <p className="text-sm text-zinc-400">
                {description || '詳細なし'}
              </p>
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-950 border border-zinc-800 text-zinc-100">
                優先度: {priority || '未設定'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setEditingTask({ id, title, description })}
                variant="ghost"
                size="sm"
                className="hover:bg-blue-900/20 hover:text-blue-400 text-zinc-400"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDeleteTask(id)}
                variant="ghost"
                size="sm"
                className="hover:bg-red-900/20 hover:text-red-400 text-zinc-400"
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
