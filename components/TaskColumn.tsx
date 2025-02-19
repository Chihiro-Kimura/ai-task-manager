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
  onAddTask: (task: {
    title: string;
    description: string;
    priority: string;
    status: string;
    task_order: number;
    category: string;
  }) => Promise<void>;
}

type StatusFilter = 'all' | '未完了' | '完了';
type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming';

export default function TaskColumn({
  droppableId,
  title,
  tasks,
  onTasksChange,
  sortBy,
  onSortByChange,
  sortMode,
  onReset,
  onAddTask,
}: TaskColumnProps) {
  const { status } = useSession();
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

  const handleAddTask = async (
    taskData: Omit<CreateTaskData, 'task_order'>
  ) => {
    try {
      await onAddTask({
        ...taskData,
        status: 'pending',
        task_order: 0,
        category: droppableId,
      });
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの追加に失敗しました',
        variant: 'destructive',
      });
    }
  };

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
