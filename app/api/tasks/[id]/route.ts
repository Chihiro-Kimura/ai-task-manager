import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateTaskRequest } from '@/types/task';

// 個別のタスク取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch {
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
  try {
    const { id: taskId } = await params;
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      console.error('❌ Missing User ID');
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const { title, description, priority, status, dueDate }: UpdateTaskRequest =
      await request.json();

    // タスクの存在確認
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        userId: userId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { due_date: new Date(dueDate) }),
      },
    });

    console.log('✅ Task updated:', taskId);
    return NextResponse.json({
      message: 'タスクが更新されました',
      task: updatedTask,
    });
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
  try {
    const { id: taskId } = await params;
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      console.error('❌ Missing User ID');
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const deletedTask = await prisma.task.delete({
      where: {
        id: taskId,
        userId: userId as string,
      },
    });

    console.log('✅ Task deleted:', taskId);
    return NextResponse.json(deletedTask);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
