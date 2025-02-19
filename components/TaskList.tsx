'use client';

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Task } from '@prisma/client';
import useSWR from 'swr';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);

  // useSWRを使用してタスクを取得
  const {
    data: fetchedTasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR<Task[]>(
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

    // カテゴリー内での正しいインデックスを計算
    const sourceTaskIndex =
      updatedTasks.findIndex((task) => task.category === sourceCategory) +
      sourceIndex;

    const [movedTask] = updatedTasks.splice(sourceTaskIndex, 1);
    movedTask.category = destinationCategory;

    // 移動先カテゴリーでの正しい位置を計算
    const destinationTaskIndex =
      destinationCategory === sourceCategory
        ? destinationIndex
        : updatedTasks.filter((task) => task.category === destinationCategory)
            .length;

    const insertIndex =
      updatedTasks.findIndex((task) => task.category === destinationCategory) +
      destinationTaskIndex;

    updatedTasks.splice(insertIndex, 0, movedTask);

    setTasks(updatedTasks);

    try {
      await fetch('/api/tasks/update-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          taskId: movedTask.id,
          category: destinationCategory,
        }),
      });

      // カテゴリー更新後にデータを再検証
      await mutateTasks();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
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
