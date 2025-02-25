'use client';

import { useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskColumn from '@/components/(tasks)/column/TaskColumn';
import LoadingState from '@/components/(common)/loading/LoadingState';
import ErrorState from '@/components/(common)/error/ErrorState';
import { TaskWithExtras } from '@/types/task';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TaskList() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    tasks,
    setTasks,
    updateTaskOrder,
    sortBy,
    setSortBy,
    getFilteredAndSortedTasks,
    isEditModalOpen,
  } = useTaskStore();

  // useSWRを使用してタスクを取得
  const {
    data: fetchedTasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR<TaskWithExtras[]>(
    session?.user?.id ? '/api/tasks' : null,
    async (url: string) => {
      if (!session?.user?.id) return [];

      if (isDevelopment) {
        console.log('🔍 Fetching tasks for user:', session.user.id);
      }

      const response = await fetch(url, {
        headers: {
          'X-User-Id': session.user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log('✅ Tasks fetched:', data.length);
      }
      return data;
    }
  );

  // fetchedTasksが更新されたらstateを更新
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || isEditModalOpen) return;

    const sourceCategory = result.source.droppableId;
    const destinationCategory = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (
      sourceCategory === destinationCategory &&
      sourceIndex === destinationIndex
    ) {
      return;
    }

    // カスタム順でない場合は、カスタム順に切り替える
    if (
      sortBy[sourceCategory as keyof typeof sortBy] !== 'custom' ||
      sortBy[destinationCategory as keyof typeof sortBy] !== 'custom'
    ) {
      // 現在の表示順でtask_orderを更新
      const sourceCategoryTasks = getFilteredAndSortedTasks(
        sourceCategory as 'box' | 'now' | 'next'
      );
      const destinationCategoryTasks =
        sourceCategory === destinationCategory
          ? sourceCategoryTasks
          : getFilteredAndSortedTasks(
              destinationCategory as 'box' | 'now' | 'next'
            );

      const updatedTasks = [...tasks];

      // 移動元カテゴリーのタスクの順序を更新
      sourceCategoryTasks.forEach((task, index) => {
        const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
        if (taskToUpdate) {
          taskToUpdate.task_order = index;
        }
      });

      // 移動先カテゴリーが異なる場合、そのカテゴリーのタスクの順序も更新
      if (sourceCategory !== destinationCategory) {
        destinationCategoryTasks.forEach((task, index) => {
          const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
          if (taskToUpdate) {
            taskToUpdate.task_order = index;
          }
        });
      }

      updateTaskOrder(updatedTasks);
      setSortBy(sourceCategory as 'box' | 'now' | 'next', 'custom');
      if (sourceCategory !== destinationCategory) {
        setSortBy(destinationCategory as 'box' | 'now' | 'next', 'custom');
      }
    }

    // 楽観的更新の前に現在の状態を保存
    const previousTasks = [...tasks];

    try {
      // 新しい配列を作成
      const updatedTasks = [...tasks];

      // 移動するタスクを特定
      const movedTask = updatedTasks.find(
        (task) =>
          task.category === sourceCategory && task.id === result.draggableId
      );

      if (!movedTask) {
        throw new Error('Task not found');
      }

      // 同じカテゴリー内での移動の場合
      if (sourceCategory === destinationCategory) {
        // 移動するタスクを除外した同じカテゴリーのタスク
        const categoryTasks = updatedTasks.filter(
          (task) => task.category === sourceCategory && task.id !== movedTask.id
        );

        // 移動するタスクの新しい位置を設定
        movedTask.task_order = destinationIndex;

        // 他のタスクの順序を更新
        categoryTasks.forEach((task) => {
          if (sourceIndex < destinationIndex) {
            // 上から下に移動する場合
            if (
              task.task_order > sourceIndex &&
              task.task_order <= destinationIndex
            ) {
              task.task_order -= 1;
            }
          } else {
            // 下から上に移動する場合
            if (
              task.task_order >= destinationIndex &&
              task.task_order < sourceIndex
            ) {
              task.task_order += 1;
            }
          }
        });
      } else {
        // 異なるカテゴリー間での移動の場合
        // 移動元カテゴリーのタスクの順序を詰める
        updatedTasks
          .filter(
            (task) =>
              task.category === sourceCategory && task.task_order > sourceIndex
          )
          .forEach((task) => {
            task.task_order -= 1;
          });

        // 移動先カテゴリーのタスクの順序をずらす
        updatedTasks
          .filter(
            (task) =>
              task.category === destinationCategory &&
              task.task_order >= destinationIndex
          )
          .forEach((task) => {
            task.task_order += 1;
          });

        // 移動するタスクの新しい位置を設定
        movedTask.category = destinationCategory;
        movedTask.task_order = destinationIndex;
      }

      // 楽観的更新
      updateTaskOrder(updatedTasks);

      // APIリクエストを送信
      const response = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          tasks: updatedTasks.map((task) => ({
            id: task.id,
            category: task.category,
            task_order: task.task_order,
          })),
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update task order');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      // エラー時は元の状態に戻す
      updateTaskOrder(previousTasks);
      toast({
        title: 'エラー',
        description:
          error instanceof Error ? error.message : 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async (task: {
    title: string;
    description: string;
    priority: string;
    status: string;
    task_order: number;
    category: string;
  }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      // タスクリストを再取得
      await mutateTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの追加に失敗しました',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // ソートモードの日本語名を取得
  const getSortModeName = (
    mode: 'custom' | 'priority' | 'createdAt' | 'dueDate'
  ) => {
    switch (mode) {
      case 'priority':
        return '優先度順';
      case 'dueDate':
        return '締切日順';
      case 'createdAt':
        return '作成日順';
      default:
        return 'カスタム順';
    }
  };

  const categories = useMemo(
    () => ({
      box: {
        tasks: getFilteredAndSortedTasks('box'),
        sortMode: getSortModeName(sortBy.box),
      },
      now: {
        tasks: getFilteredAndSortedTasks('now'),
        sortMode: getSortModeName(sortBy.now),
      },
      next: {
        tasks: getFilteredAndSortedTasks('next'),
        sortMode: getSortModeName(sortBy.next),
      },
    }),
    [tasks, sortBy, getFilteredAndSortedTasks]
  );

  // ソート方法の変更ハンドラー
  const handleSortChange =
    (category: 'box' | 'now' | 'next') =>
    (value: 'custom' | 'priority' | 'createdAt' | 'dueDate') => {
      // カスタム順に切り替える場合、現在の表示順でtask_orderを更新
      if (value === 'custom') {
        const categoryTasks = getFilteredAndSortedTasks(category);
        const updatedTasks = [...tasks];

        // 現在の表示順でtask_orderを更新
        categoryTasks.forEach((task, index) => {
          const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
          if (taskToUpdate) {
            taskToUpdate.task_order = index;
          }
        });

        updateTaskOrder(updatedTasks);
      }

      setSortBy(category, value);
    };

  // リセットハンドラー
  const handleReset = (category: 'box' | 'now' | 'next') => () => {
    // カスタム順に戻す際、現在の表示順でtask_orderを更新
    const categoryTasks = getFilteredAndSortedTasks(category);
    const updatedTasks = [...tasks];

    // 現在の表示順でtask_orderを更新
    categoryTasks.forEach((task, index) => {
      const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
      if (taskToUpdate) {
        taskToUpdate.task_order = index;
      }
    });

    updateTaskOrder(updatedTasks);
    setSortBy(category, 'custom');
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg min-h-[80vh] max-h-[85vh] flex flex-col">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-100 mb-4">
          <ListTodo className="h-5 w-5" />
          タスク一覧
        </h2>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className={cn(
            'grid grid-cols-3 gap-4',
            isEditModalOpen && 'pointer-events-none'
          )}
        >
          <TaskColumn
            key="box"
            droppableId="box"
            title="ボックス"
            tasks={categories.box.tasks}
            onTasksChange={async () => {
              if (sortBy.box !== 'custom') {
                await mutateTasks();
              }
            }}
            sortBy={sortBy.box}
            onSortByChange={handleSortChange('box')}
            sortMode={categories.box.sortMode}
            onReset={handleReset('box')}
            onAddTask={handleAddTask}
          />
          <TaskColumn
            key="now"
            droppableId="now"
            title="今やる"
            tasks={categories.now.tasks}
            onTasksChange={async () => {
              if (sortBy.now !== 'custom') {
                await mutateTasks();
              }
            }}
            sortBy={sortBy.now}
            onSortByChange={handleSortChange('now')}
            sortMode={categories.now.sortMode}
            onReset={handleReset('now')}
            onAddTask={handleAddTask}
          />
          <TaskColumn
            key="next"
            droppableId="next"
            title="次やる"
            tasks={categories.next.tasks}
            onTasksChange={async () => {
              if (sortBy.next !== 'custom') {
                await mutateTasks();
              }
            }}
            sortBy={sortBy.next}
            onSortByChange={handleSortChange('next')}
            sortMode={categories.next.sortMode}
            onReset={handleReset('next')}
            onAddTask={handleAddTask}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
