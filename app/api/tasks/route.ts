// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 🟡 GETメソッド: タスク一覧取得
export async function GET() {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('🚨 Supabase エラー:', error.message);
      return NextResponse.json(
        { error: `DBエラー: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('🚨 サーバーエラー:', error.message);
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}

// 🟢 POSTメソッド: タスク追加
export async function POST(req: Request) {
  try {
    const { title, description, userId } = await req.json();
    if (!title || !userId) {
      return NextResponse.json(
        { error: 'タイトルとユーザーIDは必須です' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .insert([{ title, description, userId }]);

    if (error) {
      console.error('🚨 Supabase 挿入エラー:', error.message);
      return NextResponse.json(
        { error: `挿入エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '✅ タスクが追加されました' });
  } catch (error: any) {
    console.error('🚨 サーバーエラー:', error.message);
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}
