import { useState, useCallback, useEffect } from 'react';

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
  const [isInitialized, setIsInitialized] = useState(false);

  const loadTags = useCallback(async () => {
    if (tags.length > 0) {
      return tags;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedTags = await fetchTags();
      setTags(loadedTags);
      return loadedTags;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tags'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [id, type, tags]);

  // 初期ロード時にタグを取得
  useEffect(() => {
    void loadTags();
  }, [loadTags]);

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

      // 既存のタグをチェック（ローカルとリモート両方）
      const normalizedName = name.trim().toLowerCase();
      const existingLocalTag = tags.find(
        tag => tag.name.toLowerCase() === normalizedName
      );

      if (existingLocalTag) {
        return existingLocalTag;
      }

      // リモートで確認
      const existingTags = await fetchTags();
      const existingRemoteTag = existingTags.find(
        tag => tag.name.toLowerCase() === normalizedName
      );

      if (existingRemoteTag) {
        const normalizedTag = {
          ...existingRemoteTag,
          color: existingRemoteTag.color || null,
          createdAt: new Date(existingRemoteTag.createdAt)
        };
        setTags(prev => [...prev, normalizedTag]);
        return normalizedTag;
      }

      // 新しいタグを作成
      const newTag = await createTag(name.trim());
      const normalizedTag = {
        ...newTag,
        color: newTag.color || null,
        createdAt: new Date(newTag.createdAt)
      };

      // ローカルの状態を更新
      setTags(prev => [...prev, normalizedTag]);
      return normalizedTag;
    } catch (error) {
      setError({
        code: 'API_ERROR',
        message: 'Failed to create tag'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tags]);

  // タグの更新
  const updateTagSelection = useCallback(async (selectedTags: Tag[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // IDが存在する場合のみ、APIを通じてタグを更新
      if (id) {
        await updateTags({
          id,
          type,
          tags: selectedTags.map(tag => tag.id),
        });
      }

      // 選択されたタグを利用可能なタグリストに追加
      setTags(prev => {
        const updatedTags = [...prev];
        selectedTags.forEach(tag => {
          if (!updatedTags.some(t => t.id === tag.id)) {
            updatedTags.push(tag);
          }
        });
        return updatedTags;
      });

      // 親コンポーネントの状態を更新
      if (onTagsChange) {
        onTagsChange(selectedTags);
      }
    } catch (error) {
      setError({
        code: 'API_ERROR',
        message: 'Failed to update tags'
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, type, onTagsChange]);

  return {
    tags,
    isLoading,
    error,
    loadTags,
    createNewTag,
    updateTagSelection,
  };
} 