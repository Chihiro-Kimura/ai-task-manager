import type { Task } from '@prisma/client';

export type TaskWithExtras = Task;

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string | null;
  status?: string;
  due_date?: string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string | null;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  task_order?: number;
  due_date?: string | null;
}
