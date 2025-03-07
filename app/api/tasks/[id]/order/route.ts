import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const taskId = params.id;
    const { category, task_order } = await request.json();
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        userId: userId as string,
      },
      data: {
        category,
        task_order,
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'タスクの並び順の更新に失敗しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 