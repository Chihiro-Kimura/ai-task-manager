import { Flag } from 'lucide-react';
import { type ReactElement, type ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/styles';
import { Priority } from '@/types/common';

interface PrioritySelectProps {
  value: Priority | null;
  onValueChange: (value: Priority) => void;
  className?: string;
  variant?: 'icon' | 'menuItem';
  children?: ReactNode;
}

function PriorityItems({
  onValueChange,
}: {
  onValueChange: (value: Priority) => void;
}): ReactElement {
  return <>
    <DropdownMenuItem
      onClick={() => onValueChange('高')}
      className="text-rose-400"
    >
      <Flag className="h-4 w-4" />
      高
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => onValueChange('中')}
      className="text-amber-400"
    >
      <Flag className="h-4 w-4" />
      中
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => onValueChange('低')}
      className="text-emerald-400"
    >
      <Flag className="h-4 w-4" />
      低
    </DropdownMenuItem>
  </>
}

export default function PrioritySelect({
  value,
  onValueChange,
  className,
  variant = 'icon',
  children,
}: PrioritySelectProps): ReactElement {
  if (variant === 'menuItem') {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={className}>
          {children}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="w-[140px]">
            <PriorityItems onValueChange={onValueChange} />
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent',
            className
          )}
        >
          <Flag
            className={cn(
              'h-4 w-4',
              !value && 'text-zinc-200',
              value === '高' && 'text-rose-400',
              value === '中' && 'text-amber-400',
              value === '低' && 'text-emerald-400'
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        <PriorityItems onValueChange={onValueChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
