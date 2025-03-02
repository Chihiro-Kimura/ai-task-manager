import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const taskId = params.id;

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

    // 既存のタグを取得
    const existingTags = await prisma.tag.findMany({
      where: {
        name: {
          in: tags,
        },
        userId: session.user.id,
      },
    });

    // 新しいタグを作成
    const newTags = tags.filter(
      (tag) => !existingTags.some((existing) => existing.name === tag)
    );
    const createdTags = await Promise.all(
      newTags.map((tag) =>
        prisma.tag.create({
          data: {
            name: tag,
            userId: session.user.id,
          },
        })
      )
    );

    // タスクのタグを更新
    const allTags = [...existingTags, ...createdTags];
    await prisma.task.update({
      where: { id: taskId },
      data: {
        tags: {
          set: allTags.map((tag) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating task tags:', error);
    return NextResponse.json(
      { error: 'Failed to update task tags' },
      { status: 500 }
    );
  }
} 