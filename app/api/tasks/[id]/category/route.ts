import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const taskId = params.id;
    const { category } = await request.json();
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
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[TASK_CATEGORY_UPDATE]', error);
    return NextResponse.json(
      { error: 'カテゴリーの更新に失敗しました' },
      { status: 500 }
    );
  }
} 