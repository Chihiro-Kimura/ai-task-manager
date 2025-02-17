'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskFilters from '@/components/TaskFilters';
import TaskItem from '@/components/TaskItem';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

export default function TaskList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');
  const [tasks, setTasks] = useState([]);

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR(session?.user?.id ? `/api/tasks` : null, async (url) => {
    const res = await fetch(url, {
      headers: {
        'X-User-Id': session?.user?.id || '',
      },
    });
    const data = await res.json();
    setTasks(data); // 初期データをセット
    return data;
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(reorderedTasks);

    // サーバーへ並び順を更新（Supabase 側で `order` フィールドを作成する）
    await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': session?.user?.id || '',
      },
      body: JSON.stringify(
        reorderedTasks.map((task, index) => ({ id: task.id, order: index }))
      ),
    });

    mutateTasks(); // UIを更新
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!tasks.length)
    return <EmptyState hasFilters={false} onResetFilters={() => {}} />;

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg min-h-[80vh] max-h-[85vh] flex flex-col">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-100 mb-4">
          <ListTodo className="h-5 w-5" />
          タスク一覧
        </h2>
        <TaskFilters sortBy={sortBy} onSortByChange={setSortBy} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 overflow-y-auto flex-grow pr-2"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskItem task={task} onMutate={mutateTasks} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
