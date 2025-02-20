'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, Clock, Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

interface ITaskItemProps {
  task: TaskWithExtras;
}

export default function TaskItem({ task }: ITaskItemProps): React.JSX.Element {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { setIsEditModalOpen, setEditingTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusToggle = async (): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({
          status: task.status === '完了' ? '未完了' : '完了',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      toast({
        title: '更新完了',
        description: 'タスクのステータスを更新しました',
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: 'エラー',
        description: 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!session?.user?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast({
        title: '削除完了',
        description: 'タスクを削除しました',
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (): void => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const priorityColors = {
    高: 'bg-red-500/10 text-red-500',
    中: 'bg-yellow-500/10 text-yellow-500',
    低: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3
            className={cn(
              'text-base font-medium',
              task.status === '完了' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={cn(
                'mt-1 text-sm text-muted-foreground',
                task.status === '完了' && 'line-through'
              )}
            >
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStatusToggle}
            disabled={isDeleting}
          >
            <Check
              className={cn(
                'h-4 w-4',
                task.status === '完了'
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>タスクの削除</AlertDialogTitle>
                <AlertDialogDescription>
                  このタスクを削除してもよろしいですか？この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.priority && (
          <Badge
            variant="secondary"
            className={cn(
              'pointer-events-none',
              priorityColors[task.priority as keyof typeof priorityColors]
            )}
          >
            {task.priority}
          </Badge>
        )}
        {task.due_date && (
          <Badge
            variant="secondary"
            className="pointer-events-none flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            {format(new Date(task.due_date), 'M/d', { locale: ja })}
          </Badge>
        )}
      </div>
    </div>
  );
}
