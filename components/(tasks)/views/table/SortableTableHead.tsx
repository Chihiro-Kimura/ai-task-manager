'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type ReactElement, type SetStateAction } from 'react';

import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils/styles';
import { type ColumnConfig, type FilterState, type SortConfig } from '@/types/task/table';

import { ColumnResizer } from '../ColumnResizer';
import { ColumnFilter } from '../filters/ColumnFilter';

interface SortableTableHeadProps {
  column: ColumnConfig;
  onSort?: (columnId: string) => void;
  onResize: (width: number) => void;
  sortConfig: SortConfig | null;
  filters: FilterState;
  getFilterOptions: (columnId: string) => Array<{ value: string; label: string }>;
  setFilters: (value: SetStateAction<FilterState>) => void;
}

export function SortableTableHead({
  column,
  onSort,
  onResize,
  sortConfig,
  filters,
  getFilterOptions,
  setFilters
}: SortableTableHeadProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: column
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${column.width}px`,
    minWidth: `${column.minWidth}px`,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto'
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        "select-none touch-none relative p-2",
        isDragging && "z-50"
      )}
      {...attributes}
    >
      <span className="flex items-center gap-1 text-sm">
        <button
          type="button"
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800/50 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </button>

        {column.sortable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSort?.(column.id);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800/50 transition-colors"
          >
            <span>{column.label}</span>
            <span className="ml-1">
              {sortConfig?.key === column.id && (
                sortConfig.direction === 'asc' ? '↑' : '↓'
              )}
            </span>
          </button>
        ) : (
          <span>{column.label}</span>
        )}

        {(column.id === 'status' || column.id === 'priority' || column.id === 'tags') && (
          <ColumnFilter
            columnId={column.id}
            label={column.label}
            options={getFilterOptions(column.id)}
            selectedValues={filters[column.id] || []}
            onChange={(values) => {
              setFilters((prev) => ({
                ...prev,
                [column.id]: values,
              }));
            }}
          />
        )}
      </span>
      <ColumnResizer
        onResize={onResize}
        minWidth={column.minWidth}
        maxWidth={500}
      />
    </TableHead>
  );
} 