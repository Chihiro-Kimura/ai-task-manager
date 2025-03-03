import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { getRandomColor } from '@/lib/utils/styles';

interface TagsUpdateRequest {
  tags: string[];
}

function isTagsUpdateRequest(data: unknown): data is TagsUpdateRequest {
  const request = data as TagsUpdateRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    Array.isArray(request.tags) &&
    request.tags.every((tag) => typeof tag === 'string')
  );
}

type Props = {
  params: {
    id: string;
  };
};

export async function PUT(
  req: NextRequest,
  { params }: Props
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    if (!isTagsUpdateRequest(data)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { tags } = data;
    const { id: taskId } = await Promise.resolve(params);

    // タスクの所有者を確認
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // タグの作成と更新を1つのトランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // 既存のタグをキャッシュとして保持
      const existingTags = await tx.tag.findMany({
        where: {
          name: {
            in: tags,
            mode: 'insensitive', // 大文字小文字を区別しない
          },
          userId: session.user.id,
        },
      });

      // 既存のタグ名をマップとして保持（大文字小文字を区別しない）
      const existingTagsMap = new Map(
        existingTags.map(tag => [tag.name.toLowerCase(), tag])
      );

      // 新しいタグを作成（存在しないものだけ）
      const newTags = await Promise.all(
        tags
          .filter(tag => !existingTagsMap.has(tag.toLowerCase()))
          .map(name =>
            tx.tag.create({
              data: {
                name,
                userId: session.user.id,
                color: JSON.stringify(getRandomColor()),
              },
            })
          )
      );

      // すべてのタグを結合（既存のタグと新規作成したタグ）
      const allTags = [...existingTags, ...newTags];

      // タスクのタグを更新
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          tags: {
            set: allTags.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });

      return updatedTask.tags;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating task tags:', error);
    return NextResponse.json(
      { error: 'Failed to update task tags' },
      { status: 500 }
    );
  }
} 