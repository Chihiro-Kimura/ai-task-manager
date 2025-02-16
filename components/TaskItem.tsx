'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Pencil, Trash2, CalendarIcon } from 'lucide-react';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { format, isPast, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
  };
  onMutate: () => Promise<void>;
}

export default function TaskItem({ task, onMutate }: TaskItemProps) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    const newStatus = task.status === '完了' ? '未完了' : '完了';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await onMutate();
        toast({
          title: 'ステータス更新',
          description: `タスクを${newStatus}に変更しました`,
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        throw new Error('ステータスの更新に失敗しました');
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました',
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (res.ok) {
        await onMutate();
        toast({
          title: 'タスク削除',
          description: 'タスクを削除しました',
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        throw new Error('タスクの削除に失敗しました');
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'タスクの削除に失敗しました',
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  return (
    <li
      className={`p-2 border border-zinc-800 bg-zinc-900/50 rounded-lg flex justify-between items-start hover:bg-zinc-900 transition-colors ${
        task.status === '完了' ? 'opacity-60' : ''
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={task.status === '完了'}
            onCheckedChange={handleToggleStatus}
            className="border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <h3
            className={`text-zinc-100 ${
              task.status === '完了' ? 'line-through text-zinc-500' : ''
            }`}
          >
            {task.title}
          </h3>
        </div>
        {task.description && (
          <p className="text-sm text-zinc-400 ml-8">{task.description}</p>
        )}
        <div className="flex items-center gap-2 ml-8">
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400">優先度 : </span>
            <span
              className={`ml-1 ${
                task.priority === '高'
                  ? 'text-rose-500 font-semibold'
                  : task.priority === '中'
                  ? 'text-amber-500 font-medium'
                  : 'text-emerald-500'
              }`}
            >
              {task.priority || '未設定'}
            </span>
          </span>
          {task.due_date && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-950 border border-zinc-800 ${
                isPast(new Date(task.due_date)) &&
                !isToday(new Date(task.due_date))
                  ? 'text-rose-500'
                  : isToday(new Date(task.due_date))
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(new Date(task.due_date), 'M/d', { locale: ja })}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-800 bg-transparent hover:bg-blue-950 hover:text-blue-400 hover:border-blue-800"
          onClick={() => {
            /* 編集機能を実装 */
          }}
        >
          <Pencil className="h-4 w-4 text-zinc-400" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-800 bg-transparent hover:bg-rose-950 hover:text-rose-400 hover:border-rose-800"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-zinc-400" />
        </Button>
      </div>
    </li>
  );
}
