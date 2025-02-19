import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// タスク一覧用のエンドポイント
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    console.log('GET /api/tasks - User ID:', userId);

    if (!userId) {
      console.error('❌ Missing User ID');
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId as string,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Tasks found:', tasks.length);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの新規作成
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    const data = await request.json();

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || '未完了',
        category: data.category,
        task_order: data.task_order || 0,
        userId: userId as string,
        ...(data.priority && { priority: data.priority }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの更新
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const { title, description, due_date, priority, status } =
      await request.json();
    const userId = request.headers.get('X-User-Id');

    console.log('📝 Update data:', {
      title,
      description,
      due_date,
      priority,
      status,
    });

    // タスクの存在確認
    const existingTask = await prisma.task.findUnique({
      where: {
        id: id,
        userId: userId as string,
      },
    });

    if (!existingTask) {
      console.error('❌ Task not found');
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
        userId: userId as string,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(due_date !== undefined && {
          due_date: due_date ? new Date(due_date) : null,
        }),
        ...(priority && { priority }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Updated task:', updatedTask);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const userId = request.headers.get('X-User-Id');

    console.log('🔍 Deleting task:', id, 'for user:', userId);

    const deletedTask = await prisma.task.delete({
      where: {
        id: id,
        userId: userId as string,
      },
    });

    return NextResponse.json(deletedTask);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
