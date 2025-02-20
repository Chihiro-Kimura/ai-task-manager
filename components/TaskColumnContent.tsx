"use client";

import { DroppableProvided } from "@hello-pangea/dnd";

import DraggableTaskItem from "@/components/DraggableTaskItem";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";

interface ITaskColumnContentProps {
  category: "box" | "now" | "next";
  provided: DroppableProvided;
  className?: string;
}

export default function TaskColumnContent({
  category,
  provided,
  className,
}: ITaskColumnContentProps): React.JSX.Element {
  const { getFilteredAndSortedTasks } = useTaskStore();
  const tasks = getFilteredAndSortedTasks(category);

  return (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={cn("space-y-4", className)}
    >
      {tasks.map((task, index) => (
        <DraggableTaskItem key={task.id} task={task} index={index} />
      ))}
      {provided.placeholder}
    </div>
  );
}
