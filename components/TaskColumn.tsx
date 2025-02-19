'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Draggable } from '@hello-pangea/dnd';
import TaskItem from '@/components/TaskItem';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import AddTaskForm from '@/components/AddTaskForm';
import { KeyedMutator } from 'swr';
import { Task } from '@prisma/client';

interface TaskColumnProps {
  droppableId: string;
  title: string;
  tasks: Task[];
  onTasksChange: KeyedMutator<Task[]>;
}

interface CreateTaskData {
  title: string;
  description: string;
  priority: string;
  status: string;
  task_order: number;
  category: string;
}

export default function TaskColumn({
  droppableId,
  title,
  tasks,
  onTasksChange,
}: TaskColumnProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt' | 'dueDate'>(
    'priority'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | '未完了' | '完了'>(
    'all'
  );
  const [dueDateFilter, setDueDateFilter] = useState<
    'all' | 'overdue' | 'today' | 'upcoming'
  >('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const isFiltering = useMemo(() => {
    return statusFilter !== 'all' || dueDateFilter !== 'all';
  }, [statusFilter, dueDateFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (dueDateFilter !== 'all') count++;
    return count;
  }, [statusFilter, dueDateFilter]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks] as Array<Task & { status: string }>;

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // 期限フィルター
    if (dueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((task) => {
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
          default:
            return true;
        }
      });
    }

    // ソート
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          // 優先度の順序を定義（high → medium → low）
          const priorityMap: Record<string, number> = {
            high: 0,
            medium: 1,
            low: 2,
            '': 3,
          };
          const priorityA = a.priority || '';
          const priorityB = b.priority || '';
          const priorityDiff = priorityMap[priorityA] - priorityMap[priorityB];

          // 優先度が同じ場合は期限日でソート
          if (priorityDiff === 0) {
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return (
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            );
          }
          return priorityDiff;

        case 'dueDate':
          // 期限日でソート（期限なしは後ろに）
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );

        case 'createdAt':
          // 作成日順（新しい順）
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        default:
          return 0;
      }
    });
  }, [tasks, sortBy, statusFilter, dueDateFilter]);

  // セッション情報のデバッグログ
  useEffect(() => {
    console.log('Current session:', session);
  }, [session]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to add tasks</div>;

  const handleAddTask = async (taskData: CreateTaskData) => {
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
          error instanceof Error ? error.message : 'タスクの追加に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
  };

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <SlidersHorizontal
                      className={`h-4 w-4 ${
                        isFiltering ? 'text-blue-400' : ''
                      }`}
                    />
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 bg-zinc-900 border-zinc-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">フィルター</span>
                      {isFiltering && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-100"
                          onClick={() => {
                            setStatusFilter('all');
                            setDueDateFilter('all');
                          }}
                        >
                          リセット
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUpDown
                        className={`h-4 w-4 ${
                          sortBy !== 'priority'
                            ? 'text-zinc-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <Select
                        value={sortBy}
                        onValueChange={(
                          value: 'priority' | 'createdAt' | 'dueDate'
                        ) => setSortBy(value)}
                      >
                        <SelectTrigger className="h-8 w-full bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="並び替え" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="priority">優先度順</SelectItem>
                          <SelectItem value="dueDate">締切日順</SelectItem>
                          <SelectItem value="createdAt">作成日順</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          statusFilter === 'all'
                            ? 'text-zinc-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <Select
                        value={statusFilter}
                        onValueChange={(value: 'all' | '未完了' | '完了') =>
                          setStatusFilter(value)
                        }
                      >
                        <SelectTrigger className="h-8 w-full bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="状態" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">すべて</SelectItem>
                          <SelectItem value="未完了">未完了</SelectItem>
                          <SelectItem value="完了">完了</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`h-4 w-4 ${
                          dueDateFilter === 'all'
                            ? 'text-zinc-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <Select
                        value={dueDateFilter}
                        onValueChange={(
                          value: 'all' | 'overdue' | 'today' | 'upcoming'
                        ) => setDueDateFilter(value)}
                      >
                        <SelectTrigger className="h-8 w-full bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="期限" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">すべて</SelectItem>
                          <SelectItem value="overdue">期限切れ</SelectItem>
                          <SelectItem value="today">今日</SelectItem>
                          <SelectItem value="upcoming">今後</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ul className="space-y-2">
            {isAddingTask && (
              <AddTaskForm
                onSubmit={handleAddTask}
                onCancel={handleCancelAdd}
                category={droppableId}
              />
            )}
            {filteredAndSortedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskItem
                      task={task}
                      onMutate={async () => {
                        await onTasksChange();
                      }}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        </div>
      )}
    </Droppable>
  );
}
