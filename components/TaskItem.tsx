'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Pencil, Trash2, Flag } from 'lucide-react';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import EditTaskForm from '@/components/EditTaskForm';
import { cn } from '@/lib/utils';

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
  const [isEditing, setIsEditing] = useState(false);

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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  return (
    <>
      {isEditing ? (
        <EditTaskForm
          taskId={task.id}
          currentTitle={task.title}
          currentDescription={task.description}
          currentPriority={task.priority}
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === '完了'}
              onCheckedChange={handleToggleStatus}
              className={cn(
                'h-4 w-4 border transition-colors',
                task.status === '完了'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:border-blue-400'
                  : 'border-zinc-600 bg-zinc-900/50 hover:border-zinc-500'
              )}
            />
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'text-sm font-medium',
                  task.status === '完了'
                    ? 'text-zinc-400 line-through'
                    : 'text-zinc-100'
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    'mt-1 text-xs',
                    task.status === '完了'
                      ? 'text-zinc-500 line-through'
                      : 'text-zinc-400'
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {task.priority && (
                <Flag
                  className={cn(
                    'h-4 w-4',
                    task.priority === 'high' && 'text-rose-500',
                    task.priority === 'medium' && 'text-amber-500',
                    task.priority === 'low' && 'text-emerald-500'
                  )}
                />
              )}

              {task.due_date && (
                <span
                  className={cn(
                    'text-xs',
                    task.status === '完了' ? 'text-zinc-500' : 'text-blue-400'
                  )}
                >
                  {format(new Date(task.due_date), 'MM/dd', { locale: ja })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-800 bg-transparent hover:bg-blue-950 hover:text-blue-400 hover:border-blue-800"
              onClick={() => setIsEditing(true)}
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
        </div>
      )}
    </>
  );
}
