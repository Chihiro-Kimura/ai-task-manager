import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Tag[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tags } = await req.json();
    const taskId = await Promise.resolve(params.id);

    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    // 既存のタスクを確認
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        tags: true,
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // タグの関連付けを更新
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        userId: session.user.id,
      },
      data: {
        tags: {
          set: tags.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedTask.tags);
  } catch (error) {
    console.error('[TASK_TAGS_UPDATE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 