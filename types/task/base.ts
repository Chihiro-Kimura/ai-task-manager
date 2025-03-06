import { Priority, Tag } from '../common';

/**
 * タスクの基本的な入力データの型定義
 * この型は新規タスクの作成時や更新時の基本となる型です
 */
export interface BaseTaskInput {
  title: string;
  description: string | null;
  priority: Priority | null;
  tags?: Tag[];
}

/**
 * タスクの基本的な出力データの型定義
 * この型はデータベースに保存される際の基本となる型です
 */
export interface BaseTaskOutput extends BaseTaskInput {
  id: string;
  status: string;
  category: string;
  due_date: Date | null;
  task_order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: Priority | null;
  status: string;
  category: string;
  task_order: number;
  tags: Tag[];
  userId?: string;
  due_date?: Date;
}
