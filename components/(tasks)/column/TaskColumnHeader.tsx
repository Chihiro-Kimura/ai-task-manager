'use client';

import { ArrowDownAZ, Calendar, CheckCircle, Flag, GripVertical, Plus, SlidersHorizontal } from 'lucide-react';

import TaskFilters from '@/components/(tasks)/filters/TaskFilters';
import { AddButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/styles';

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
}: TaskColumnHeaderProps) {
  const getSortIcon = () => {
    switch (sortBy) {
      case 'custom':
        return <GripVertical className="h-4 w-4" />;
      case 'priority':
        return <Flag className="h-4 w-4" />;
      case 'dueDate':
        return <Calendar className="h-4 w-4" />;
      case 'createdAt':
        return <ArrowDownAZ className="h-4 w-4" />;
      default:
        return <SlidersHorizontal className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            sortBy !== 'custom' && 'text-blue-400'
          )}
          onClick={() => {
            const nextSort = sortBy === 'custom' ? 'priority' : 'custom';
            onSortByChange(nextSort);
          }}
          title={sortBy === 'custom' ? 'カスタム順' : '優先度順に切り替え'}
        >
          {getSortIcon()}
        </Button>
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

        <AddButton
          size="sm"
          onClick={onAddTask}
          title="タスクを追加"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </AddButton>
      </div>
    </div>
  );
}
