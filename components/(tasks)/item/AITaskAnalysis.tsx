'use client';

import { Flag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TaskWithExtras } from '@/types/task';

interface AITaskAnalysisProps {
  selectedFeatureId: string | null;
  isLoading: boolean;
  error?: string;
  summary?: { summary: string };
  tags?: string[];
  priority?: '高' | '中' | '低';
  category?: { category: string; confidence: number };
  nextTask?: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
  setSelectedFeatureId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function AITaskAnalysis({
  selectedFeatureId,
  isLoading,
  error,
  summary,
  tags,
  priority,
  category,
  nextTask,
  task,
  onMutate,
  setSelectedFeatureId,
}: AITaskAnalysisProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [localTask, setLocalTask] = useState(task);

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const renderContent = (): ReactElement | null => {
    switch (selectedFeatureId) {
      case 'summary':
        return summary ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-200">タスクの要約</h3>
              <p className="text-sm text-zinc-400">{summary.summary}</p>
              {localTask.description !== summary.summary && (
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
                      description: summary.summary,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('タスクの更新に失敗しました');
                  }

                  setLocalTask((prev) => ({
                    ...prev,
                    description: summary.summary,
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
        ) : null;

      case 'tags':
        return tags ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-200">提案されたタグ</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'priority':
        return priority ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-200">提案された優先度</h3>
            <div className="flex items-center gap-2">
              <Flag
                className={cn(
                  'h-4 w-4',
                  priority === '高' && 'text-rose-400',
                  priority === '中' && 'text-amber-400',
                  priority === '低' && 'text-emerald-400'
                )}
              />
              <span className="text-sm text-zinc-300">{priority}</span>
            </div>
          </div>
        ) : null;

      case 'classify':
        return category ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-200">タスクの分類</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{category.category}</span>
                <span className="text-xs text-zinc-400">
                  {Math.round(category.confidence * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${category.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : null;

      case 'suggest':
        return nextTask ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">次のタスクの提案</h3>
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
              </div>
            </Card>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {selectedFeatureId && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setSelectedFeatureId(null)}
        >
          ← 戻る
        </Button>
      )}
      {renderContent()}
    </div>
  );
} 