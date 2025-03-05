import { Flag } from 'lucide-react';
import { type ReactElement } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/styles';
import { Priority } from '@/types/common';

interface PrioritySelectProps {
  value?: Priority | null;
  onValueChange: (value: Priority | null) => void;
  allowClear?: boolean;
  className?: string;
}

export function PrioritySelect({
  value,
  onValueChange,
  allowClear = false,
  className,
}: PrioritySelectProps): ReactElement {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v: string) => {
        if (v === 'clear' || v === '') {
          onValueChange(null);
        } else {
          onValueChange(v as Priority);
        }
      }}
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="優先度を選択">
          {value && (
            <div className="flex items-center gap-2">
              <Flag
                className={cn(
                  'h-4 w-4',
                  value === '高' && 'text-red-500',
                  value === '中' && 'text-yellow-500',
                  value === '低' && 'text-green-500',
                )}
              />
              {value}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="clear">
            優先度を解除
          </SelectItem>
        )}
        <SelectItem value="高">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" />
            高
          </div>
        </SelectItem>
        <SelectItem value="中">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-yellow-500" />
            中
          </div>
        </SelectItem>
        <SelectItem value="低">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-green-500" />
            低
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
