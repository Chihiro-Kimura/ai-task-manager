import { type ReactElement } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import { TaskWithExtras } from '@/types/task';

interface TaskContentProps {
  task: TaskWithExtras;
}

export function TaskContent({ task }: TaskContentProps): ReactElement {
  return (
    <div className="px-4 pb-4">
      {/* 説明文 */}
      {task.description && (
        <p className="text-sm text-zinc-200">{task.description}</p>
      )}

      {/* タグ */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2">
          {task.tags.map((tag) => (
            <ColoredTag key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
} 