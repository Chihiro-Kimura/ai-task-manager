'use client';

import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { AISummaryProps } from './types';

export function AISummary({
  task,
  summary,
  onMutate,
}: AISummaryProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [localTask, setLocalTask] = useState(task);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-200">タスクの要約</h3>
        <p className="text-sm text-zinc-400">{summary}</p>
        {localTask.description !== summary && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-zinc-200">現在の説明文</h4>
            <p className="text-sm text-zinc-400">{localTask.description}</p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-zinc-400 hover:text-zinc-100"
        onClick={async () => {
          try {
            const response = await fetch(`/api/tasks/${task.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Id': session?.user?.id || '',
              },
              body: JSON.stringify({
                description: summary,
              }),
            });

            if (!response.ok) {
              throw new Error('タスクの更新に失敗しました');
            }

            setLocalTask((prev) => ({
              ...prev,
              description: summary,
            }));

            await onMutate();
            toast({
              title: '要約を反映しました',
              description: 'タスクの説明文を更新しました',
            });
          } catch (error) {
            toast({
              title: 'エラー',
              description: error instanceof Error ? error.message : '不明なエラーが発生しました',
              variant: 'destructive',
            });
          }
        }}
      >
        要約を説明文に反映する
      </Button>
    </div>
  );
} 