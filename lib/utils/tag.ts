import { Tag } from '@prisma/client';

import { getRandomTagColor } from '@/lib/constants/colors';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { prisma } from '@/lib/db/client';
import { getRandomColor } from '@/lib/utils/styles';

export interface TagUpdateParams {
  id?: string;
  type?: 'task' | 'note';
  tags: string[];
}

export interface TagInput {
  name: string;
  color?: string | null;
}

export class TagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagError';
  }
}

// 共通のタグ更新ロジック
export async function updateOrCreateTags(
  userId: string,
  tags: (string | TagInput)[]
): Promise<Tag[]> {
  // タグ入力を正規化
  const normalizedTags = tags.map(tag => {
    if (typeof tag === 'string') {
      return { name: tag, color: null };
    }
    return tag;
  });

  // 既存のタグを検索
  const existingTags = await prisma.tag.findMany({
    where: {
      name: {
        in: normalizedTags.map(tag => tag.name),
        mode: 'insensitive', // 大文字小文字を区別しない
      },
      userId
    }
  });

  // 既存のタグ名のセット（大文字小文字を区別しない）
  const existingTagNames = new Set(
    existingTags.map(tag => tag.name.toLowerCase())
  );

  // 新規タグを作成
  const newTags = await Promise.all(
    normalizedTags
      .filter(tag => !existingTagNames.has(tag.name.toLowerCase()))
      .map(tag => {
        const randomColor = getRandomTagColor();
        return prisma.tag.create({
          data: {
            name: tag.name,
            color: JSON.stringify(randomColor),
            userId
          }
        });
      })
  );

  // 既存のタグと新規タグを組み合わせる
  return [...existingTags, ...newTags];
}

// タグの更新と接続を行う共通ロジック
export async function updateAndConnectTags(
  userId: string,
  itemId: string,
  tagIds: string[],
  type: 'task' | 'note'
): Promise<Tag[]> {
  // タグIDから既存のタグを検索
  const existingTags = await prisma.tag.findMany({
    where: {
      id: {
        in: tagIds
      },
      userId
    }
  });

  // タスクまたはノートを更新
  const model = type === 'task' ? prisma.task : prisma.note;
  const updated = await model.update({
    where: {
      id: itemId,
      userId
    },
    data: {
      tags: {
        set: existingTags.map(tag => ({ id: tag.id }))
      }
    },
    include: {
      tags: true
    }
  });

  return updated.tags;
}

export async function createTag(name: string): Promise<Tag> {
  try {
    const randomColor = getRandomColor();
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        color: JSON.stringify(randomColor),
      }),
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.CREATE_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.CREATE_ERROR);
  }
}

export async function updateTags({ id, type = 'task', tags }: TagUpdateParams): Promise<Tag[]> {
  try {
    if (!id) {
      throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
    }

    // suggested-プレフィックス付きのIDを除外
    const normalizedTags = tags.filter(tagId => !tagId.startsWith('suggested-'));

    const endpoint = type === 'task' 
      ? `/api/tasks/${id}/tags`
      : `/api/notes/${id}/tags`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: normalizedTags }),
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.DELETE_ERROR);
    }
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.DELETE_ERROR);
  }
}

export async function fetchTags(): Promise<Tag[]> {
  try {
    console.log('[fetchTags] Starting API request...');
    const response = await fetch('/api/tags');
    
    console.log('[fetchTags] API response status:', response.status);
    console.log('[fetchTags] API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('[fetchTags] API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new TagError(TAG_MESSAGES.FETCH_ERROR);
    }

    const responseText = await response.text();
    console.log('[fetchTags] Raw response text:', responseText);

    let tags;
    try {
      tags = JSON.parse(responseText);
      console.log('[fetchTags] Parsed tags:', tags);
    } catch (parseError) {
      console.error('[fetchTags] JSON parse error:', parseError);
      console.error('[fetchTags] Invalid JSON:', responseText);
      throw new TagError(TAG_MESSAGES.FETCH_ERROR);
    }

    if (!Array.isArray(tags)) {
      console.error('[fetchTags] Invalid tags format:', tags);
      throw new TagError(TAG_MESSAGES.FETCH_ERROR);
    }

    // タグの形式を検証
    const validatedTags = tags.map(tag => {
      if (!tag.id || !tag.name) {
        console.error('[fetchTags] Invalid tag format:', tag);
        throw new TagError(TAG_MESSAGES.FETCH_ERROR);
      }
      return tag;
    });

    console.log('[fetchTags] Successfully validated tags:', validatedTags);
    return validatedTags;
  } catch (error) {
    console.error('[fetchTags] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.FETCH_ERROR);
  }
} 