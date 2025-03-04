import { type ReactElement } from 'react';
import { useSWRConfig } from 'swr';

import { TaskActionBar } from '@/components/(tasks)/item/features/TaskActionBar';
import { Priority } from '@/types/common';
import { TaskWithExtras } from '@/types/task';

interface TaskHeaderProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAIClick: () => void;
}

export function TaskHeader({
  task,
  onMutate,
  onEdit,
  onDelete,
  onAIClick,
}: TaskHeaderProps): ReactElement {
  const { mutate } = useSWRConfig();

  const handleStatusChange = async (checked: boolean): Promise<void> => {
    await mutate<TaskWithExtras[]>(
      '/api/tasks',
      (tasks = []) => {
        const updatedTasks = tasks.map((t) =>
          t.id === task.id
            ? { ...t, status: checked ? '完了' : '未完了' }
            : t
        );
        return updatedTasks;
      },
      { revalidate: false }
    );

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: checked ? '完了' : '未完了',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      await onMutate();
    } catch (error) {
      await mutate('/api/tasks');
      throw error;
    }
  };

  const handlePriorityChange = async (priority: Priority): Promise<void> => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priority,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task priority');
    }

    await onMutate();
  };

  const handleDueDateChange = async (date: Date | undefined): Promise<void> => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        due_date: date?.toISOString() || null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task due date');
    }

    await onMutate();
  };

  return (
    <div className="p-4 pb-1 space-y-1">
      <h3 className="text-sm font-medium break-all">
        {task.title}
      </h3>
      <TaskActionBar
        status={task.status}
        priority={task.priority}
        dueDate={task.due_date}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onDueDateChange={handleDueDateChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onAIClick={onAIClick}
      />
    </div>
  );
} 