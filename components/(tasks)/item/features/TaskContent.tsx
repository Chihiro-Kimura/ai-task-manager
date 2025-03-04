import { type ReactElement } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import { TaskWithExtras } from '@/types/task';

interface TaskContentProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
}

export function TaskContent({ task, onMutate }: TaskContentProps): ReactElement {
  const handleTagsUpdate = async (tags: string[]): Promise<void> => {
    const response = await fetch(`/api/tasks/${task.id}/${task.id}/tags`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task tags');
    }

    await onMutate();
  };

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