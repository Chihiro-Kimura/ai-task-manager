import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Google Gemini API設定
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    console.log('🔍 APIリクエストを受信 - タスクの優先度判定');

    // リクエストからタスクIDを取得
    const { taskId } = await req.json();
    if (!taskId) {
      return errorResponse('❌ タスクIDが必要です', 400);
    }

    // タスクの内容を取得
    const task = await fetchTaskById(taskId);
    if (!task) {
      return errorResponse('❌ 指定されたタスクが見つかりません', 404);
    }

    // AIで優先度を判定
    const priority = await getTaskPriority(task);

    // 優先度をSupabaseに保存
    await updateTaskPriority(taskId, priority);

    console.log(`✅ タスク ${taskId} の優先度: ${priority}`);
    return NextResponse.json({ taskId, priority });
  } catch (error: any) {
    console.error('🚨 APIエラー:', error.message);
    return errorResponse('サーバーエラー', 500, error.message);
  }
}

// 🔹 指定されたタスクを取得
async function fetchTaskById(taskId: string) {
  const { data: task, error } = await supabase
    .from('tasks')
    .select('title, description')
    .eq('id', taskId)
    .single();

  if (error) throw new Error(`Supabase エラー: ${error.message}`);
  return task;
}

// 🔹 AI でタスクの優先度を判定
async function getTaskPriority(task: { title: string; description?: string }) {
  try {
    const taskText = `タスク: ${task.title}\n詳細: ${
      task.description || 'なし'
    }`;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      `以下のタスクに対して、「高」「中」「低」の3段階で優先度を判定してください。\n\n${taskText}`
    );

    const priority = await result.response.text();
    return priority.includes('高')
      ? '高'
      : priority.includes('低')
      ? '低'
      : '中';
  } catch (error: any) {
    console.error('🚨 Gemini API エラー:', error.message);
    return '中';
  }
}

// 🔹 タスクの優先度をSupabaseに保存
async function updateTaskPriority(taskId: string, priority: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ priority })
    .eq('id', taskId);

  if (error) throw new Error(`Supabase 更新エラー: ${error.message}`);
}

// 🔹 エラーレスポンス用ヘルパー関数
function errorResponse(message: string, status: number, details?: string) {
  console.error(`❌ ${message}`, details || '');
  return NextResponse.json({ error: message, details }, { status });
}
