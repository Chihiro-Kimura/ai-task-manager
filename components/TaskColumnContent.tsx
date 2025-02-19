'use client';

import { DroppableProvided } from '@hello-pangea/dnd';
import { TaskWithExtras } from '@/types/task';
import AddTaskForm from '@/components/AddTaskForm';
import DraggableTaskItem from '@/components/DraggableTaskItem';
import { CreateTaskData } from '@/types/task';

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
        <DraggableTaskItem
          key={task.id}
          task={task}
          index={index}
          onMutate={async () => {
            await onTasksChange();
          }}
        />
      ))}
      {provided.placeholder}
    </ul>
  );
}
