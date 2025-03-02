'use client';

import { type ReactElement } from 'react';

import { AIFeatureProps } from '../types';

interface AICategoryProps extends AIFeatureProps {
  category: {
    category: string;
    confidence: number;
  };
}

export function AICategory({ category }: AICategoryProps): ReactElement {
  return (
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
  );
} 