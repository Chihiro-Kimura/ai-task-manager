import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface TaskUpdate {
  id: string;
  category: string;
  task_order: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  console.log('=== Task Order Update API Start ===');
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

    console.log('=== Task Order Update API End ===');
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('=== Task Order Update API Error ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'タスクの並び順の更新に失敗しました' },
      { status: 500 }
    );
  }
} 