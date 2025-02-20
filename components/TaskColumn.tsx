'use client';

import { Droppable } from '@hello-pangea/dnd';
import { RotateCcw } from 'lucide-react';

import TaskColumnContent from '@/components/TaskColumnContent';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskStore } from '@/store/taskStore';

type SortMode = 'custom' | 'priority' | 'createdAt' | 'dueDate';
type Category = 'box' | 'now' | 'next';

interface ITaskColumnProps {
  category: Category;
  title: string;
  getSortModeName: (mode: SortMode) => string;
  onSortChange: (value: SortMode) => void;
  onReset: () => void;
}

export default function TaskColumn({
  category,
  title,
  getSortModeName,
  onSortChange,
  onReset,
}: ITaskColumnProps): React.JSX.Element {
  const { sortBy } = useTaskStore();
  const currentSortMode = sortBy[category];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Select value={currentSortMode} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                {getSortModeName('custom')}
              </SelectItem>
              <SelectItem value="priority">
                {getSortModeName('priority')}
              </SelectItem>
              <SelectItem value="createdAt">
                {getSortModeName('createdAt')}
              </SelectItem>
              <SelectItem value="dueDate">
                {getSortModeName('dueDate')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            disabled={currentSortMode === 'custom'}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Droppable droppableId={category}>
        {(provided) => (
          <TaskColumnContent
            category={category}
            provided={provided}
            className="flex-1 overflow-y-auto p-4"
          />
        )}
      </Droppable>
    </div>
  );
}
