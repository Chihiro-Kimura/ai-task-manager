import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Settings2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/(common)/error/ErrorState';
import LoadingState from '@/components/(common)/loading/LoadingState';
import { EditTaskForm } from '@/components/(tasks)/forms/EditTaskForm';
import AITaskAnalysis from '@/components/(tasks)/item/features/ai/AITaskAnalysis';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody } from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTaskApi } from '@/hooks/use-task-api';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras, UpdateTaskRequest } from '@/types/task';
import { TASK_STATUS_CONFIG } from '@/types/task/status';
import { type ColumnConfig, type FilterState, type SortConfig } from '@/types/task/table';

import { TaskEditDialog } from '../forms/TaskEditDialog';

import { ColumnSettings } from './ColumnSettings';
import { TaskTableHeader } from './table/TableHeader';
import { TaskRow } from './table/TaskRow';


// デフォルトのカラム設定を修正
const defaultColumns: ColumnConfig[] = [
  { id: 'title', label: 'タイトル', visible: true, width: 200, minWidth: 150, sortable: true },
  { id: 'status', label: 'ステータス', visible: true, width: 100, minWidth: 80, sortable: true },
  { id: 'priority', label: '優先度', visible: true, width: 80, minWidth: 60, sortable: true },
  { id: 'category', label: 'カテゴリー', visible: true, width: 100, minWidth: 80, sortable: true },
  { id: 'due_date', label: '期限', visible: true, width: 100, minWidth: 80, sortable: true },
  { id: 'tags', label: 'タグ', visible: true, width: 150, minWidth: 100, sortable: false },
  { id: 'createdAt', label: '作成日', visible: false, width: 100, minWidth: 80, sortable: true },
];

