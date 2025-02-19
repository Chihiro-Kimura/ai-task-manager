import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tasks, category } = await req.json();
    const userId = req.headers.get('X-User-Id');

    if (!tasks || !Array.isArray(tasks) || !category) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 特定のカテゴリー内でのみ並び順を更新
    await prisma.$transaction(
      tasks.map((task, index) =>
        prisma.task.update({
          where: {
            id: task.id,
            userId: userId as string,
            category: category,
          },
          data: { task_order: index },
        })
      )
    );

    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
