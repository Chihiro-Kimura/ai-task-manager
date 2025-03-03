'use client';

import { Flag } from 'lucide-react';
import { type ReactElement } from 'react';

import { cn } from '@/lib/utils/styles';

import { AIFeatureProps } from '../types';

interface AIPriorityProps extends AIFeatureProps {
  priority: '高' | '中' | '低';
}

export function AIPriority({ priority }: AIPriorityProps): ReactElement {
  return (
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
  );
} 