const fetcher = async (url: string): Promise<TaskWithExtras[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export default function ListView(): ReactElement {
  const { data: session } = useSession();
  const { tasks, setTasks } = useTaskStore();
  const [columns, setColumns] = useLocalStorage<ColumnConfig[]>('task-list-columns', defaultColumns);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithExtras | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { toast } = useToast();
  const { updateTask: apiUpdateTask } = useTaskApi(undefined, {
    onSuccess: () => void mutateTasks()
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  const {
    data: fetchedTasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR<TaskWithExtras[]>(
    session?.user?.id ? '/api/tasks' : null,
    fetcher
  );

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  // フィルターオプションの取得
  const getFilterOptions = useCallback((columnId: string) => {
    switch (columnId) {
      case 'status':
        return Object.entries(TASK_STATUS_CONFIG).map(([value, config]) => ({
          value,
          label: config.label
        }));
      case 'priority':
        return [
          { value: '高', label: '高' },
          { value: '中', label: '中' },
          { value: '低', label: '低' }
        ];
      case 'tags':
        const uniqueTags = new Set(
          tasks.flatMap(task => task.tags?.map(tag => tag.name) ?? [])
        );
        return Array.from(uniqueTags).map(tag => ({
          value: tag,
          label: tag
        }));
      default:
        return [];
    }
  }, [tasks]);

  const handleSort = useCallback((columnId: string): void => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === columnId) {
        if (currentSort.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        }
        return null;
      }
      return { key: columnId, direction: 'asc' };
    });
  }, []);

  const sortedAndFilteredTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    Object.entries(filters).forEach(([columnId, selectedValues]) => {
      if (selectedValues.length > 0) {
        filteredTasks = filteredTasks.filter((task) => {
          switch (columnId) {
            case 'status':
            case 'priority':
              return task[columnId] && selectedValues.includes(task[columnId] as string);
            case 'tags':
              return task.tags?.some((tag) => selectedValues.includes(tag.name)) ?? false;
            default:
              return true;
          }
        });
      }
    });

    if (sortConfig) {
      filteredTasks.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof TaskWithExtras];
        const bValue = b[sortConfig.key as keyof TaskWithExtras];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue < bValue ? -1 * direction : aValue > bValue ? 1 * direction : 0;
      });
    }

    return filteredTasks;
  }, [tasks, filters, sortConfig]);

  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, width } : col
    ));
  }, [setColumns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumns(prev => {
      const oldIndex = prev.findIndex(col => col.id === active.id);
      const newIndex = prev.findIndex(col => col.id === over.id);

      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, movedColumn);

      return newColumns;
    });
  }, [setColumns]);

  const handleUpdateTask = useCallback(async (taskId: string, values: UpdateTaskRequest) => {
    if (!taskId) {
      console.error('Task ID is missing');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await mutateTasks();
      toast({
        title: '更新完了',
        description: 'タスクを更新しました',
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  }, [mutateTasks, toast]);

  // resetColumnsとresetColumnWidthsを復活させる
  const resetColumns = useCallback(() => {
    setColumns(defaultColumns);
  }, [setColumns]);

  const resetColumnWidths = useCallback(() => {
    setColumns(prev => prev.map(col => ({
      ...col,
      width: defaultColumns.find(defaultCol => defaultCol.id === col.id)?.width || col.width
    })));
  }, [setColumns]);

  // ResizeObserverを使用してテーブルの幅を監視
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  // テーブル幅の変更を監視
  useEffect(() => {
    if (!tableContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setTableWidth(width);
      }
    });

    resizeObserver.observe(tableContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // テーブル幅が変更されたときにカラム幅を調整
  useEffect(() => {
    if (tableWidth === 0) return;

    const visibleColumns = columns.filter(col => col.visible);
    const totalMinWidth = visibleColumns.reduce((acc, col) => acc + col.minWidth, 0);
    const availableWidth = tableWidth - 16; // スクロールバーのスペースを考慮

    // 最小幅の合計が利用可能な幅を超えている場合は、最小幅を維持
    if (totalMinWidth > availableWidth) {
      const newColumns = columns.map(col => ({
        ...col,
        width: col.minWidth
      }));
      setColumns(newColumns);
      return;
    }

    // 余剰スペースを比例配分（タイトルカラムに優先的に配分）
    const extraSpace = availableWidth - totalMinWidth;
    const titleColumn = visibleColumns.find(col => col.id === 'title');
    
    const newColumns = columns.map(col => {
      if (col.id === 'title' && titleColumn) {
        // タイトルカラムには余剰スペースの50%を配分
        return {
          ...col,
          width: Math.floor(col.minWidth + (extraSpace * 0.5))
        };
      }
      // 他のカラムで残りのスペースを均等に分配
      const remainingColumns = visibleColumns.length - 1;
      const extraPerColumn = (extraSpace * 0.5) / remainingColumns;
      return {
        ...col,
        width: Math.floor(col.minWidth + extraPerColumn)
      };
    });

    if (JSON.stringify(columns) !== JSON.stringify(newColumns)) {
      setColumns(newColumns);
    }
  }, [tableWidth, columns]);

  const handleFilterChange = useCallback((columnId: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: values,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // イベントリスナーを追加
  useEffect(() => {
    const handleOpenTaskEdit = (event: Event): void => {
      const customEvent = event as CustomEvent;
      const task = customEvent.detail;
      setSelectedTask(task);
      setIsEditModalOpen(true);
    };

    window.addEventListener('openTaskEdit', handleOpenTaskEdit);
    return () => {
      window.removeEventListener('openTaskEdit', handleOpenTaskEdit);
    };
  }, []);

  if (error) return <ErrorState message={error.message} />;
  if (isLoading) return <LoadingState />;

  return (
    <div className="relative space-y-4">
      <div className="flex justify-end px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsColumnSettingsOpen(true)}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          テーブル設定
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border border-zinc-800">
        <div ref={tableContainerRef} className="table-container w-full">
          <DndContext onDragEnd={handleDragEnd}>
            <Table>
              <TaskTableHeader
                columns={columns}
                sortConfig={sortConfig}
                filters={filters}
                onSort={handleSort}
                onColumnResize={handleColumnResize}
                onDragEnd={handleDragEnd}
                getFilterOptions={getFilterOptions}
                setFilters={setFilters}
              />
              <TableBody>
                {sortedAndFilteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    columns={columns.filter(col => col.visible)}
                    handleUpdateTask={handleUpdateTask}
                  />
                ))}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </ScrollArea>

      <Dialog open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <ColumnSettings
            columns={columns}
            filters={filters}
            sortConfig={sortConfig}
            onColumnsChange={setColumns}
            onFilterChange={handleFilterChange}
            onSortChange={handleSort}
            onReset={resetColumns}
            onResetWidths={resetColumnWidths}
            getFilterOptions={getFilterOptions}
            onClearFilters={handleClearFilters}
          />
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskEditDialog
          task={selectedTask}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={async (values) => {
            console.log('ListView onSubmit called with values:', values); // デバッグログ
            try {
              const { dueDate, tags: selectedTags, ...rest } = values;
              await handleUpdateTask(selectedTask.id, {
                ...rest,
                due_date: dueDate?.toISOString() ?? null,
                tags: selectedTags.map(tag => ({ id: tag.id })),
              });
              setIsEditModalOpen(false);
              setSelectedTask(null);
            } catch (error) {
              console.error('Error submitting form:', error);
            }
          }}
        />
      )}
    </div>
  );
} 