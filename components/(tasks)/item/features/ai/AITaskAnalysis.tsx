'use client';

import { type ReactElement, useState } from 'react';

import { AILoading } from '@/components/(common)/loading/AILoading';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { AICategory } from './AICategory';
import { AINextTask } from './AINextTask';
import { AIPriority } from './AIPriority';
import { AISummary } from './AISummary';
import { AITags } from './AITags';
import { AIAnalysisResult, AITaskAnalysisProps } from './types';

export default function AITaskAnalysis({
  task,
  onMutate,
  onClose,
}: AITaskAnalysisProps): ReactElement {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult>({});
  const { toast } = useToast();

  const analyzeTask = async (featureId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/${featureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          content: task.description || '',
        }),
      });

      if (!response.ok) {
        throw new Error('AI分析に失敗しました');
      }

      const data = await response.json();
      setResult((prev) => ({ ...prev, [featureId]: data }));
      setSelectedFeatureId(featureId);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : '予期せぬエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <AILoading size="lg" />
      </div>
    );
  }

  const renderContent = (): ReactElement | null => {
    switch (selectedFeatureId) {
      case 'summary':
        return result.summary ? (
          <AISummary
            task={task}
            summary={result.summary.summary}
            onMutate={onMutate}
          />
        ) : null;

      case 'tags':
        return result.tags ? (
          <AITags
            task={task}
            suggestedTags={result.tags}
            onMutate={onMutate}
          />
        ) : null;

      case 'priority':
        return result.priority ? (
          <AIPriority
            task={task}
            priority={result.priority}
            onMutate={onMutate}
          />
        ) : null;

      case 'classify':
        return result.category ? (
          <AICategory
            task={task}
            category={result.category}
            onMutate={onMutate}
          />
        ) : null;

      case 'suggest':
        return result.nextTask ? (
          <AINextTask
            task={task}
            nextTask={result.nextTask}
            onMutate={onMutate}
          />
        ) : null;

      default:
        return (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => analyzeTask('summary')}
            >
              要約
            </Button>
            <Button
              variant="outline"
              onClick={() => analyzeTask('tags')}
            >
              タグ提案
            </Button>
            <Button
              variant="outline"
              onClick={() => analyzeTask('priority')}
            >
              優先度分析
            </Button>
            <Button
              variant="outline"
              onClick={() => analyzeTask('classify')}
            >
              分類
            </Button>
            <Button
              variant="outline"
              onClick={() => analyzeTask('suggest')}
            >
              次のタスク
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 p-4">
      {selectedFeatureId ? (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setSelectedFeatureId(null)}
        >
          ← 戻る
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={onClose}
        >
          閉じる
        </Button>
      )}
      {renderContent()}
    </div>
  );
} 