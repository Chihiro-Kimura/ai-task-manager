import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();
    const userId = req.headers.get('X-User-Id');

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // バッチ更新を使用して効率化
    await prisma.$transaction(
      tasks.map((task, index) =>
        prisma.task.update({
          where: { id: task.id, userId: userId as string },
          data: { task_order: index },
        })
      )
    );

    return NextResponse.json({ message: 'Order updated' });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
