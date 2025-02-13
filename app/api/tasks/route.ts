import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { title, description, userId } = await req.json();
    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          userId: userId || 'guest',
          updatedAt: new Date().toISOString(),
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: 'タスクが追加されました', data });
  } catch (error: any) {
    console.error('🚨 タスク追加エラー:', error.message);
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}
