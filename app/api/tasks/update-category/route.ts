import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { taskId, category } = await req.json();
    const userId = req.headers.get('X-User-Id');

    if (!taskId || !category) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await prisma.task.update({
      where: { id: taskId, userId: userId as string },
      data: { category },
    });

    return NextResponse.json({ message: 'Category updated' });
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
