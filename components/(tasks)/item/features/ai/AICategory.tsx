'use client';

import { InboxIcon, ListTodoIcon, PlayIcon } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/styles';

import { AICategoryProps } from './types';

const categoryConfig = {
  'doing': {
    icon: PlayIcon,
    label: '進行中',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
  'todo': {
    icon: ListTodoIcon,
    label: '予定',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  'inbox': {
    icon: InboxIcon,
    label: '受信箱',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
} as const;

export function AICategory({
  category,
  onMutate,
}: Omit<AICategoryProps, 'task'>): ReactElement {
  const config = categoryConfig[category.category as keyof typeof categoryConfig];

  if (!config) {
    return (
      <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
        <p>無効なカテゴリです: {category.category}</p>
      </div>
    );
  }

  const Icon = config.icon;
  const confidence = Math.round(category.confidence * 100);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={cn('p-2 rounded-full bg-zinc-100 dark:bg-zinc-800')}>
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>このタスクは{config.label}カテゴリに分類されました</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{config.label}</span>
              <span className="text-sm text-zinc-400">
                確信度: {confidence}%
              </span>
            </div>
            {category.reason && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {category.reason}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => onMutate()}
          size="sm"
          className={cn(
            'transition-colors hover:text-white',
            confidence >= 80 ? 'hover:bg-green-500' : 'hover:bg-yellow-500'
          )}
        >
          適用
        </Button>
      </div>
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={cn('h-full rounded-full transition-all', {
              'bg-green-500': confidence >= 80,
              'bg-yellow-500': confidence >= 50 && confidence < 80,
              'bg-red-500': confidence < 50,
            })}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </Card>
  );
} 