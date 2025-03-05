import { DroppableProvided } from '@hello-pangea/dnd';

import { CreateTaskData, TaskWithExtras } from './task';

export interface TaskColumnContentProps {
  isAddingTask: boolean;
  tasks: TaskWithExtras[];
  onAddTask: (taskData: CreateTaskData) => Promise<void>;
  onCancelAdd: () => void;
  onTasksChange: () => Promise<void>;
  droppableId: string;
  provided: DroppableProvided;
}

export interface TaskColumnErrorState {
  error: Error;
  reset: () => void;
}
