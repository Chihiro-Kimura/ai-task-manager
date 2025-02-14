// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  const { id } = await context.params;

  if (!id) {
    console.error('❌ タスクIDが指定されていません');
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  console.log(`🗑️ 削除対象タスクID: ${id}`);

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    console.error('🚨 Supabase 削除エラー:', error.message);
    return NextResponse.json(
      { error: `削除エラー: ${error.message}` },
      { status: 500 }
    );
  }

  console.log('✅ タスクが削除されました:', id);
  return NextResponse.json({ message: '✅ タスクが削除されました' });
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  try {
    const { title, description } = await request.json();

    const { error } = await supabase
      .from('tasks')
      .update({ title, description, updatedAt: new Date() })
      .eq('id', id);

    if (error) {
      console.error('🚨 Supabase 更新エラー:', error.message);
      return NextResponse.json(
        { error: `更新エラー: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ タスク ${id} が更新されました`);
    return NextResponse.json({ message: '✅ タスクが更新されました' });
  } catch (error: any) {
    console.error('🚨 サーバーエラー:', error.message);
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}
