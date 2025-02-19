'use client';

import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import TaskFilters from '@/components/TaskFilters';

interface TaskColumnHeaderProps {
  title: string;
  isFiltering: boolean;
  activeFiltersCount: number;
  sortBy: 'custom' | 'priority' | 'createdAt' | 'dueDate';
  statusFilter: 'all' | '未完了' | '完了';
  dueDateFilter: 'all' | 'overdue' | 'today' | 'upcoming';
  onSortByChange: (
    value: 'custom' | 'priority' | 'createdAt' | 'dueDate'
  ) => void;
  onStatusFilterChange: (value: 'all' | '未完了' | '完了') => void;
  onDueDateFilterChange: (
    value: 'all' | 'overdue' | 'today' | 'upcoming'
  ) => void;
  onReset: () => void;
  onAddTask: () => void;
  sortMode: string;
}

export function TaskColumnHeader({
  title,
  isFiltering,
  activeFiltersCount,
  sortBy,
  statusFilter,
  dueDateFilter,
  onSortByChange,
  onStatusFilterChange,
  onDueDateFilterChange,
  onReset,
  onAddTask,
  sortMode,
}: TaskColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
        <span className="text-sm text-zinc-400">({sortMode})</span>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              title="フィルターとソート"
            >
              <SlidersHorizontal
                className={`h-4 w-4 ${
                  isFiltering || sortBy !== 'custom' ? 'text-blue-400' : ''
                }`}
              />
              {(activeFiltersCount > 0 || sortBy !== 'custom') && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                  {activeFiltersCount + (sortBy !== 'custom' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 bg-zinc-900 border-zinc-700">
            <TaskFilters
              sortBy={sortBy}
              onSortByChange={onSortByChange}
              statusFilter={statusFilter}
              onStatusFilterChange={onStatusFilterChange}
              dueDateFilter={dueDateFilter}
              onDueDateFilterChange={onDueDateFilterChange}
              onReset={onReset}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          onClick={onAddTask}
          title="タスクを追加"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
