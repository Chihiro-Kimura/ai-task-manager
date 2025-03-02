'use client';

import { type ReactElement } from 'react';

import { AILoading } from '@/components/(common)/loading/AILoading';
import { Button } from '@/components/ui/button';

import { AICategory } from './features/AICategory';
import { AINextTask } from './features/AINextTask';
import { AIPriority } from './features/AIPriority';
import { AISummary } from './features/AISummary';
import { AITags } from './features/AITags';
import { AITaskAnalysisProps } from './types';

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
        return summary ? (
          <AISummary
            task={task}
            summary={summary.summary}
            onMutate={onMutate}
          />
        ) : null;

      case 'tags':
        return tags ? (
          <AITags
            task={task}
            suggestedTags={tags}
            onMutate={onMutate}
          />
        ) : null;

      case 'priority':
        return priority ? (
          <AIPriority
            task={task}
            priority={priority}
            onMutate={onMutate}
          />
        ) : null;

      case 'classify':
        return category ? (
          <AICategory
            task={task}
            category={category}
            onMutate={onMutate}
          />
        ) : null;

      case 'suggest':
        return nextTask ? (
          <AINextTask
            task={task}
            nextTask={nextTask}
            onMutate={onMutate}
          />
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