'use client';

import { Tag } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import TagSelect from '@/components/(common)/forms/TagSelect';
import { AILoading } from '@/components/(common)/loading/AILoading';
import { useToast } from '@/hooks/use-toast';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { updateTags } from '@/lib/utils/tag';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

import { AIFeatureProps } from '../types';

interface AITagsProps extends AIFeatureProps {
  suggestedTags: string[];
}

export function AITags({ task, suggestedTags, onMutate }: AITagsProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [localTask, setLocalTask] = useState<TaskWithExtras>(task);
  const [isApplying, setIsApplying] = useState(false);
  const { tasks, setTasks } = useTaskStore();

  const updateTaskWithTags = async (selectedTags: Tag[]): Promise<void> => {
    try {
      setIsApplying(true);
      await updateTags({
        id: task.id,
        type: 'task',
        tags: selectedTags.map(tag => tag.id),
      });

      // 更新されたタスク情報を取得
      const taskResponse = await fetch(`/api/tasks/${task.id}?include=tags`, {
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (!taskResponse.ok) {
        throw new Error(TAG_MESSAGES.FETCH_ERROR);
      }

      const updatedTaskData = await taskResponse.json();

      // ローカルタスクの状態を更新
      const updatedTask = {
        ...task,
        ...updatedTaskData,
      };
      setLocalTask(updatedTask);

      // タスクストアの状態を更新
      setTasks(tasks.map(t => 
        t.id === task.id ? updatedTask : t
      ));

      // 親コンポーネントの状態を更新
      await onMutate();

      toast({
        title: TAG_MESSAGES.UPDATE_SUCCESS,
        description: TAG_MESSAGES.APPLY_SUCCESS,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : TAG_MESSAGES.UPDATE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-200">タグの提案</h3>

      {/* 現在のタグ */}
      {localTask.tags && localTask.tags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-400">現在のタグ</h4>
          <div className="flex flex-wrap gap-2">
            {localTask.tags.map((tag) => (
              <ColoredTag
                key={tag.id}
                tag={tag}
                className="text-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* タグの選択と作成 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-zinc-400">タグを選択または作成</h4>
        <TagSelect
          id={task.id}
          type="task"
          selectedTags={localTask.tags as Tag[]}
          onTagsChange={updateTaskWithTags}
          suggestedTags={suggestedTags}
          className="w-full"
        />
      </div>

      {isApplying && (
        <div className="flex justify-center">
          <AILoading size="sm" text="適用中..." />
        </div>
      )}
    </div>
  );
} 