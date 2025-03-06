import { useState, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { createTag, updateTags, fetchTags } from '@/lib/utils/tag';
import type { Tag } from '@/types/common';

interface UseTagManagementProps {
  id?: string;
  type?: 'task' | 'note';
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

interface TagError {
  code: 'DUPLICATE' | 'INVALID_NAME' | 'API_ERROR';
  message: string;
}

interface TagManagement {
  tags: Tag[];
  isLoading: boolean;
  error: TagError | null;
  loadTags: () => Promise<Tag[]>;
  createNewTag: (name: string) => Promise<Tag | null>;
  updateTagSelection: (selectedTags: Tag[]) => Promise<void>;
}

export function useTagManagement({
  id,
  type = 'task',
  initialTags = [],
  onTagsChange
}: UseTagManagementProps): TagManagement {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TagError | null>(null);

  // タグの読み込み
  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedTags = await fetchTags();
      const normalizedTags = loadedTags.map(tag => ({
        ...tag,
        color: tag.color || null,
        createdAt: new Date(tag.createdAt)
      }));
      setTags(normalizedTags);
      return normalizedTags;
    } catch {
      const errorMsg = TAG_MESSAGES.FETCH_ERROR;
      setError({
        code: 'API_ERROR',
        message: errorMsg
      });
      toast({
        title: 'エラー',
        description: errorMsg,
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // タグの作成
  const createNewTag = useCallback(async (name: string) => {
    if (!name.trim()) {
      setError({
        code: 'INVALID_NAME',
        message: 'タグ名を入力してください'
      });
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 最新のタグを取得（状態更新なしで）
      const existingTags = await fetchTags();
      
      // 重複チェック（大文字小文字を区別しない）
      const normalizedName = name.trim().toLowerCase();
      const existingTag = existingTags.find(
        tag => tag.name.toLowerCase() === normalizedName
      );

      if (existingTag) {
        console.log('[TagManagement] Found existing tag:', existingTag);
        return {
          ...existingTag,
          color: existingTag.color || null,
          createdAt: new Date(existingTag.createdAt)
        };
      }

      console.log('[TagManagement] Creating new tag:', name);
      const newTag = await createTag(name.trim());
      const normalizedTag = {
        ...newTag,
        color: newTag.color || null,
        createdAt: new Date(newTag.createdAt)
      };
      console.log('[TagManagement] Created new tag:', normalizedTag);

      // ローカルの状態を更新
      setTags(prev => {
        const updatedTags = [...prev];
        const index = updatedTags.findIndex(t => t.id === normalizedTag.id);
        if (index === -1) {
          updatedTags.push(normalizedTag);
        }
        return updatedTags;
      });

      return normalizedTag;
    } catch {
      const errorMsg = TAG_MESSAGES.CREATE_ERROR;
      setError({
        code: 'API_ERROR',
        message: errorMsg
      });
      toast({
        title: 'エラー',
        description: errorMsg,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // タグの更新
  const updateTagSelection = useCallback(async (selectedTags: Tag[]) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[TagManagement] Updating selection with:', selectedTags);

      // IDが存在する場合のみ、APIを通じてタグを更新
      if (id) {
        console.log('[TagManagement] Updating tags via API:', selectedTags.map(t => t.name));
        await updateTags({
          id,
          type,
          tags: selectedTags.map(tag => tag.id),
        });
      }

      // ローカルの状態を更新
      setTags(prev => {
        const updatedTags = [...prev];
        selectedTags.forEach(tag => {
          const index = updatedTags.findIndex(t => t.id === tag.id);
          if (index === -1) {
            updatedTags.push(tag);
          }
        });
        return updatedTags;
      });

      // 親コンポーネントの状態を更新
      if (onTagsChange) {
        onTagsChange(selectedTags);
      }
    } catch {
      const errorMsg = TAG_MESSAGES.UPDATE_ERROR;
      console.error('[TagManagement] Update error:', errorMsg);
      setError({
        code: 'API_ERROR',
        message: errorMsg
      });
      toast({
        title: 'エラー',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, type, onTagsChange, toast]);

  return {
    tags,
    isLoading,
    error,
    loadTags,
    createNewTag,
    updateTagSelection,
  };
} 