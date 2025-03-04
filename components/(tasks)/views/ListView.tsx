'use client';

import { useSession } from 'next-auth/react';
import { type ReactElement, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/(common)/error/ErrorState';
import LoadingState from '@/components/(common)/loading/LoadingState';
import TaskItem from '@/components/(tasks)/item/TaskItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaskStore } from '@/store/taskStore';
import { type TaskWithExtras } from '@/types/task';

const fetcher = async (url: string): Promise<TaskWithExtras[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export default function ListView(): ReactElement {
  const { data: session } = useSession();
  const { tasks, setTasks, sortBy, getFilteredAndSortedTasks } = useTaskStore();

  const {
    data: fetchedTasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR<TaskWithExtras[]>(
    session?.user?.id ? '/api/tasks' : null,
    fetcher
  );

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  const getSortModeName = (
    mode: 'custom' | 'priority' | 'createdAt' | 'dueDate'
  ): string => {
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
      inbox: {
        tasks: getFilteredAndSortedTasks('inbox'),
        sortMode: getSortModeName(sortBy.inbox),
      },
      doing: {
        tasks: getFilteredAndSortedTasks('doing'),
        sortMode: getSortModeName(sortBy.doing),
      },
      todo: {
        tasks: getFilteredAndSortedTasks('todo'),
        sortMode: getSortModeName(sortBy.todo),
      },
    }),
    [tasks, sortBy, getFilteredAndSortedTasks]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-6">
          {[
            { id: 'inbox', title: 'Inbox', tasks: categories.inbox.tasks },
            { id: 'doing', title: 'Doing', tasks: categories.doing.tasks },
            { id: 'todo', title: 'To Do', tasks: categories.todo.tasks },
          ].map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">
                  {category.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {category.tasks.length}件
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {category.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onMutate={async () => {
                      setTasks(tasks.filter((t) => t.id !== task.id));
                      await mutateTasks();
                    }}
                  />
                ))}
                {category.tasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-zinc-800 p-4">
                    <p className="text-sm text-zinc-500 text-center">
                      タスクがありません
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="h-6" />
        </div>
      </ScrollArea>
    </div>
  );
}
