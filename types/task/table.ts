import { DragEndEvent } from '@dnd-kit/core';
import { type SetStateAction } from 'react';

import { TaskWithExtras, UpdateTaskRequest } from '@/types/task';

// テーブル関連の型をすべてここに集約
export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width: number;
  minWidth: number;
  sortable?: boolean;
}

export interface FilterState {
  [columnId: string]: string[];
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// テーブルヘッダーのProps
export interface TableHeaderProps {
  columns: ColumnConfig[];
  sortConfig: SortConfig | null;
  filters: FilterState;
  onSort: (columnId: string) => void;
  onColumnResize: (columnId: string, width: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
  getFilterOptions: (columnId: string) => Array<{ value: string; label: string }>;
  setFilters: (value: SetStateAction<FilterState>) => void;
}

// タスク行のProps
export interface TaskRowProps {
  task: TaskWithExtras;
  columns: ColumnConfig[];
  handleUpdateTask: (taskId: string, values: UpdateTaskRequest) => Promise<void>;
}