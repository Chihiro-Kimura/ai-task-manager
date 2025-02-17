// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// タスク一覧用のエンドポイント
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'タスクの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Server error:', error);
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
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      priority,
      due_date,
      status,
      category,
      created_at,
    } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          title,
          description,
          priority,
          due_date,
          status: status || '未完了',
          category,
          created_at,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'タスクの作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Server error:', error);
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
    const { title, description } = await request.json();
    const userId = request.headers.get('X-User-Id');

    // タスクの存在確認
    const { data: existingTask } = await supabase
      .from('tasks')
      .select()
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .update({ title, description, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .eq('userId', userId);

    if (error) {
      return NextResponse.json(
        { error: `更新エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '✅ タスクが更新されました' });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: 'サーバーエラー',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
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

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('userId', request.headers.get('X-User-Id'));

  if (error) {
    return NextResponse.json(
      { error: `削除エラー: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: '✅ タスクが削除されました' });
}
