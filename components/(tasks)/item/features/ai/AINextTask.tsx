'use client';

import { Flag, Plus, Clock, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { AILoading } from '@/components/(common)/loading/AILoading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/styles';
import { CreateTaskData } from '@/types/task';

import { AINextTaskProps } from './types';

export function AINextTask({
  task,
  nextTask,
  onMutate,
  onRefresh,
}: AINextTaskProps): ReactElement {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { data: session } = useSession();

  const handleCreateTask = async (): Promise<void> => {
    if (isCreating || !session?.user) return;

    try {
      setIsCreating(true);

      // 新規タスクのデータを準備
      const newTaskData: CreateTaskData = {
        title: nextTask.title,
        description: nextTask.description,
        priority: nextTask.priority,
        status: 'todo',
        category: task.category,
        task_order: 0,
        tags: [],
        due_date: undefined,
      };

      // タスクを作成
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      });

      if (!response.ok) {
        throw new Error('タスクの作成に失敗しました');
      }

      await onMutate();

      toast({
        title: '✨ タスクを追加しました',
        description: '編集画面から詳細を設定できます',
      });
    } catch (error) {
      console.error('[AINextTask] Error:', error);
      toast({
        title: 'エラー',
        description: 'タスクの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">おすすめの次のタスク</h3>
        {isCreating && <AILoading size="sm" text="作成中..." />}
      </div>
      <Card className="bg-zinc-800/50 border-zinc-700">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-200">
              {nextTask.title}
            </h4>
            <Flag
              className={cn(
                'h-4 w-4',
                nextTask.priority === '高' && 'text-rose-400',
                nextTask.priority === '中' && 'text-amber-400',
                nextTask.priority === '低' && 'text-emerald-400'
              )}
            />
          </div>
          <p className="text-sm text-zinc-400">{nextTask.description}</p>
          {nextTask.estimatedDuration && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>目安: {nextTask.estimatedDuration}</span>
            </div>
          )}
          {nextTask.dependencies && nextTask.dependencies.length > 0 && (
            <div className="text-xs text-zinc-500">
              <p>依存タスク:</p>
              <ul className="list-disc list-inside">
                {nextTask.dependencies.map((dep, index) => (
                  <li key={index}>{dep}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="pt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-emerald-900/20 hover:text-emerald-400"
              onClick={() => void handleCreateTask()}
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" />
              このタスクを追加
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-zinc-800"
              onClick={onRefresh}
              title="別の提案を表示"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}