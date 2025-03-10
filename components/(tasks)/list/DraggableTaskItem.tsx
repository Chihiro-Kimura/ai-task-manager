'use client';

import { Draggable } from '@hello-pangea/dnd';

import { ErrorBoundary } from '@/components/(common)/error/ErrorBoundary';
import TaskItem from '@/components/(tasks)/item/TaskItem';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

interface DraggableTaskItemProps {
  task: TaskWithExtras;
  index: number;
  onMutate: () => Promise<void>;
}

export default function DraggableTaskItem({
  task,
  index,
  onMutate,
}: DraggableTaskItemProps) {
  const { isEditModalOpen } = useTaskStore();

  return (
    <Draggable
      draggableId={task.id}
      index={index}
      isDragDisabled={isEditModalOpen}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ErrorBoundary>
            <TaskItem task={task} onMutate={onMutate} />
          </ErrorBoundary>
        </div>
      )}
    </Draggable>
  );
}
