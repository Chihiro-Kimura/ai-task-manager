import { Flag } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';
import { Priority } from '@/types/common';

interface PrioritySelectProps {
  value: Priority | null;
  onValueChange: (value: Priority | null) => void;
  allowClear?: boolean;
  variant?: 'default' | 'icon';
  noBorder?: boolean;
  className?: string;
}

export function PrioritySelect({
  value,
  onValueChange,
  allowClear = false,
  variant = 'default',
  noBorder = false,
  className
}: PrioritySelectProps): ReactElement {
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
          {value ? (
            variant === 'icon' ? (
              <Flag className={cn(
                'h-4 w-4',
                value === '高' && 'text-red-500',
                value === '中' && 'text-yellow-500',
                value === '低' && 'text-blue-500'
              )} />
            ) : (
              <>
                <Flag className={cn(
                  'mr-2 h-4 w-4',
                  value === '高' && 'text-red-500',
                  value === '中' && 'text-yellow-500',
                  value === '低' && 'text-blue-500'
                )} />
                {value}
              </>
            )
          ) : (
            variant === 'icon' ? (
              <Flag className="h-4 w-4 text-zinc-500" />
            ) : (
              <span className="text-zinc-400">優先度を選択...</span>
            )
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="space-y-2">
          {allowClear && (
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-zinc-300"
              onClick={() => onValueChange(null)}
            >
              優先度を解除
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onValueChange('高')}
          >
            <Flag className="mr-2 h-4 w-4 text-red-500" />
            高
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onValueChange('中')}
          >
            <Flag className="mr-2 h-4 w-4 text-yellow-500" />
            中
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onValueChange('低')}
          >
            <Flag className="mr-2 h-4 w-4 text-blue-500" />
            低
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
