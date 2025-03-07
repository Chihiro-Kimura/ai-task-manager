import { type LucideIcon } from 'lucide-react';
import { CheckCircle2, Circle, Clock, PauseCircle } from 'lucide-react';

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  PENDING: 'pending'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export interface StatusConfig {
  icon: LucideIcon;
  label: string;
  className: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  [TASK_STATUS.TODO]: {
    icon: Circle,
    label: '未着手',
    className: 'text-zinc-400'
  },
  [TASK_STATUS.IN_PROGRESS]: {
    icon: Clock,
    label: '進行中',
    className: 'text-blue-500'
  },
  [TASK_STATUS.DONE]: {
    icon: CheckCircle2,
    label: '完了',
    className: 'text-green-500'
  },
  [TASK_STATUS.PENDING]: {
    icon: PauseCircle,
    label: '保留',
    className: 'text-yellow-500'
  }
};

// レガシーステータスを新しいステータスにマッピング
export const STATUS_MAPPING: Record<string, TaskStatus> = {
  '完了': TASK_STATUS.DONE,
  '未完了': TASK_STATUS.TODO,
  '進行中': TASK_STATUS.IN_PROGRESS,
  '保留': TASK_STATUS.PENDING,
};

// ステータスの日本語ラベルを取得
export function getStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_CONFIG[status].label;
}