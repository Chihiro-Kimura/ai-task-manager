'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import TagSelect from '@/components/(common)/forms/tag-select';
import { AILoading } from '@/components/(common)/loading/AILoading';
import { useTagManagement } from '@/hooks/use-tag-management';
import { useToast } from '@/hooks/use-toast';
import type { TaskWithExtras } from '@/types';
import type { Tag } from '@/types/common';

import type { ReactElement } from 'react';

interface AITagsProps {
  task: TaskWithExtras;
  suggestedTags: Array<{
    name: string;
    color: string | null;
  }>;
  onMutate: () => Promise<void>;
}

export function AITags({
  task,
  suggestedTags,
  onMutate,
}: AITagsProps): ReactElement {
  console.log('AITags: Initial suggestedTags:', suggestedTags);
  
  const { data: _session } = useSession();
  const { toast } = useToast();
  const [localTask, setLocalTask] = useState<TaskWithExtras>(task);
  const [isApplying, setIsApplying] = useState(false);
  const [pendingTags, setPendingTags] = useState<{ [key: string]: boolean }>({});
  const [processingUpdate, setProcessingUpdate] = useState(false);

  const {
    tags,
    createNewTag,
    updateTagSelection,
    error: tagError
  } = useTagManagement({
    id: task.id,
    type: 'task',
    initialTags: task.tags?.map(tag => ({
      ...tag,
      color: tag.color || null
    })) || [],
    onTagsChange: (tags) => {
      setLocalTask(prev => ({
        ...prev,
        tags
      }));
    }
  });

  // エラー監視
  useEffect(() => {
    if (tagError) {
      toast({
        title: 'エラー',
        description: tagError.message,
        variant: 'destructive',
      });
    }
  }, [tagError, toast]);

  // suggestedTagsの変更を監視
  useEffect(() => {
    console.log('[AITags] Received tags:', suggestedTags);
  }, [suggestedTags]);

  const handleSuggestedTagClick = async (tagName: string): Promise<void> => {
    if (pendingTags[tagName] || processingUpdate) return;

    try {
      setPendingTags((prev) => ({ ...prev, [tagName]: true }));
      setProcessingUpdate(true);

      // タグを作成または取得（既存のタグがある場合はそれを返す）
      const tag = await createNewTag(tagName);
      if (!tag) return;

      // 現在のタグリストに含まれていない場合のみ追加
      if (!localTask.tags?.some(t => t.id === tag.id)) {
        const updatedTags = [...(localTask.tags || []), tag];
        await updateTagSelection(updatedTags);
        await onMutate();
        setLocalTask(prev => ({
          ...prev,
          tags: updatedTags
        }));
      }
    } catch (error) {
      console.error('[AITags] Error:', error);
      toast({
        title: 'エラー',
        description: 'タグの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setPendingTags((prev) => ({ ...prev, [tagName]: false }));
      setProcessingUpdate(false);
    }
  };

  const updateTaskWithTags = async (selectedTags: Tag[]): Promise<void> => {
    if (processingUpdate) return;

    try {
      setProcessingUpdate(true);
      setIsApplying(true);

      // 重複を除去して更新（名前とIDの両方でチェック）
      const uniqueTags = selectedTags.reduce<Tag[]>((acc, current) => {
        // suggested-で始まるIDのタグは無視
        if (current.id.startsWith('suggested-')) {
          // 代わりに既存のタグを探す
          const existingTag = tags.find(
            tag => tag.name.toLowerCase() === current.name.toLowerCase()
          );
          if (existingTag && !acc.some(tag => tag.id === existingTag.id)) {
            acc.push(existingTag);
          }
          return acc;
        }

        const isDuplicate = acc.some(
          tag => tag.id === current.id || tag.name.toLowerCase() === current.name.toLowerCase()
        );
        if (!isDuplicate) {
          acc.push({
            ...current,
            color: current.color || null,
            createdAt: new Date(current.createdAt)
          });
        }
        return acc;
      }, []);

      console.log('[AITags] Updating task with tags:', uniqueTags);
      await updateTagSelection(uniqueTags);
      
      // onMutateを待ってから状態を更新
      await onMutate();

      // ローカルの状態を更新
      setLocalTask(prev => ({
        ...prev,
        tags: uniqueTags
      }));

    } finally {
      setIsApplying(false);
      setProcessingUpdate(false);
    }
  };

  // suggestedTagsが空の場合は早期リターン
  if (!suggestedTags || suggestedTags.length === 0) {
    console.log('AITags: No suggested tags available');
    return (
      <div className="text-sm text-zinc-400 p-4">
        タグの提案はありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">タグの提案</h3>
        {isApplying && <AILoading size="sm" text="適用中..." />}
      </div>

      {/* 提案されたタグを横一列で表示 */}
      <div className="flex flex-wrap gap-2">
        {suggestedTags.map((tag) => {
          const isSelected = localTask.tags?.some(
            (existingTag) => existingTag.name.toLowerCase() === tag.name.toLowerCase()
          );
          const isPending = pendingTags[tag.name];

          return (
            <button
              key={tag.name}
              onClick={() => void handleSuggestedTagClick(tag.name)}
              disabled={isSelected || isPending}
              className="group relative"
            >
              <ColoredTag
                tag={{
                  id: `suggested-${tag.name}`,
                  name: tag.name,
                  color: null,
                  userId: '',
                  createdAt: new Date()
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
          selectedTags={localTask.tags || []}
          onTagsChange={(tags) => void updateTaskWithTags(tags)}
          className="w-full"
          variant="default"
        />
      </div>
    </div>
  );
} 