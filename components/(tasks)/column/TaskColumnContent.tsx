'use client';

import { DroppableProvided } from '@hello-pangea/dnd';
import { type ReactElement, Suspense } from 'react';

import { TaskItemSkeleton } from '@/components/(common)/loading/TaskItemSkeleton';
import AddTaskForm from '@/components/(tasks)/forms/AddTaskForm';
import DraggableTaskItem from '@/components/(tasks)/list/DraggableTaskItem';
import { TaskInput } from '@/lib/ai/types';
import { TaskWithExtras } from '@/types/task';

interface TaskColumnContentProps {
  isAddingTask: boolean;
  tasks: TaskWithExtras[];
  onAddTask: (taskData: TaskInput & { status: string; task_order: number; category?: string; due_date?: string | null }) => Promise<void>;
  onCancelAdd: () => void;
  onTasksChange: () => Promise<void>;
  droppableId: string;
  provided: DroppableProvided;
}

export function TaskColumnContent({
  isAddingTask,
  tasks,
  onAddTask,
  onCancelAdd,
  onTasksChange,
  droppableId,
  provided,
}: TaskColumnContentProps): ReactElement {
  return (
    <ul className="space-y-2">
      {isAddingTask && (
        <AddTaskForm
          onSubmit={onAddTask}
          onCancel={onCancelAdd}
          category={droppableId}
        />
      )}
      {tasks.map((task, index) => (
        <Suspense key={task.id} fallback={<TaskItemSkeleton />}>
          <DraggableTaskItem
            task={task}
            index={index}
            onMutate={async () => {
              await onTasksChange();
            }}
          />
        </Suspense>
      ))}
      {provided.placeholder}
    </ul>
  );
}
