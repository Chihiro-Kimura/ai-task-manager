import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  console.log('=== Reorder API Start ===');
  try {
    const { tasks, category } = await req.json();
    const userId = req.headers.get('X-User-Id');

    console.log('Request received:', {
      tasksCount: tasks?.length,
      category,
      userId: userId?.slice(0, 8),
      timestamp: new Date().toISOString(),
    });

    if (!tasks || !Array.isArray(tasks) || !category) {
      console.error('Invalid request:', { tasks, category, userId });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // トランザクション内でカテゴリー内の全タスクを取得して並び順を更新
    await prisma.$transaction(
      async (tx) => {
        console.log('Transaction started');
        const currentTasks = await tx.task.findMany({
          where: {
            userId: userId as string,
            category: category,
          },
          orderBy: {
            task_order: 'asc',
          },
        });

        console.log('Tasks state:', {
          found: currentTasks.length,
          timestamp: new Date().toISOString(),
        });

        // 新しい並び順のマッピングを作成
        const taskOrderMap = new Map(
          tasks.map((task, index) => [task.id, index])
        );

        // 更新が必要なタスクのみを更新
        const updates = currentTasks
          .filter((task) => taskOrderMap.has(task.id))
          .map((task) =>
            tx.task.update({
              where: {
                id: task.id,
                userId: userId as string,
              },
              data: {
                task_order: taskOrderMap.get(task.id),
              },
            })
          );

        console.log('Updates to perform:', updates.length);
        await Promise.all(updates);

        console.log('Transaction completed');
      },
      {
        timeout: 10000,
        maxWait: 5000,
      }
    );

    console.log('=== Reorder API End ===');
    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('=== Reorder API Error ===');
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
