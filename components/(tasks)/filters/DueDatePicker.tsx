import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type ReactElement, type ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';

interface DueDatePickerProps {
  dueDate?: Date | null;
  setDueDate: (date: Date | undefined) => void;
  variant?: 'icon' | 'full' | 'menuItem';
  className?: string;
  children?: ReactNode;
  hideLabel?: boolean;
}

function CalendarContent({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined | null;
  setDueDate: (date: Date | undefined) => void;
}): ReactElement {
  return (
    <Calendar
      mode="single"
      selected={dueDate || undefined}
      onSelect={setDueDate}
      className="rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400"
      locale={ja}
    />
  );
}

export default function DueDatePicker({
  dueDate,
  setDueDate,
  variant = 'full',
  className = '',
  children,
  hideLabel = false,
}: DueDatePickerProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const isIcon = variant === 'icon';
  const isMenuItem = variant === 'menuItem';

  if (isMenuItem) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={className}>
          {children}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="p-0">
            <CalendarContent
              dueDate={dueDate}
              setDueDate={setDueDate}
            />
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {variant === 'full' && !hideLabel && (
        <Label>締切日</Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {isIcon ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 w-7 p-0 flex items-center justify-center',
                'data-[state=open]:bg-violet-400/10'
              )}
            >
              <CalendarIcon
                className={cn(
                  'h-4 w-4',
                  dueDate
                    ? 'text-violet-400/70 hover:text-violet-400'
                    : 'text-zinc-500 hover:text-violet-400'
                )}
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                "bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700",
                !dueDate && "text-slate-400"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate
                ? format(dueDate, 'yyyy年MM月dd日', { locale: ja })
                : '締切日を選択'}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-zinc-950 border border-zinc-800"
          align="start"
        >
          <CalendarContent
            dueDate={dueDate}
            setDueDate={(date) => {
              setDueDate(date);
              setIsOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
