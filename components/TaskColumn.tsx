'use client';

import type {
  DroppableProvided,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { Droppable } from '@hello-pangea/dnd';
import { Draggable } from '@hello-pangea/dnd';
import TaskItem from '@/components/TaskItem';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Plus,
  CalendarIcon,
  Flag,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';

interface TaskColumnProps {
  title: string;
  droppableId: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
    created_at: string;
  }[];
  mutateTasks: () => void;
}

export default function TaskColumn({
  title,
  droppableId,
  tasks,
  mutateTasks,
}: TaskColumnProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');
  const [statusFilter, setStatusFilter] = useState<'all' | '未完了' | '完了'>(
    'all'
  );
  const [dueDateFilter, setDueDateFilter] = useState<
    'all' | 'overdue' | 'today' | 'upcoming'
  >('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );
  const { data: session } = useSession();
  const { toast } = useToast();

  const isBox = droppableId === 'box';

  // フィルターとソートを適用したタスクリストを生成
  const filteredAndSortedTasks = useMemo(() => {
    if (!isBox) return tasks;

    let filtered = [...tasks];

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
      if (sortBy === 'priority') {
        // 優先度の順序を定義（high → medium → low）
        const priorityMap: Record<string, number> = {
          high: 0,
          medium: 1,
          low: 2,
          '': 3, // 優先度が設定されていない場合は最後に表示
        };

        // 優先度が未設定の場合は空文字列として扱う
        const priorityA = a.priority || '';
        const priorityB = b.priority || '';

        // 優先度でソート
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
      } else {
        // createdAt順（新しい順）
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    });
  }, [tasks, isBox, sortBy, statusFilter, dueDateFilter]);

  // フィルターが適用されているかどうかをチェック
  const isFiltering = useMemo(() => {
    return statusFilter !== 'all' || dueDateFilter !== 'all';
  }, [statusFilter, dueDateFilter]);

  // アクティブなフィルターの数を計算
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (dueDateFilter !== 'all') count++;
    return count;
  }, [statusFilter, dueDateFilter]);

  const renderNewTaskForm = () => (
    <li className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-start mb-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="タイトルを入力"
          className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-400 p-0 h-auto text-sm focus-visible:ring-0"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
          onClick={() => setIsAddingTask(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
        placeholder="詳細を入力"
        className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-400 p-0 text-xs min-h-[40px] focus-visible:ring-0"
      />

      <div className="mt-3 flex items-center gap-2">
        <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
          <SelectTrigger className="h-7 w-7 bg-transparent border-none hover:bg-zinc-700 focus:ring-0 p-0">
            <SelectValue
              placeholder={<Flag className="h-4 w-4 text-zinc-400" />}
            >
              {newTaskPriority && (
                <Flag
                  className={cn(
                    'h-4 w-4',
                    newTaskPriority === 'high' && 'text-rose-500',
                    newTaskPriority === 'medium' && 'text-amber-500',
                    newTaskPriority === 'low' && 'text-emerald-500'
                  )}
                />
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem
              value="high"
              className="text-rose-500 hover:bg-zinc-800"
            >
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4" />高
              </span>
            </SelectItem>
            <SelectItem
              value="medium"
              className="text-amber-500 hover:bg-zinc-800"
            >
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4" />中
              </span>
            </SelectItem>
            <SelectItem
              value="low"
              className="text-emerald-500 hover:bg-zinc-800"
            >
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4" />低
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 w-7 p-0',
                newTaskDueDate
                  ? 'text-blue-500 bg-blue-500/20'
                  : 'text-zinc-400 hover:text-blue-500'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
            <DayPicker
              mode="single"
              selected={newTaskDueDate}
              onSelect={(date: Date | undefined) => setNewTaskDueDate(date)}
              locale={ja}
              className="bg-zinc-900"
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={handleAddTask}
          disabled={!newTaskTitle || !newTaskPriority}
          className={cn(
            'h-7 w-7 p-0',
            !newTaskTitle || !newTaskPriority
              ? 'text-zinc-600'
              : 'text-zinc-400 hover:text-zinc-100'
          )}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );

  const handleAddTask = async () => {
    if (!session?.user?.id || !newTaskTitle || !newTaskPriority) {
      toast({
        title: 'エラー',
        description: '必須項目を入力してください',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
          status: '未完了',
          category: droppableId,
          due_date: newTaskDueDate?.toISOString(),
        }),
      });

      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('');
        setNewTaskDueDate(undefined);
        setIsAddingTask(false);
        mutateTasks();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const renderDroppableContent = (
    provided: DroppableProvided,
    snapshot: DroppableStateSnapshot
  ) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`p-4 border ${
        snapshot.isDraggingOver ? 'border-blue-500' : 'border-zinc-800'
      } bg-zinc-900 rounded-lg min-h-[60vh] transition-colors duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
        {isBox && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
              >
                <SlidersHorizontal
                  className={`h-4 w-4 ${isFiltering ? 'text-blue-400' : ''}`}
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
                      sortBy !== 'priority' ? 'text-zinc-400' : 'text-blue-400'
                    }`}
                  />
                  <Select
                    value={sortBy}
                    onValueChange={(value: 'priority' | 'createdAt') =>
                      setSortBy(value)
                    }
                  >
                    <SelectTrigger className="h-8 w-full bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="並び替え" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="priority">優先度順</SelectItem>
                      <SelectItem value="createdAt">作成日順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      statusFilter === 'all' ? 'text-zinc-400' : 'text-blue-400'
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
        )}
      </div>

      <ul className="space-y-2">
        {isAddingTask && renderNewTaskForm()}
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
                  onMutate={async () => await mutateTasks()}
                />
              </div>
            )}
          </Draggable>
        ))}
        {!isAddingTask && (
          <Button
            variant="ghost"
            className="w-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            新規タスク
          </Button>
        )}
        {provided.placeholder}
      </ul>
    </div>
  );

  return (
    <Droppable droppableId={droppableId} type="TASK">
      {(provided, snapshot) => renderDroppableContent(provided, snapshot)}
    </Droppable>
  );
}
