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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult>({});
  const { toast } = useToast();

  const analyzeTask = async (featureId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Analyzing task for feature: ${featureId}`, {
        title: task.title,
        content: task.description || ''
      });

      if (featureId === 'suggest') {
        const tasksResponse = await fetch('/api/tasks');
        if (!tasksResponse.ok) {
          throw new Error('タスクの取得に失敗しました');
        }
        const tasks = await tasksResponse.json();
        console.log('Current tasks:', tasks);

        const response = await fetch(`/api/ai/${featureId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentTask: task,
            tasks
          }),
        });

        if (!response.ok) {
          throw new Error('AI分析に失敗しました');
        }

        const data = await response.json();
        console.log('AI Suggestion Response:', data);
        
        const resultData = data.data || data;
        console.log('Setting result with:', resultData);
        
        setResult((prev) => {
          const newResult = { ...prev, suggest: resultData };
          console.log('New result state:', newResult);
          return newResult;
        });
        setSelectedFeatureId(featureId);
        return;
      }

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
      console.log(`AI Response for ${featureId}:`, data);
      
      const resultData = data.data || data;
      setResult((prev) => ({ ...prev, [featureId]: resultData }));
      setSelectedFeatureId(featureId);
    } catch (err) {
      console.error(`Error analyzing task for ${featureId}:`, err);
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

  const handleApplyCategory = async (): Promise<void> => {
    if (!result.classify) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: result.classify.category,
        }),
      });

      if (!response.ok) {
        throw new Error('カテゴリの更新に失敗しました');
      }

      await onMutate();
      toast({
        title: '更新しました',
        description: 'タスクのカテゴリを更新しました',
      });
    } catch (err) {
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : '予期せぬエラーが発生しました',
        variant: 'destructive',
      });
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
    if (!result) return null;

    switch (selectedFeatureId) {
      case 'summary':
        return result.summary ? (
          <AISummary task={task} summary={result.summary.summary} onMutate={onMutate} />
        ) : null;
      case 'tags':
        console.log('Rendering AITags with result:', result);
        const suggestedTags = result.tags?.suggestedTags || [];
        console.log('Suggested tags to render:', suggestedTags);
        return (
          <AITags 
            task={task} 
            suggestedTags={suggestedTags}
            onMutate={onMutate} 
          />
        );
      case 'priority':
        if (!result.priority || !['高', '中', '低'].includes(result.priority)) {
          return null;
        }
        
        return (
          <AIPriority 
            task={task} 
            priority={result.priority} 
            onMutate={async () => {
              await onMutate();
              onClose();
            }} 
          />
        );
      case 'classify':
        return result.classify ? (
          <AICategory category={result.classify} onMutate={handleApplyCategory} />
        ) : null;
      case 'suggest':
        console.log('Rendering suggest with result:', result);
        if (!result.suggest?.nextTask) {
          console.log('No next task in result');
          return (
            <div className="text-sm text-zinc-400 p-4">
              タスクの提案を生成できませんでした
            </div>
          );
        }
        return (
          <AINextTask 
            task={task} 
            nextTask={result.suggest.nextTask} 
            onMutate={onMutate}
            onRefresh={() => void analyzeTask('suggest')}
          />
        );
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