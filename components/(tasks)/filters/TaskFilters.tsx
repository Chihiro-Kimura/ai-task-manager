'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Calendar, CheckCircle } from 'lucide-react';

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
      <div className="flex gap-3 flex-wrap">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors rounded-md text-zinc-200">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 rounded-md">
            <SelectItem
              value="custom"
              className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
            >
              カスタム順
            </SelectItem>
            <SelectItem
              value="priority"
              className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
            >
              優先度順
            </SelectItem>
            <SelectItem
              value="dueDate"
              className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
            >
              締切日順
            </SelectItem>
            <SelectItem
              value="createdAt"
              className="hover:bg-zinc-800 cursor-pointer text-zinc-200"
            >
              作成日順
            </SelectItem>
          </SelectContent>
        </Select>

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

      {(sortBy !== 'custom' ||
        statusFilter !== 'all' ||
        dueDateFilter !== 'all') && (
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            リセット
          </button>
        </div>
      )}
    </div>
  );
}
