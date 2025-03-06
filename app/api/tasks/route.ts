import { Task } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { BaseResponse, Tag } from '@/types/common';
import { CreateTaskData, TaskWithExtras, UpdateTaskRequest } from '@/types/task';

// PrismaのTaskをTaskWithExtrasに変換する関数
function convertToTaskWithExtras(task: Task & { tags: Tag[] }): TaskWithExtras {
  return {
    ...task,
    priority: task.priority as TaskWithExtras['priority'],
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    due_date: task.due_date ? new Date(task.due_date) : null,
  };
}

// タスク一覧用のエンドポイント
export async function GET(_request: Request): Promise<NextResponse<TaskWithExtras[] | BaseResponse>> {
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

    return NextResponse.json(tasks.map(convertToTaskWithExtras));
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// タスクの新規作成
export async function POST(request: Request): Promise<NextResponse<TaskWithExtras | BaseResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json() as CreateTaskData;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status,
        category: data.category,
        task_order: data.task_order,
        priority: data.priority,
        userId: session.user.id,
        ...(data.due_date !== undefined && {
          due_date: data.due_date ? new Date(data.due_date) : null,
        }),
        tags: {
          connect: data.tags.map(tag => ({ id: tag.id }))
        }
      },
      include: {
        tags: true
      }
    });

    return NextResponse.json(convertToTaskWithExtras(task));
  } catch (error) {
    console.error('[TASK_CREATE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// タスクの更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TaskWithExtras | BaseResponse>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const data = await request.json() as UpdateTaskRequest;
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
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.due_date !== undefined && {
          due_date: data.due_date ? new Date(data.due_date) : null,
        }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.tags && {
          tags: {
            set: data.tags.map((tag) => ({ id: tag.id })),
          },
        }),
        updatedAt: new Date(),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(convertToTaskWithExtras(updatedTask));
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
): Promise<NextResponse<Task | BaseResponse>> {
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
