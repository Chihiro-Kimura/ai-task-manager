'use client';

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { type ReactElement } from 'react';

import { TableHeader, TableRow } from '@/components/ui/table';
import { type TableHeaderProps } from '@/types/task/table';

import { SortableTableHead } from './SortableTableHead';

export function TaskTableHeader({
  columns,
  sortConfig,
  filters,
  onSort,
  onColumnResize,
  getFilterOptions,
  setFilters,
}: TableHeaderProps): ReactElement {
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <TableHeader>
      <SortableContext
        items={visibleColumns.map((col) => col.id)}
        strategy={horizontalListSortingStrategy}
      >
        <TableRow>
          {visibleColumns.map((column) => (
            <SortableTableHead
              key={column.id}
              column={column}
              onSort={onSort}
              onResize={(width) => onColumnResize(column.id, width)}
              sortConfig={sortConfig}
              filters={filters}
              getFilterOptions={getFilterOptions}
              setFilters={setFilters}
            />
          ))}
        </TableRow>
      </SortableContext>
    </TableHeader>
  );
}

