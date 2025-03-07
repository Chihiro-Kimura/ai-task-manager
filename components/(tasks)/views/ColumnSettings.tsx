'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/styles';
import { type ColumnConfig, type FilterState, type SortConfig } from '@/types/task/table';

import { FilterSettings } from './filters/FilterSettings';

interface ColumnSettingsProps {
  columns: ColumnConfig[];
  filters: FilterState;
  sortConfig: SortConfig | null;
  onColumnsChange: (columns: ColumnConfig[]) => void;
  onFilterChange: (columnId: string, values: string[]) => void;
  onSortChange: (columnId: string) => void;
  onReset: () => void;
  onResetWidths: () => void;
  getFilterOptions: (columnId: string) => Array<{ value: string; label: string }>;
  onClearFilters: () => void;
}

function SortableColumnItem({ column, onToggle }: {
  column: ColumnConfig;
  onToggle: (id: string) => void;
}): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-4 bg-zinc-900 rounded-lg',
        isDragging && 'opacity-50'
      )}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="flex-1">{column.label}</div>
      <Switch
        checked={column.visible}
        onCheckedChange={() => onToggle(column.id)}
      />
    </div>
  );
}

export function ColumnSettings({
  columns,
  filters,
  sortConfig,
  onColumnsChange,
  onFilterChange,
  onSortChange,
  onReset,
  onResetWidths,
  getFilterOptions,
  onClearFilters,
}: ColumnSettingsProps): ReactElement {
  const [activeTab, setActiveTab] = useState('columns');

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex(col => col.id === active.id);
    const newIndex = columns.findIndex(col => col.id === over.id);

    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(oldIndex, 1);
    newColumns.splice(newIndex, 0, movedColumn);

    onColumnsChange(newColumns);
  };

  const toggleColumnVisibility = (columnId: string): void => {
    onColumnsChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>テーブル設定</DialogTitle>
      </DialogHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="columns">カラム</TabsTrigger>
          <TabsTrigger value="filters">フィルター</TabsTrigger>
        </TabsList>
        <TabsContent value="columns" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div className="flex gap-2 sticky top-0 bg-background z-10 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex-1"
                >
                  デフォルトに戻す
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetWidths}
                  className="flex-1"
                >
                  幅をリセット
                </Button>
              </div>
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {columns.map(column => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        onToggle={toggleColumnVisibility}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="filters">
          <FilterSettings
            filters={filters}
            sortConfig={sortConfig}
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
            getFilterOptions={getFilterOptions}
            onClearFilters={onClearFilters}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}