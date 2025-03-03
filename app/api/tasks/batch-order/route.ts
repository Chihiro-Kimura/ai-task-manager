import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface TaskUpdate {
  id: string;
  category: string;
  task_order: number;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { tasks } = (await request.json()) as { tasks: TaskUpdate[] };
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // タスクをカテゴリーごとにグループ化
    const tasksByCategory = tasks.reduce<Record<string, TaskUpdate[]>>(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
      },
      {}
    );

    // トランザクション内で全てのタスクを更新
    await prisma.$transaction(
      async (tx) => {
        // 各カテゴリーのタスクを更新
        for (const [_category, categoryTasks] of Object.entries(
          tasksByCategory
        )) {
          const updates = categoryTasks.map((task) =>
            tx.task.update({
              where: {
                id: task.id,
                userId,
              },
              data: {
                category: task.category,
                task_order: task.task_order,
              },
            })
          );

          await Promise.all(updates);
        }
      },
      {
        timeout: 10000,
        maxWait: 5000,
      }
    );

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'タスクの並び順の更新に失敗しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 