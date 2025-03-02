import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface TaskUpdate {
  id: string;
  category: string;
  task_order: number;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  console.log('=== Batch Order Update API Start ===');
  try {
    const { tasks } = (await request.json()) as { tasks: TaskUpdate[] };
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    console.log('Request received:', {
      tasksCount: tasks?.length,
      userId: userId?.slice(0, 8),
      timestamp: new Date().toISOString(),
    });

    if (!tasks || !Array.isArray(tasks)) {
      console.error('Invalid request:', { tasks, userId });
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

    console.log('Tasks by category:', {
      categories: Object.keys(tasksByCategory),
      counts: Object.entries(tasksByCategory).map(([category, tasks]) => ({
        category,
        count: tasks.length,
      })),
    });

    // トランザクション内で全てのタスクを更新
    await prisma.$transaction(
      async (tx) => {
        console.log('Transaction started');

        // 各カテゴリーのタスクを更新
        for (const [category, categoryTasks] of Object.entries(
          tasksByCategory
        )) {
          console.log(`Processing category: ${category}`);

          const updates = categoryTasks.map((task) =>
            tx.task.update({
              where: {
                id: task.id,
                userId: userId as string,
              },
              data: {
                category: task.category,
                task_order: task.task_order,
              },
            })
          );

          console.log(`Updates for category ${category}:`, updates.length);
          await Promise.all(updates);
        }

        console.log('Transaction completed');
      },
      {
        timeout: 10000,
        maxWait: 5000,
      }
    );

    console.log('=== Batch Order Update API End ===');
    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('=== Batch Order Update API Error ===');
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