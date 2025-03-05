import { Tag } from '../common';

import type { BaseTaskInput, BaseTaskOutput } from './base';

/**
 * 既存のTaskWithExtrasをBaseTaskOutputを使用して再定義
 */
export interface TaskWithExtras extends BaseTaskOutput {
  tags?: Tag[];
}

/**
 * タスク更新リクエストの型定義
 */
export interface UpdateTaskRequest extends Partial<Omit<BaseTaskInput, 'tags'>> {
  status?: string;
  due_date?: string | null;
  tags?: { id: string }[];
}

/**
 * タスク作成データの型定義
 */
export interface CreateTaskData extends BaseTaskInput {
  status: string;
  task_order: number;
  category: string;
  due_date?: Date;
}

// 基本型の再エクスポート
export type { BaseTaskInput, BaseTaskOutput } from './base'; 