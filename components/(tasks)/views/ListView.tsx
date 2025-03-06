'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, MoreHorizontal, Pencil, Settings2, Trash2, Wand2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/(common)/error/ErrorState';
import LoadingState from '@/components/(common)/loading/LoadingState';
import { EditTaskForm } from '@/components/(tasks)/forms/EditTaskForm';
import AITaskAnalysis from '@/components/(tasks)/item/features/ai/AITaskAnalysis';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTaskApi } from '@/hooks/use-task-api';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
import { Tag } from '@/types/common';
import { TaskWithExtras, UpdateTaskRequest } from '@/types/task';

// カラムの設定型
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  sortable?: boolean;
}

// デフォルトのカラム設定
const defaultColumns: ColumnConfig[] = [
  { id: 'title', label: 'タイトル', visible: true, sortable: true },
  { id: 'priority', label: '優先度', visible: true, sortable: true },
  { id: 'status', label: 'ステータス', visible: true, sortable: true },
  { id: 'category', label: 'カテゴリー', visible: true, sortable: true },
  { id: 'due_date', label: '期限', visible: true, sortable: true },
  { id: 'tags', label: 'タグ', visible: true },
  { id: 'createdAt', label: '作成日', visible: false, sortable: true },
  { id: 'updatedAt', label: '更新日', visible: false, sortable: true },
];

const fetcher = async (url: string): Promise<TaskWithExtras[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

// SortableTableHeadコンポーネントを追加
function SortableTableHead({ column, children, onSort }: {
  column: ColumnConfig;
  children: React.ReactNode;
  onSort?: (columnId: string) => void;
}): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
      onClick={(e) => {
        e.preventDefault();
        if (column.sortable && onSort) {
          onSort(column.id);
        }
      }}
    >
      {children}
    </TableHead>
  );
}

export default function ListView(): ReactElement {
  const { data: session } = useSession();
  const { tasks, setTasks } = useTaskStore();
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithExtras | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { toast } = useToast();

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

  // ソート済みのタスクを取得
  const sortedTasks = useMemo(() => {
    if (!sortConfig) return tasks;

    return [...tasks].sort((a, b) => {
      if (sortConfig.key === 'priority') {
        const priorityOrder = { '高': 0, '中': 1, '低': 2 };
        const aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aValue = a[sortConfig.key as keyof TaskWithExtras];
      const bValue = b[sortConfig.key as keyof TaskWithExtras];

      if (!aValue || !bValue) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [tasks, sortConfig]);

  const handleSort = (columnId: string): void => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === columnId) {
        if (currentSort.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        }
        return null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const handleEdit = (task: TaskWithExtras): void => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleAIAnalysis = (task: TaskWithExtras): void => {
    setSelectedTask(task);
    setIsAIModalOpen(true);
  };

  const { deleteTask: apiDeleteTask, updateTask: apiUpdateTask } = useTaskApi('', {
    onSuccess: () => {
      void mutateTasks();
    },
  });

  const handleDelete = async (task: TaskWithExtras): Promise<void> => {
    try {
      await apiDeleteTask();
      setTasks(tasks.filter((t) => t.id !== task.id));
      toast({
        title: '✨ タスクを削除しました',
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async (taskId: string, values: { dueDate?: Date; tags: Tag[] } & Omit<UpdateTaskRequest, 'due_date' | 'tags'>): Promise<void> => {
    try {
      const { dueDate, tags: selectedTags, ...rest } = values;
      await apiUpdateTask({
        ...rest,
        due_date: dueDate?.toISOString() ?? null,
        tags: selectedTags.map((tag: Tag) => ({ id: tag.id })),
      });
      setIsEditModalOpen(false);
      setSelectedTask(null);
      await mutateTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const toggleColumnVisibility = (columnId: string): void => {
    setColumns(columns.map(column => 
      column.id === columnId 
        ? { ...column, visible: !column.visible }
        : column
    ));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-sm font-medium text-zinc-400">タスク一覧</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <h3 className="text-xs font-medium text-zinc-400">表示する列</h3>
            </div>
            {columns.map(column => (
              <DropdownMenuItem
                key={column.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleColumnVisibility(column.id)}
              >
                <span className="text-sm">{column.label}</span>
                {column.visible && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1">
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={columns.filter((column) => column.visible).map((column) => column.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {columns
                      .filter((column) => column.visible)
                      .map((column) => (
                        <SortableTableHead
                          key={column.id}
                          column={column}
                          onSort={column.sortable ? handleSort : undefined}
                        >
                          {column.label}
                          {sortConfig?.key === column.id && (
                            <span className="ml-2">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </SortableTableHead>
                      ))}
                  </SortableContext>
                </DndContext>
                <TableHead className="w-[100px]">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow key={task.id}>
                  {columns
                    .filter((column) => column.visible)
                    .map((column) => (
                      <TableCell
                        key={`${task.id}-${column.id}`}
                        className={column.id === 'title' ? 'cursor-pointer hover:text-zinc-200' : ''}
                        onClick={() => column.id === 'title' && handleEdit(task)}
                      >
                        {renderCellContent(task, column.id)}
                      </TableCell>
                    ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(task)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAIAnalysis(task)}
                          className="cursor-pointer"
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          AI分析
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleDelete(task)}
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* 編集モーダル */}
      {selectedTask && isEditModalOpen && (
        <EditTaskForm
          task={selectedTask}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={async (values) => {
            await handleUpdateTask(selectedTask.id, values);
          }}
        />
      )}

      {/* AI分析モーダル */}
      {selectedTask && isAIModalOpen && (
        <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
          <DialogContent>
            <AITaskAnalysis
              task={selectedTask}
              onMutate={async () => {
                await mutateTasks();
              }}
              onClose={() => setIsAIModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// セルの内容をレンダリングするヘルパー関数
function renderCellContent(task: TaskWithExtras, columnId: string): ReactElement | string | null {
  switch (columnId) {
    case 'title':
      return task.title;
    case 'priority':
      return task.priority || '-';
    case 'status':
      return task.status;
    case 'category':
      return task.category;
    case 'due_date':
      return task.due_date ? new Date(task.due_date).toLocaleDateString() : '-';
    case 'tags':
      return task.tags?.map((tag) => tag.name).join(', ') || '-';
    case 'createdAt':
      return new Date(task.createdAt).toLocaleDateString();
    case 'updatedAt':
      return new Date(task.updatedAt).toLocaleDateString();
    default:
      return null;
  }
} 