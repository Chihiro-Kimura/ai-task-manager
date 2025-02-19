import type { Task as PrismaTask } from '@prisma/client';

export type Task = PrismaTask;

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
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
  description?: string;
  priority: string;
  status: string;
  category: string;
}
