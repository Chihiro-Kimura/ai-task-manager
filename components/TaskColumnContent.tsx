'use client';

import { DroppableProvided } from '@hello-pangea/dnd';
import { TaskWithExtras } from '@/types/task';
import AddTaskForm from '@/components/AddTaskForm';
import { DraggableTaskItem } from '@/components/DraggableTaskItem';
import { CreateTaskData } from '@/types/task';
import { Suspense } from 'react';
import { TaskItemSkeleton } from '@/components/TaskItemSkeleton';

interface TaskColumnContentProps {
  isAddingTask: boolean;
  tasks: TaskWithExtras[];
  onAddTask: (taskData: CreateTaskData) => Promise<void>;
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
}: TaskColumnContentProps) {
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
