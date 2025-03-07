import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';
import { TASK_STATUS, TASK_STATUS_CONFIG, STATUS_MAPPING, type TaskStatus } from '@/types/task/status';

interface StatusSelectProps {
  value: TaskStatus;
  onValueChange: (value: TaskStatus) => void;
  variant?: 'default' | 'icon';
  noBorder?: boolean;
  className?: string;
}

export function StatusSelect({
  value,
  onValueChange,
  variant = 'default',
  noBorder = false,
  className
}: StatusSelectProps): ReactElement {
  // レガシーステータスを新しいステータスに変換
  const normalizedValue = STATUS_MAPPING[value] || value;

  // 正規化された値が有効なTaskStatusであることを確認
  if (!Object.values(TASK_STATUS).includes(normalizedValue)) {
    console.warn(`Invalid task status: ${value}, falling back to TODO`);
    value = TASK_STATUS.TODO;
  } else {
    value = normalizedValue;
  }

  const currentStatus = TASK_STATUS_CONFIG[value];
  const Icon = currentStatus.icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={noBorder ? "ghost" : "outline"}
          size={variant === 'icon' ? 'icon' : 'default'}
          className={cn(
            variant === 'icon' 
              ? 'h-7 w-7 p-0' 
              : 'justify-start',
            !noBorder && 'bg-zinc-900/50 border-zinc-800',
            className
          )}
        >
          {variant === 'icon' ? (
            <Icon className={cn('h-4 w-4', currentStatus.className)} />
          ) : (
            <>
              <Icon className={cn('mr-2 h-4 w-4', currentStatus.className)} />
              {currentStatus.label}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="space-y-2">
          {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <Button
                key={status}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onValueChange(status as TaskStatus)}
              >
                <StatusIcon className={cn('mr-2 h-4 w-4', config.className)} />
                {config.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
} 