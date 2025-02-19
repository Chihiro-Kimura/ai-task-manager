'use client';

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { TaskWithExtras } from '@/types/task';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskWithExtras[]>([]);
  // 各カラムのソート状態を管理
  const [sortByPriority, setSortByPriority] = useState({
    box: false,
    now: false,
    next: false,
  });

  const { toast } = useToast();

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
  }, [fetchedTasks]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

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

    console.log('Drag operation:', {
      sourceCategory,
      destinationCategory,
      sourceIndex,
      destinationIndex,
    });

    // 楽観的更新の前に現在の状態を保存
    const previousTasks = [...tasks];

    try {
      // 新しい配列を作成
      const updatedTasks = [...tasks];

      // カテゴリー内のタスクを取得
      const categoryTasks = tasks.filter(
        (task) => task.category === sourceCategory
      );

      // 移動するタスクを特定（カテゴリー内でのインデックスを使用）
      const movedTask = categoryTasks[sourceIndex];

      if (!movedTask) {
        console.error('Task search details:', {
          sourceCategory,
          sourceIndex,
          categoryTasksLength: categoryTasks.length,
          allTasksLength: tasks.length,
        });
        throw new Error('Task not found');
      }

      // 移動前のカテゴリーのタスクを更新
      const sourceTasks = updatedTasks.filter(
        (task) => task.category === sourceCategory && task.id !== movedTask.id
      );
      sourceTasks.forEach((task, index) => {
        task.task_order = index;
      });

      // 移動先のカテゴリーのタスクを更新
      const destinationTasks = updatedTasks.filter(
        (task) => task.category === destinationCategory
      );

      // 移動するタスクのカテゴリーと順序を更新
      movedTask.category = destinationCategory;
      movedTask.task_order = destinationIndex;

      // 移動先の他のタスクの順序を更新
      destinationTasks.forEach((task) => {
        if (task.id !== movedTask.id) {
          if (task.task_order >= destinationIndex) {
            task.task_order = task.task_order + 1;
          }
        }
      });

      // 更新対象のタスクを収集
      const tasksToUpdate = [
        movedTask,
        ...sourceTasks,
        ...destinationTasks.filter((task) => task.id !== movedTask.id),
      ];

      console.log('Tasks to update:', {
        sourceTasksCount: sourceTasks.length,
        destinationTasksCount: destinationTasks.length,
        totalTasksToUpdate: tasksToUpdate.length,
        movedTaskDetails: {
          id: movedTask.id,
          category: movedTask.category,
          task_order: movedTask.task_order,
        },
        tasks: tasksToUpdate.map((t) => ({
          id: t.id,
          category: t.category,
          task_order: t.task_order,
        })),
      });

      // 楽観的更新
      setTasks(updatedTasks);

      // APIリクエストを送信
      const response = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          tasks: tasksToUpdate.map((task) => ({
            id: task.id,
            category: task.category,
            task_order: task.task_order,
          })),
        }),
      });

      const responseData = await response.json();
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData,
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update task order');
      }

      // 成功したらデータを再取得
      await mutateTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      setTasks(previousTasks); // エラー時は以前の状態に戻す
      toast({
        title: 'エラー',
        description:
          error instanceof Error ? error.message : 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const categories = useMemo(
    () => ({
      box: tasks
        .filter((task) => task.category === 'box')
        .sort((a, b) => {
          if (sortByPriority.box) {
            // 優先度でソート
            const priorityOrder = { 高: 0, 中: 1, 低: 2 };
            const aOrder =
              priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
            const bOrder =
              priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;
          }
          // デフォルトはtask_orderでソート
          return a.task_order - b.task_order;
        }),
      now: tasks
        .filter((task) => task.category === 'now')
        .sort((a, b) => {
          if (sortByPriority.now) {
            const priorityOrder = { 高: 0, 中: 1, 低: 2 };
            const aOrder =
              priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
            const bOrder =
              priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;
          }
          return a.task_order - b.task_order;
        }),
      next: tasks
        .filter((task) => task.category === 'next')
        .sort((a, b) => {
          if (sortByPriority.next) {
            const priorityOrder = { 高: 0, 中: 1, 低: 2 };
            const aOrder =
              priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
            const bOrder =
              priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
            if (aOrder !== bOrder) return aOrder - bOrder;
          }
          return a.task_order - b.task_order;
        }),
    }),
    [tasks, sortByPriority] // sortByPriorityを依存配列に追加
  );

  // ソート切り替え関数
  const toggleSort = (category: 'box' | 'now' | 'next') => {
    setSortByPriority((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
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
        <div className="grid grid-cols-3 gap-4">
          <TaskColumn
            key="box"
            droppableId="box"
            title="ボックス"
            tasks={categories.box}
            onTasksChange={async () => {
              await mutateTasks();
              return;
            }}
            sortByPriority={sortByPriority.box}
            onToggleSort={() => toggleSort('box')}
          />
          <TaskColumn
            key="now"
            droppableId="now"
            title="今やる"
            tasks={categories.now}
            onTasksChange={async () => {
              await mutateTasks();
              return;
            }}
            sortByPriority={sortByPriority.now}
            onToggleSort={() => toggleSort('now')}
          />
          <TaskColumn
            key="next"
            droppableId="next"
            title="次やる"
            tasks={categories.next}
            onTasksChange={async () => {
              await mutateTasks();
              return;
            }}
            sortByPriority={sortByPriority.next}
            onToggleSort={() => toggleSort('next')}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
