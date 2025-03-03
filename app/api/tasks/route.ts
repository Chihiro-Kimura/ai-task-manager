import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';

// タスク一覧用のエンドポイント
export async function GET(_request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tags: true,
      },
      orderBy: [
        {
          category: 'asc',
        },
        {
          task_order: 'asc',
        },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// タスクの新規作成
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const userId = request.headers.get('X-User-Id');
    const data = await request.json();

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || '未完了',
        category: data.category,
        task_order: data.task_order || 0,
        userId: userId as string,
        ...(data.priority && { priority: data.priority }),
        ...(data.due_date !== undefined && {
          due_date: data.due_date ? new Date(data.due_date) : null,
        }),
        ...(data.tags && {
          tags: {
            connect: data.tags.map((tag: { id: string }) => ({ id: tag.id })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_CREATE]', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const { title, description, due_date, priority, status, tags } =
      await request.json();
    const userId = request.headers.get('X-User-Id');

    // タスクの存在確認
    const existingTask = await prisma.task.findUnique({
      where: {
        id: id,
        userId: userId as string,
      },
      include: {
        tags: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
        userId: userId as string,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(due_date !== undefined && {
          due_date: due_date ? new Date(due_date) : null,
        }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(tags && {
          tags: {
            set: tags.map((tag: { id: string }) => ({ id: tag.id })),
          },
        }),
        updatedAt: new Date(),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[TASK_UPDATE]', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const userId = request.headers.get('X-User-Id');

    const deletedTask = await prisma.task.delete({
      where: {
        id: id,
        userId: userId as string,
      },
    });

    return NextResponse.json(deletedTask);
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
