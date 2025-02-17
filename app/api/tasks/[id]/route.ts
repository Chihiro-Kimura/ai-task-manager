import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateTaskData, UpdateTaskRequest } from '@/types/task';

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

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'タスクの取得に失敗しました' },
        { status: 500 }
      );
    }

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
    const { id } = await params;
    const { title, description, priority, status, dueDate }: UpdateTaskRequest =
      await request.json();

    const userId = request.headers.get('X-User-Id');

    const { data: existingTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', userId)
      .eq('id', id)
      .single();

    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    const updateData: UpdateTaskData = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.due_date = dueDate;

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('userId', userId)
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: `更新エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        status === 'completed'
          ? '✅ タスクが完了しました'
          : '✅ タスクが更新されました',
      updatedTask: {
        ...existingTask,
        ...updateData,
        statusDisplay: status === 'completed' ? '☑️' : '☐',
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'サーバーエラー', details: errorMessage },
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
    const { id } = await params;
    const userId = request.headers.get('X-User-Id');

    console.log('Delete request:', { id, userId });

    const { data: existingTask, error: checkError } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', userId)
      .eq('id', id)
      .single();

    console.log('Existing task:', existingTask);
    console.log('Check error:', checkError);

    if (!existingTask) {
      return NextResponse.json(
        {
          error: 'タスクが見つかりません',
          details: { id, userId, checkError },
        },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('userId', userId)
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: `削除エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '✅ タスクが削除されました',
      deletedTask: existingTask,
    });
  } catch (error: unknown) {
    console.error('Server error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      {
        error: 'サーバーエラー',
        details: errorMessage,
        requestInfo: {
          id: (await params).id,
          userId: request.headers.get('X-User-Id'),
        },
      },
      { status: 500 }
    );
  }
}
