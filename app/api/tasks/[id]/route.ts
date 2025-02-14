// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ✅ Next.js App Router対応: params取得をasyncに修正
export async function DELETE(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  // paramsを非同期で取得
  const { id } = await context.params;

  if (!id) {
    console.error('❌ タスクIDが指定されていません');
    return NextResponse.json({ error: 'タスクIDは必須です' }, { status: 400 });
  }

  console.log(`🗑️ 削除対象タスクID: ${id}`);

  // Supabaseからタスクを削除
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
