'use client';

import TaskItem from '@/components/TaskItem';
import { TaskWithExtras } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { DraggableWrapper } from './task/draggable-wrapper';
import { ErrorBoundary } from './error-boundary';

interface DraggableTaskItemProps {
  task: TaskWithExtras;
  index: number;
  onMutate: () => Promise<void>;
}

export function DraggableTaskItem({
  task,
  index,
  onMutate,
}: DraggableTaskItemProps) {
  const { isEditModalOpen } = useTaskStore();

  return (
    <ErrorBoundary>
      <DraggableWrapper
        id={task.id}
        index={index}
        isDragDisabled={isEditModalOpen}
      >
        <TaskItem task={task} onMutate={onMutate} />
      </DraggableWrapper>
    </ErrorBoundary>
  );
}
