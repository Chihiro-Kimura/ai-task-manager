'use client';

import { type ReactElement, Suspense } from 'react';

import { TaskItemSkeleton } from '@/components/(common)/loading/TaskItemSkeleton';
import AddTaskForm from '@/components/(tasks)/forms/AddTaskForm';
import DraggableTaskItem from '@/components/(tasks)/list/DraggableTaskItem';
import { TaskColumnContentProps } from '@/types/task-column';

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
