import { Flag } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/styles';

interface PrioritySelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function PrioritySelect({
  value,
  onValueChange,
  className,
}: PrioritySelectProps): JSX.Element {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'h-7 w-7 bg-transparent border-none focus:ring-0 p-0 flex items-center justify-center',
          '[&>svg:last-child]:hidden',
          'hover:bg-rose-400/10 data-[value=高]:hover:bg-rose-400/10',
          'hover:bg-amber-400/10 data-[value=中]:hover:bg-amber-400/10',
          'hover:bg-emerald-400/10 data-[value=低]:hover:bg-emerald-400/10',
          className
        )}
      >
        <SelectValue placeholder={<Flag className="h-4 w-4 text-zinc-500" />}>
          {value && (
            <Flag
              className={cn(
                'h-4 w-4',
                value === '高' && 'text-rose-400/70 hover:text-rose-400',
                value === '中' && 'text-amber-400/70 hover:text-amber-400',
                value === '低' && 'text-emerald-400/70 hover:text-emerald-400'
              )}
            />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-700">
        <SelectItem value="高" className="text-rose-500 hover:bg-zinc-800">
          <span className="flex items-center gap-2">
            <Flag className="h-4 w-4" />高
          </span>
        </SelectItem>
        <SelectItem value="中" className="text-amber-500 hover:bg-zinc-800">
          <span className="flex items-center gap-2">
            <Flag className="h-4 w-4" />中
          </span>
        </SelectItem>
        <SelectItem value="低" className="text-emerald-500 hover:bg-zinc-800">
          <span className="flex items-center gap-2">
            <Flag className="h-4 w-4" />低
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
