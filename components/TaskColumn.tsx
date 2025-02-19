'use client';

import { Droppable } from '@hello-pangea/dnd';
import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { TaskWithExtras, CreateTaskData } from '@/types/task';
import { TaskColumnHeader } from './TaskColumnHeader';
import { TaskColumnContent } from '@/components/TaskColumnContent';

// 型定義
interface TaskColumnProps {
  droppableId: string;
  title: string;
  tasks: TaskWithExtras[];
  onTasksChange: () => Promise<void>;
  sortBy: 'custom' | 'priority' | 'createdAt' | 'dueDate';
  onSortByChange: (
    value: 'custom' | 'priority' | 'createdAt' | 'dueDate'
  ) => void;
  sortMode: string;
  onReset: () => void;
}

type StatusFilter = 'all' | '未完了' | '完了';
type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming';

const useAddTask = ({
  session,
  droppableId,
  onTasksChange,
  setIsAddingTask,
  toast,
}: {
  session: { user?: { id?: string } } | null;
  droppableId: string;
  onTasksChange: () => Promise<void>;
  setIsAddingTask: (value: boolean) => void;
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  return useCallback(
    async (taskData: Omit<CreateTaskData, 'task_order'>) => {
      if (!session?.user?.id) {
        toast({
          title: 'エラー',
          description: 'ログインが必要です',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': session.user.id,
          },
          body: JSON.stringify({
            ...taskData,
            category: droppableId,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'タスクの追加に失敗しました');
        }

        await onTasksChange();
        setIsAddingTask(false);
      } catch (error) {
        console.error('Failed to add task:', error);
        toast({
          title: 'エラー',
          description:
            error instanceof Error
              ? error.message
              : 'タスクの追加に失敗しました',
          variant: 'destructive',
        });
      }
    },
    [session?.user?.id, droppableId, onTasksChange, setIsAddingTask, toast]
  );
};

export default function TaskColumn({
  droppableId,
  title,
  tasks,
  onTasksChange,
  sortBy,
  onSortByChange,
  sortMode,
  onReset,
}: TaskColumnProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // 状態管理
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // フィルタリング関数
  const filterTasks = useCallback(
    (task: TaskWithExtras) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      if (dueDateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = task.due_date ? new Date(task.due_date) : null;

        switch (dueDateFilter) {
          case 'overdue':
            return dueDate && dueDate < today;
          case 'today':
            return (
              dueDate &&
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear()
            );
          case 'upcoming':
            return dueDate && dueDate > today;
        }
      }
      return true;
    },
    [statusFilter, dueDateFilter]
  );

  // フィルタリングとソートのロジック
  const displayTasks = useMemo(() => {
    const filtered = tasks.filter(filterTasks);
    const sorted = [...filtered];

    if (sortBy === 'priority') {
      const priorityOrder = { 高: 0, 中: 1, 低: 2 };
      return sorted.sort((a, b) => {
        const aOrder =
          priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bOrder =
          priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.task_order - b.task_order;
      });
    }

    return sorted.sort((a, b) => a.task_order - b.task_order);
  }, [tasks, filterTasks, sortBy]);

  const handleReset = useCallback(() => {
    setStatusFilter('all');
    setDueDateFilter('all');
    onReset();
  }, [onReset]);

  const handleAddTask = useAddTask({
    session,
    droppableId,
    onTasksChange,
    setIsAddingTask,
    toast,
  });

  const isFiltering = statusFilter !== 'all' || dueDateFilter !== 'all';
  const activeFiltersCount = [
    statusFilter !== 'all',
    dueDateFilter !== 'all',
  ].filter(Boolean).length;

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to add tasks</div>;

  return (
    <Droppable droppableId={droppableId} type="TASK">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`p-4 border ${
            snapshot.isDraggingOver ? 'border-blue-500' : 'border-zinc-800'
          } bg-zinc-900 rounded-lg min-h-[60vh] transition-colors duration-200`}
        >
          <TaskColumnHeader
            title={title}
            isFiltering={isFiltering}
            activeFiltersCount={activeFiltersCount}
            sortBy={sortBy}
            statusFilter={statusFilter}
            dueDateFilter={dueDateFilter}
            onSortByChange={onSortByChange}
            onStatusFilterChange={setStatusFilter}
            onDueDateFilterChange={setDueDateFilter}
            onReset={handleReset}
            onAddTask={() => setIsAddingTask(true)}
            sortMode={sortMode}
          />

          <TaskColumnContent
            isAddingTask={isAddingTask}
            tasks={displayTasks}
            onAddTask={handleAddTask}
            onCancelAdd={() => setIsAddingTask(false)}
            onTasksChange={onTasksChange}
            droppableId={droppableId}
            provided={provided}
          />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
