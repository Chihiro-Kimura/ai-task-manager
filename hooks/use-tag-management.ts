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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TagError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期値のログ
  useEffect(() => {
    console.log('[useTagManagement] Initial mount:', {
      id,
      type,
      initialTags,
      isLoading,
      isInitialized,
      currentTags: tags
    });
  }, []);

  // タグの状態変更を監視
  useEffect(() => {
    console.log('[useTagManagement] Tags state updated:', {
      currentTags: tags,
      isLoading,
      isInitialized,
      error
    });
  }, [tags, isLoading, isInitialized, error]);

  // タグの読み込み
  const loadTags = useCallback(async () => {
    console.log('[useTagManagement] loadTags called:', {
      isInitialized,
      currentTags: tags,
      initialTags
    });

    if (isInitialized) {
      console.log('[useTagManagement] Tags already loaded, returning current tags:', tags);
      return tags;
    }

    try {
      console.log('[useTagManagement] Starting to fetch tags...');
      setIsLoading(true);
      setError(null);
      
      const loadedTags = await fetchTags();
      console.log('[useTagManagement] Raw loaded tags:', loadedTags);
      
      if (!Array.isArray(loadedTags)) {
        console.error('[useTagManagement] Loaded tags is not an array:', loadedTags);
        throw new Error('Invalid tags data received');
      }

      // タグのデータを正規化
      const normalizedTags = loadedTags.map(tag => {
        const normalized = {
          ...tag,
          color: tag.color || null,
          createdAt: new Date(tag.createdAt)
        };
        console.log('[useTagManagement] Normalized tag:', normalized);
        return normalized;
      });

      console.log('[useTagManagement] All normalized tags:', normalizedTags);

      // 初期タグと結合
      const mergedTags = [...normalizedTags];
      initialTags.forEach(tag => {
        if (!mergedTags.some(t => t.id === tag.id)) {
          console.log('[useTagManagement] Adding initial tag:', tag);
          mergedTags.push(tag);
        }
      });

      console.log('[useTagManagement] Final merged tags:', mergedTags);
      setTags(mergedTags);
      setIsInitialized(true);
      return mergedTags;
    } catch (error) {
      console.error('[useTagManagement] Error in loadTags:', error);
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
      return initialTags;
    } finally {
      setIsLoading(false);
    }
  }, [toast, tags, initialTags, isInitialized]);

  // 初期ロード時にタグを取得
  useEffect(() => {
    console.log('[useTagManagement] Initial load effect triggered');
    void loadTags();
  }, [loadTags]);

  // loadTagsの依存配列の変更を監視
  useEffect(() => {
    console.log('[useTagManagement] loadTags dependencies changed:', {
      tagsLength: tags.length,
      initialTagsLength: initialTags.length,
      isInitialized
    });
  }, [tags, initialTags, isInitialized]);

  // タグの作成
  const createNewTag = useCallback(async (name: string) => {
    console.log('[useTagManagement] Creating new tag:', name);
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
        console.log('[useTagManagement] Found existing local tag:', existingLocalTag);
        return existingLocalTag;
      }

      // リモートで確認
      const existingTags = await fetchTags();
      const existingRemoteTag = existingTags.find(
        tag => tag.name.toLowerCase() === normalizedName
      );

      if (existingRemoteTag) {
        console.log('[useTagManagement] Found existing remote tag:', existingRemoteTag);
        const normalizedTag = {
          ...existingRemoteTag,
          color: existingRemoteTag.color || null,
          createdAt: new Date(existingRemoteTag.createdAt)
        };
        setTags(prev => [...prev, normalizedTag]);
        return normalizedTag;
      }

      // 新しいタグを作成
      console.log('[useTagManagement] Creating new tag:', name);
      const newTag = await createTag(name.trim());
      const normalizedTag = {
        ...newTag,
        color: newTag.color || null,
        createdAt: new Date(newTag.createdAt)
      };
      console.log('[useTagManagement] Created new tag:', normalizedTag);

      // ローカルの状態を更新
      setTags(prev => [...prev, normalizedTag]);
      return normalizedTag;
    } catch (error) {
      console.error('[useTagManagement] Error creating tag:', error);
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
  }, [toast, tags]);

  // タグの更新
  const updateTagSelection = useCallback(async (selectedTags: Tag[]) => {
    console.log('[useTagManagement] Updating tag selection:', selectedTags);
    try {
      setIsLoading(true);
      setError(null);

      // IDが存在する場合のみ、APIを通じてタグを更新
      if (id) {
        console.log('[useTagManagement] Updating tags via API:', selectedTags.map(t => t.name));
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
      console.error('[useTagManagement] Error updating tags:', error);
      const errorMsg = TAG_MESSAGES.UPDATE_ERROR;
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