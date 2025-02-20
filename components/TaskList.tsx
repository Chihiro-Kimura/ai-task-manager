'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import { ListTodo } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import TaskColumn from '@/components/TaskColumn';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { useTaskSort } from '@/hooks/useTaskSort';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TaskList(): React.JSX.Element {
  const { data: session } = useSession();
  const { tasks, setTasks } = useTaskStore();
  const { handleDragEnd } = useTaskDragDrop();
  const { getSortModeName, handleSortChange, handleReset } = useTaskSort();

  // useSWRを使用してタスクを取得
  const {
    data: fetchedTasks,
    error,
    isLoading,
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

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!tasks.length) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ListTodo className="h-8 w-8" />
          <h3 className="font-semibold">タスクがありません</h3>
          <p>新しいタスクを追加してください</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={cn(
          'grid h-[calc(100vh-4rem)] grid-cols-1 gap-4 overflow-hidden p-4',
          'md:grid-cols-2',
          'lg:grid-cols-3'
        )}
      >
        <TaskColumn
          category="box"
          title="BOX"
          getSortModeName={getSortModeName}
          onSortChange={handleSortChange('box')}
          onReset={handleReset('box')}
        />
        <TaskColumn
          category="now"
          title="NOW"
          getSortModeName={getSortModeName}
          onSortChange={handleSortChange('now')}
          onReset={handleReset('now')}
        />
        <TaskColumn
          category="next"
          title="NEXT"
          getSortModeName={getSortModeName}
          onSortChange={handleSortChange('next')}
          onReset={handleReset('next')}
        />
      </div>
    </DragDropContext>
  );
}
