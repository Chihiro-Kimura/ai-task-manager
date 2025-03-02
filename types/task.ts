export interface TaskWithExtras {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  category: string;
  due_date: Date | null;
  task_order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: { id: string; name: string }[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string | null;
  status?: string;
  due_date?: string | null;
  tags?: { id: string }[];
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
  task_order: number;
  category: string;
  due_date?: Date;
  tags?: { id: string; name: string }[];
}
