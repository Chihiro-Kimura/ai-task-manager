'use client';

import { Draggable } from '@hello-pangea/dnd';
import TaskItem from '@/components/TaskItem';
import { TaskWithExtras } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';

interface DraggableTaskItemProps {
  task: TaskWithExtras;
  index: number;
  onMutate: () => Promise<void>;
}

export function DraggableTaskItem({ task, index }: DraggableTaskItemProps) {
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
          className={cn(
            'cursor-grab active:cursor-grabbing',
            isEditModalOpen && 'cursor-default pointer-events-none'
          )}
        >
          <TaskItem task={task} />
        </div>
      )}
    </Draggable>
  );
}
