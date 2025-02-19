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

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskWithExtras[]>([]);

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
    )
      return;

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    movedTask.category = destinationCategory;
    updatedTasks.splice(result.destination.index, 0, movedTask);

    // 楽観的更新
    setTasks(updatedTasks);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // カテゴリー変更の場合
        if (sourceCategory !== destinationCategory) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000); // 8秒でタイムアウト

          try {
            const categoryResponse = await fetch('/api/tasks/update-category', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Id': session?.user?.id || '',
              },
              body: JSON.stringify({
                taskId: movedTask.id,
                category: destinationCategory,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!categoryResponse.ok) {
              throw new Error('カテゴリーの更新に失敗しました');
            }
          } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error('カテゴリー更新がタイムアウトしました');
            }
            throw error;
          }
        }

        // 並び順の更新
        const tasksInCategory = updatedTasks
          .filter((task) => task.category === destinationCategory)
          .map((task) => ({ id: task.id }));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8秒でタイムアウト

        try {
          const reorderResponse = await fetch('/api/tasks/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': session?.user?.id || '',
            },
            body: JSON.stringify({
              tasks: tasksInCategory,
              category: destinationCategory,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!reorderResponse.ok) {
            const errorData = await reorderResponse.json();
            throw new Error(errorData.error || '並び順の更新に失敗しました');
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('並び順更新がタイムアウトしました');
          }
          throw error;
        }

        break;
      } catch (error) {
        retryCount++;
        console.error(`Failed to update task (attempt ${retryCount}):`, error);

        if (retryCount === maxRetries) {
          // 最大リトライ回数に達した場合
          setTasks(tasks); // 元の状態に戻す
          alert('タスクの更新に失敗しました。もう一度お試しください。');
          return;
        }

        // リトライ前に少し待機
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // データを再検証
    await mutateTasks();
  };

  const categories = useMemo(
    () => ({
      box: tasks.filter((task) => task.category === 'box'),
      now: tasks.filter((task) => task.category === 'now'),
      next: tasks.filter((task) => task.category === 'next'),
    }),
    [tasks]
  );

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
            onTasksChange={mutateTasks}
          />
          <TaskColumn
            key="now"
            droppableId="now"
            title="今やる"
            tasks={categories.now}
            onTasksChange={mutateTasks}
          />
          <TaskColumn
            key="next"
            droppableId="next"
            title="次やる"
            tasks={categories.next}
            onTasksChange={mutateTasks}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
