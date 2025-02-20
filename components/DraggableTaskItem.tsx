"use client";

import { Draggable } from "@hello-pangea/dnd";

import TaskItem from "@/components/TaskItem";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { TaskWithExtras } from "@/types/task";

interface IDraggableTaskItemProps {
  task: TaskWithExtras;
  index: number;
}

export default function DraggableTaskItem({
  task,
  index,
}: IDraggableTaskItemProps): React.JSX.Element {
  const { isEditModalOpen } = useTaskStore();

  return (
    <Draggable
      draggableId={task.id}
      index={index}
      isDragDisabled={isEditModalOpen}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.5 : 1,
          }}
          className={cn(
            "cursor-grab active:cursor-grabbing",
            isEditModalOpen && "cursor-default pointer-events-none",
          )}
        >
          <TaskItem task={task} />
        </div>
      )}
    </Draggable>
  );
}
