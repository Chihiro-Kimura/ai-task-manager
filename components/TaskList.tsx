'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { DragDropContext } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR(session?.user?.id ? `/api/tasks` : null, async (url) => {
    const res = await fetch(url, {
      headers: { 'X-User-Id': session?.user?.id || '' },
    });
    return res.json();
  });

  useEffect(() => {
    if (response) setTasks(response);
  }, [response]);

  const handleDragEnd = async (result) => {
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

    await mutateTasks(
      async () => {
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
        return updatedTasks;
      },
      { optimisticData: updatedTasks, rollbackOnError: true }
    );
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
            mutateTasks={mutateTasks}
          />
          <TaskColumn
            key="now"
            droppableId="now"
            title="今やる"
            tasks={categories.now}
            mutateTasks={mutateTasks}
          />
          <TaskColumn
            key="next"
            droppableId="next"
            title="次やる"
            tasks={categories.next}
            mutateTasks={mutateTasks}
          />
        </div>
      </DragDropContext>
    </div>
  );
}
