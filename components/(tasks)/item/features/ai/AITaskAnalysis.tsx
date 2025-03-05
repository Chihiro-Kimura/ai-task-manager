'use client';

import { type ReactElement, useState, useEffect } from 'react';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
      const resultData = data.data || data;
      
      // タグ提案の場合、レスポンスの詳細をログに出力
      if (featureId === 'tags') {
        console.log('Tags API response:', data);
        console.log('Tags resultData:', resultData);
      }
      
      setResult((prev) => ({ ...prev, [featureId]: resultData }));
      setSelectedFeatureId(featureId);
    } catch (err) {
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
      console.error('Category update error:', err);
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
        // タグ提案の結果をログに出力
        console.log('Tags API response:', result);
        console.log('Tags resultData:', result);
        
        // 修正: suggestedTagsが直接配列として渡されるようにする
        return (
          <AITags 
            task={task} 
            suggestedTags={result.suggestedTags || result.tags || []} 
            onMutate={onMutate} 
          />
        );
      case 'priority':
        // デバッグログを追加
        console.log('Priority API response:', result);
        console.log('Priority resultData:', result.priority);
        
        // APIレスポンスから優先度の値を取得
        const priorityValue = typeof result.priority === 'object' 
          ? result.priority.priority 
          : result.priority;
        
        if (typeof priorityValue !== 'string' || !['高', '中', '低'].includes(priorityValue)) {
          return null;
        }
        
        return (
          <AIPriority 
            task={task} 
            priority={priorityValue as '高' | '中' | '低'} 
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
        return result.suggest ? (
          <AINextTask task={task} nextTask={result.suggest} onMutate={onMutate} />
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
      {isMounted && renderContent()}
    </div>
  );
} 