'use client';

import { Draggable } from '@hello-pangea/dnd';
import TaskItem from '@/components/TaskItem';
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
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="cursor-grab active:cursor-grabbing"
        >
          <TaskItem task={task} onMutate={onMutate} />
        </div>
      )}
    </Draggable>
  );
}
