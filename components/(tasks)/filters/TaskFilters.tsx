'use client';

import { ArrowDownAZ, ArrowUpDown, Calendar, CheckCircle, Flag, GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TaskFiltersProps {
  sortBy: 'priority' | 'createdAt' | 'dueDate' | 'custom';
  onSortByChange: (
    value: 'priority' | 'createdAt' | 'dueDate' | 'custom'
  ) => void;
  statusFilter: 'all' | '未完了' | '完了';
  onStatusFilterChange: (value: 'all' | '未完了' | '完了') => void;
  dueDateFilter: 'all' | 'overdue' | 'today' | 'upcoming';
  onDueDateFilterChange: (
    value: 'all' | 'overdue' | 'today' | 'upcoming'
  ) => void;
  onReset: () => void;
}

export default function TaskFilters({
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
  onReset,
}: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">並び替え</label>
          <ToggleGroup
            type="single"
            value={sortBy}
            onValueChange={(value) => value && onSortByChange(value as typeof sortBy)}
            className="justify-start bg-zinc-900/50 p-1 rounded-md"
          >
            <ToggleGroupItem
              value="custom"
              className="h-8 w-8 p-0 data-[state=on]:bg-zinc-800"
              title="カスタム順"
            >
              <GripVertical className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="priority"
              className="h-8 w-8 p-0 data-[state=on]:bg-zinc-800"
              title="優先度順"
            >
              <Flag className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dueDate"
              className="h-8 w-8 p-0 data-[state=on]:bg-zinc-800"
              title="締切日順"
            >
              <Calendar className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="createdAt"
              className="h-8 w-8 p-0 data-[state=on]:bg-zinc-800"
              title="作成日順"
            >
              <ArrowDownAZ className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors rounded-md text-zinc-200">
              <CheckCircle className="mr-2 h-4 w-4" />
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 rounded-md">
              <SelectItem
                value="all"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                すべて
              </SelectItem>
              <SelectItem
                value="未完了"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                未完了
              </SelectItem>
              <SelectItem
                value="完了"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                完了
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={dueDateFilter} onValueChange={onDueDateFilterChange}>
            <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors rounded-md text-zinc-200">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="期限" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 rounded-md">
              <SelectItem
                value="all"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                すべて
              </SelectItem>
              <SelectItem
                value="overdue"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                期限切れ
              </SelectItem>
              <SelectItem
                value="today"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                今日
              </SelectItem>
              <SelectItem
                value="upcoming"
                className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
              >
                今後
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(sortBy !== 'custom' ||
        statusFilter !== 'all' ||
        dueDateFilter !== 'all') && (
        <div className="flex justify-end">
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            リセット
          </Button>
        </div>
      )}
    </div>
  );
}
