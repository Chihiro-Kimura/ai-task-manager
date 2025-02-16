// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 個別のタスク取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id');

    const { data: task, error } = await supabase
      .from('tasks')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// タスクの更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { title, description, priority, status } = await request.json();
    const userId = request.headers.get('X-User-Id');

    // タスクの存在確認
    const { data: existingTask, error: checkError } = await supabase
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

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // 各フィールドが存在する場合のみ更新データに追加
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;

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
      message: '✅ タスクが更新されました',
      updatedTask: { ...existingTask, ...updateData },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}

// タスクの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('X-User-Id');

    console.log('Delete request:', { id, userId });

    // タスクの存在確認
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
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラー',
        details: error.message,
        requestInfo: { id, userId: request.headers.get('X-User-Id') },
      },
      { status: 500 }
    );
  }
}

// リクエストボディの型定義を追加
interface UpdateTaskRequest {
  title: string;
  description: string;
  priority: string;
}
