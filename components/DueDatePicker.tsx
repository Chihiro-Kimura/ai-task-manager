import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DueDatePickerProps {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  className?: string;
}

export default function DueDatePicker({
  dueDate,
  setDueDate,
  className = '',
}: DueDatePickerProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-zinc-400 block mb-2">
        締切日
      </label>
      <Popover>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-zinc-950 border border-zinc-800"
          align="start"
        >
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            className="rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400"
            locale={ja}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
