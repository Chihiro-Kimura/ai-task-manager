import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tasks, category } = await req.json();
    const userId = req.headers.get('X-User-Id');

    // リクエストの詳細をログ出力
    console.log('Reorder request:', {
      tasksCount: tasks?.length,
      category,
      userId: userId?.slice(0, 8), // IDの一部のみログ出力
    });

    if (!tasks || !Array.isArray(tasks) || !category) {
      console.error('Invalid request:', { tasks, category, userId });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // トランザクション内でカテゴリー内の全タスクを取得して並び順を更新
    await prisma.$transaction(
      async (tx) => {
        // 現在のカテゴリー内のタスクを取得
        const currentTasks = await tx.task.findMany({
          where: {
            userId: userId as string,
            category: category,
          },
          orderBy: {
            task_order: 'asc',
          },
        });

        console.log('Current tasks found:', currentTasks.length);

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
      },
      {
        timeout: 10000, // タイムアウトを10秒に設定
      }
    );

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    // エラーの詳細をログ出力
    console.error('Reorder error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'タスクの並び順の更新に失敗しました' },
      { status: 500 }
    );
  }
}
