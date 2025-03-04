import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { prisma as db } from '@/lib/db/client';
import { UpdateTaskRequest } from '@/types/task';

// 個別のタスク取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const task = await db.task.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        tags: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// タスクの更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const { tags, ...data } = (await request.json()) as UpdateTaskRequest;

    const task = await db.task.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
        ...(tags && {
          tags: {
            set: tags.map((tag) => ({ id: tag.id })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// タスクの削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    await db.task.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TASK_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
