'use client';

import { Flag } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/styles';

import { AIPriorityProps } from './types';

export function AIPriority({
  task,
  priority,
  onMutate,
}: AIPriorityProps): ReactElement {
  const { toast } = useToast();

  const handleApplyPriority = async (newPriority: '高' | '中' | '低' | null): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error('優先度の更新に失敗しました');
      }

      await onMutate();
      toast({
        title: '更新しました',
        description: newPriority 
          ? 'タスクの優先度を更新しました'
          : 'タスクの優先度を解除しました',
      });
    } catch (err) {
      console.error('Priority update error:', err);
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : '予期せぬエラーが発生しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-full bg-zinc-100 dark:bg-zinc-800')}>
            <Flag
              className={cn(
                'h-5 w-5',
                priority === '高' && 'text-rose-400',
                priority === '中' && 'text-amber-400',
                priority === '低' && 'text-emerald-400'
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">提案された優先度: {priority}</span>
              {task.priority && (
                <span className="text-sm text-zinc-500">
                  (現在の優先度: {task.priority})
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {priority === '高' && 'このタスクは緊急性が高く、早急な対応が必要です。'}
              {priority === '中' && 'このタスクは標準的な優先度で、計画的に進めることができます。'}
              {priority === '低' && 'このタスクは緊急性が低く、余裕を持って対応できます。'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && (
            <Button
              onClick={() => void handleApplyPriority(null)}
              size="sm"
              variant="outline"
              className="text-zinc-500 hover:text-zinc-400"
            >
              優先度を解除
            </Button>
          )}
          <Button
            onClick={() => void handleApplyPriority(priority)}
            size="sm"
            className={cn(
              'transition-colors hover:text-white',
              priority === '高' && 'hover:bg-rose-500',
              priority === '中' && 'hover:bg-amber-500',
              priority === '低' && 'hover:bg-emerald-500'
            )}
          >
            {task.priority ? '上書き' : '適用'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 