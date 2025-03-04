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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';

interface DueDatePickerProps {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  variant?: 'icon' | 'full' | 'menuItem';
  className?: string;
  children?: ReactNode;
}

function CalendarContent({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
}): ReactElement {
  return <Calendar
    mode="single"
    selected={dueDate}
    onSelect={setDueDate}
    className="rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400"
    locale={ja}
  />
}

export default function DueDatePicker({
  dueDate,
  setDueDate,
  variant = 'full',
  className = '',
  children,
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
    <div className={className}>
      {!isIcon && (
        <label className="text-sm font-medium text-zinc-400 block mb-2">
          締切日
        </label>
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
                    : className || 'text-zinc-500 hover:text-violet-400'
                )}
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 ${
                !dueDate && 'text-slate-400'
              }`}
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
