// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
