'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { useSession } from 'next-auth/react';
import { ListTodo } from 'lucide-react';
import TaskFilters from '@/components/TaskFilters';
import TaskItem from '@/components/TaskItem';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { isPast, isToday, isFuture } from 'date-fns';

export default function TaskList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');
  const [statusFilter, setStatusFilter] = useState<'all' | '未完了' | '完了'>(
    'all'
  );

  const [dueDateFilter, setDueDateFilter] = useState<
    'all' | 'overdue' | 'today' | 'upcoming'
  >('all');

  // データフェッチとフィルタリングを分離
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
    return res.json();
  });

  const tasks = useMemo(() => {
    if (!response || !Array.isArray(response)) return [];

    let filteredData = [...response];

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(
        (task) => task.status === statusFilter
      );
    }

    if (dueDateFilter !== 'all') {
      filteredData = filteredData.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);

        switch (dueDateFilter) {
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate);
          case 'today':
            return isToday(dueDate);
          case 'upcoming':
            return isFuture(dueDate) && !isToday(dueDate);
          default:
            return true;
        }
      });
    }

    filteredData.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 高: 3, 中: 2, 低: 1 };
        return (
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return filteredData;
  }, [response, statusFilter, dueDateFilter, sortBy]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!tasks?.length) {
    return (
      <EmptyState
        hasFilters={statusFilter !== 'all' || dueDateFilter !== 'all'}
        onResetFilters={() => {
          setStatusFilter('all');
          setDueDateFilter('all');
        }}
      />
    );
  }

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg min-h-[80vh] max-h-[85vh] flex flex-col">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-100 mb-4">
          <ListTodo className="h-5 w-5" />
          タスク一覧
        </h2>

        <TaskFilters
          sortBy={sortBy}
          onSortByChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dueDateFilter={dueDateFilter}
          onDueDateFilterChange={setDueDateFilter}
        />
      </div>

      <ul className="space-y-2 overflow-y-auto flex-grow pr-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onMutate={mutateTasks} />
        ))}
      </ul>
    </div>
  );
}
