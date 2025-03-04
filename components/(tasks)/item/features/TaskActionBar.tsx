import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Flag, MoreVertical, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { type ReactElement, useState } from 'react';

import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/styles';
import { Priority } from '@/types/common';

interface TaskActionBarProps {
  status: string;
  priority: Priority | null;
  dueDate: Date | null;
  onStatusChange: (checked: boolean) => Promise<void>;
  onPriorityChange: (priority: Priority) => Promise<void>;
  onDueDateChange: (date: Date | undefined) => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAIClick: () => void;
}

export function TaskActionBar({
  status,
  priority,
  dueDate,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onEdit,
  onDelete,
  onAIClick,
}: TaskActionBarProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Checkbox checked={status === '完了'} onCheckedChange={onStatusChange} />
        {dueDate && (
          <span className="text-xs text-zinc-200">
            {format(dueDate, 'M/d', { locale: ja })}
          </span>
        )}
        {priority && (
          <Flag
            className={cn(
              'h-4 w-4',
              priority === '高' && 'text-rose-400',
              priority === '中' && 'text-amber-400',
              priority === '低' && 'text-emerald-400'
            )}
          />
        )}
      </div>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!dueDate && (
            <DueDatePicker
              dueDate={undefined}
              setDueDate={(date) => {
                onDueDateChange(date);
                setIsOpen(false);
              }}
              variant="menuItem"
            >
              <Calendar className="mr-2 h-4 w-4" />
              期日を設定
            </DueDatePicker>
          )}
          {!priority && (
            <PrioritySelect
              value={null}
              onValueChange={(value) => {
                onPriorityChange(value);
                setIsOpen(false);
              }}
              variant="menuItem"
            >
              <Flag className="mr-2 h-4 w-4" />
              優先度を設定
            </PrioritySelect>
          )}
          {(!dueDate || !priority) && <DropdownMenuSeparator />}
          <DropdownMenuItem 
            onClick={() => {
              onAIClick();
              setIsOpen(false);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI機能
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            編集
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}