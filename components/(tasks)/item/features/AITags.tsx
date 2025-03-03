'use client';

import { Tag } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState, useEffect } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import TagSelect from '@/components/(common)/forms/TagSelect';
import { AILoading } from '@/components/(common)/loading/AILoading';
import { useToast } from '@/hooks/use-toast';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

import { AIFeatureProps } from '../types';

// Tag型を拡張
interface TaskTag {
  id: string;
  name: string;
  color: string | null;
}

interface AITagsProps extends AIFeatureProps {
  suggestedTags: string[];
}

export function AITags({ task, suggestedTags, onMutate }: AITagsProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [localTask, setLocalTask] = useState<TaskWithExtras>(task);
  const [isApplying, setIsApplying] = useState(false);
  const [pendingTags, setPendingTags] = useState<{ [key: string]: boolean }>({});
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const { tasks, setTasks } = useTaskStore();

  // デバッグ用のログを追加
  useEffect(() => {
    console.log('AITags: Received suggestedTags:', suggestedTags);
  }, [suggestedTags]);

  const handleSuggestedTagClick = async (tagName: string): Promise<void> => {
    if (pendingTags[tagName] || processingUpdate) return;

    try {
      setPendingTags((prev) => ({ ...prev, [tagName]: true }));
      setProcessingUpdate(true);

      // オプティミスティックな更新
      const optimisticTag = {
        id: `suggested-${tagName}`,
        name: tagName,
        color: null,
      };

      const optimisticTags = [...(localTask.tags || [])];
      if (!optimisticTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
        optimisticTags.push(optimisticTag);
        setLocalTask(prev => ({
          ...prev,
          tags: optimisticTags,
        }));
      }
      
      // タグの更新を実行
      const response = await fetch(`/api/tasks/${task.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: [...(localTask.tags?.map(tag => tag.name) || []), tagName],
        }),
      });

      if (!response.ok) {
        throw new Error(TAG_MESSAGES.UPDATE_ERROR);
      }

      const updatedTags = await response.json();

      // サーバーからの応答で状態を更新
      const updatedTask = {
        ...task,
        tags: updatedTags,
      };
      setLocalTask(updatedTask);
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));

      // 親コンポーネントの状態を更新
      await onMutate();

      toast({
        title: TAG_MESSAGES.UPDATE_SUCCESS,
        description: TAG_MESSAGES.APPLY_SUCCESS,
      });
    } catch (error: unknown) {
      // エラー時は元の状態に戻す
      setLocalTask(task);
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.CREATE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setPendingTags((prev) => ({ ...prev, [tagName]: false }));
      setProcessingUpdate(false);
    }
  };

  const updateTaskWithTags = async (selectedTags: TaskTag[]): Promise<void> => {
    if (processingUpdate) return;

    try {
      setProcessingUpdate(true);
      setIsApplying(true);

      // タグの更新を実行
      const response = await fetch(`/api/tasks/${task.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          tags: selectedTags.map(tag => tag.name),
        }),
      });

      if (!response.ok) {
        throw new Error(TAG_MESSAGES.UPDATE_ERROR);
      }

      const updatedTags = await response.json();

      // ローカルタスクの状態を更新
      const updatedTask = {
        ...task,
        tags: updatedTags,
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
    } catch (error: unknown) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : TAG_MESSAGES.UPDATE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
      setProcessingUpdate(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">タグの提案</h3>
        {isApplying && <AILoading size="sm" text="適用中..." />}
      </div>

      {/* 提案されたタグを横一列で表示 */}
      <div className="flex flex-wrap gap-2">
        {suggestedTags.map((tagName) => {
          const isSelected = localTask.tags?.some(
            (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
          );
          const isPending = pendingTags[tagName];

          return (
            <button
              key={tagName}
              onClick={() => void handleSuggestedTagClick(tagName)}
              disabled={isSelected || isPending}
              className="group relative"
            >
              <ColoredTag
                tag={{
                  id: `suggested-${tagName}`,
                  name: tagName,
                  color: null,
                }}
                className={`text-sm transition-opacity ${
                  isSelected ? 'opacity-50' : 'hover:opacity-80'
                }`}
              />
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded">
                  <AILoading size="sm" text="" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 既存のタグ選択 */}
      <div className="pt-2">
        <TagSelect
          id={task.id}
          type="task"
          selectedTags={localTask.tags as Tag[]}
          onTagsChange={updateTaskWithTags}
          className="w-full"
          variant="default"
        />
      </div>
    </div>
  );
} 