'use client';

import { useSession } from 'next-auth/react';
import { type ReactElement, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/(common)/error/ErrorState';
import LoadingState from '@/components/(common)/loading/LoadingState';
import TaskItem from '@/components/(tasks)/item/TaskItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

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
    async (url: string) => {
      if (!session?.user?.id) return [];

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      return response.json();
    }
  );

  // fetchedTasksが更新されたらstateを更新
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  // ソートモードの日本語名を取得
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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <ScrollArea className="flex-1 -mx-4">
      <div className="px-4 space-y-6">
        {[
          { id: 'box', title: 'ボックス', tasks: categories.box.tasks },
          { id: 'now', title: '今やる', tasks: categories.now.tasks },
          { id: 'next', title: '次やる', tasks: categories.next.tasks },
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
      </div>
    </ScrollArea>
  );
}
