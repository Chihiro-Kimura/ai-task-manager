export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  category: string;
}

export interface UpdateTaskData {
  updatedAt: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}
