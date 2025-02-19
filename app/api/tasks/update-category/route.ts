import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { taskId, category } = await req.json();
    const userId = req.headers.get('X-User-Id');

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        userId: userId as string,
      },
      data: {
        category,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'カテゴリーの更新に失敗しました' },
      { status: 500 }
    );
  }
}
