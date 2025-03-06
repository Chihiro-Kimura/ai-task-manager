'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { createTag as createTagUtil, updateTags as updateTagsUtil } from '@/lib/utils/tag';
import { Tag } from '@/types/common';

export async function createTagAction(name: string): Promise<Tag> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('認証が必要です');
    }

    // 既存のタグを検索（大文字小文字を区別しない）
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        userId: session.user.id,
      },
    });

    // 既存のタグがある場合はそれを返す
    if (existingTag) {
      return {
        ...existingTag,
        color: existingTag.color || null,
        createdAt: new Date(existingTag.createdAt)
      };
    }

    // 新しいタグを作成
    const tag = await prisma.tag.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    return {
      ...tag,
      color: tag.color || null,
      createdAt: new Date(tag.createdAt)
    };
  } catch (error: unknown) {
    console.error('Tag creation error:', error);
    const message = error instanceof Error ? error.message : 'タグの作成に失敗しました';
    throw new Error(message);
  }
}

export async function updateTagsAction(params: {
  id: string;
  type: 'task' | 'note';
  tags: string[];
}): Promise<Tag[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('認証が必要です');
    }

    const result = await updateTagsUtil(params);
    return result.map(tag => ({
      ...tag,
      color: tag.color || null,
      createdAt: new Date(tag.createdAt)
    }));
  } catch (error: unknown) {
    console.error('Tags update error:', error);
    const message = error instanceof Error ? error.message : 'タグの更新に失敗しました';
    throw new Error(message);
  }
} 