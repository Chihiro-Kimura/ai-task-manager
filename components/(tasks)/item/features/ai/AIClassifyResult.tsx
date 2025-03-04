'use client';

import { InboxIcon, ListTodoIcon, PlayIcon } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/styles';

interface AIClassifyResultProps {
  category: 'inbox' | 'doing' | 'todo';
  confidence: number;
  reason: string;
  onApply: () => void;
}

const categoryIcons = {
  inbox: InboxIcon,
  doing: PlayIcon,
  todo: ListTodoIcon,
} as const;

const categoryLabels = {
  inbox: '受信箱',
  doing: '進行中',
  todo: '予定',
} as const;

const categoryColors = {
  inbox: 'text-blue-500',
  doing: 'text-green-500',
  todo: 'text-yellow-500',
} as const;

export function AIClassifyResult({
  category,
  confidence,
  reason,
  onApply,
}: AIClassifyResultProps): ReactElement {
  const Icon = categoryIcons[category];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', categoryColors[category])} />
          <span className="font-medium">{categoryLabels[category]}</span>
          <span className="text-sm text-zinc-400">
            ({Math.round(confidence * 100)}% の確信度)
          </span>
        </div>
        <Button onClick={onApply} size="sm">
          適用
        </Button>
      </div>
      <p className="text-sm text-zinc-600">{reason}</p>
    </Card>
  );
} 