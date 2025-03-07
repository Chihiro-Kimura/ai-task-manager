'use client';

import { type ReactElement } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils/styles';
import { type TaskRowProps } from '@/types/task/table';

import { renderCellContent } from './CellContent';

export function TaskRow({
  task,
  columns,
  handleUpdateTask,
}: TaskRowProps): ReactElement {
  const handleRowClick = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.interactive-cell') !== null;
    
    if (!isInteractive) {
      window.dispatchEvent(new CustomEvent('openTaskEdit', { detail: task }));
    }
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-zinc-800/50"
      onClick={handleRowClick}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          style={{ 
            width: `${column.width}px`,
            minWidth: `${column.minWidth}px`,
          }}
          className={cn(
            "overflow-hidden p-2",
            (column.id === 'status' || column.id === 'priority' || column.id === 'tags' || column.id === 'due_date') && 'interactive-cell'
          )}
        >
          {renderCellContent(task, column.id, handleUpdateTask)}
        </TableCell>
      ))}
    </TableRow>
  );
}