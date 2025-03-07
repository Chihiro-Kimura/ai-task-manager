'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { type ReactElement } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import { PrioritySelect } from '@/components/(tasks)/filters/PrioritySelect';
import { StatusSelect } from '@/components/(tasks)/filters/StatusSelect';
import { TaskWithExtras, UpdateTaskRequest } from '@/types/task';
import { TaskStatus } from '@/types/task/status';

// コンポーネントとしてリファクタリング
export function CellContent({
  task,
  columnId,
  handleUpdateTask
}: {
  task: TaskWithExtras;
  columnId: string;
  handleUpdateTask: (taskId: string, values: UpdateTaskRequest) => Promise<void>;
}): ReactElement | null {
  switch (columnId) {
    case 'title':
      return (
        <div className="min-w-0 break-words whitespace-pre-wrap line-clamp-2">
          {task.title}
        </div>
      );
    case 'status':
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSelect
            value={task.status as TaskStatus}
            onValueChange={(status) => void handleUpdateTask(task.id, { status })}
            variant="icon"
            noBorder
            className="min-w-0"
          />
        </div>
      );
    case 'priority':
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <PrioritySelect
            value={task.priority}
            onValueChange={(priority) => void handleUpdateTask(task.id, { priority })}
            variant="icon"
            noBorder
          />
        </div>
      );
    case 'category':
      return <span>{task.category || '-'}</span>;
    case 'due_date':
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DueDatePicker
            dueDate={task.due_date ? new Date(task.due_date) : undefined}
            setDueDate={(date) => void handleUpdateTask(task.id, { due_date: date?.toISOString() })}
            variant="icon"
            noBorder
          />
        </div>
      );
    case 'tags':
      return task.tags && task.tags.length > 0 ? (
        <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <ColoredTag key={tag.id} tag={tag} />
          ))}
        </div>
      ) : null;
    case 'createdAt':
      return (
        <span>
          {format(new Date(task.createdAt), 'yyyy/MM/dd', { locale: ja })}
        </span>
      );
    default:
      return null;
  }
}

// TaskRowで使用するためのヘルパー関数
export function renderCellContent(
  task: TaskWithExtras,
  columnId: string,
  handleUpdateTask: (taskId: string, values: UpdateTaskRequest) => Promise<void>
): ReactElement | null {
  return (
    <CellContent
      task={task}
      columnId={columnId}
      handleUpdateTask={handleUpdateTask}
    />
  );
}