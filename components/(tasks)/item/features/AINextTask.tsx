'use client';

import { Flag } from 'lucide-react';
import { type ReactElement } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { AIFeatureProps } from '../types';

interface AINextTaskProps extends AIFeatureProps {
  nextTask: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
}

export function AINextTask({ nextTask }: AINextTaskProps): ReactElement {
  return (
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
  );
} 