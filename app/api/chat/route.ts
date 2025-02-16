import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 🔹 Supabaseクライアント設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// 🔹 Google Gemini API設定
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// 🔹 メインの API ハンドラー
export async function POST(req: Request) {
  try {
    console.log('🔍 APIリクエストを受信');

    // 🔹 クライアントからのリクエストを解析
    const { message } = await req.json();
    if (!message) {
      return errorResponse('❌ メッセージが空です', 400);
    }
    console.log('📥 受信したメッセージ:', message);

    // 🔹 Supabase からタスクを取得
    const tasks = await fetchTasks();
    if (!tasks.length) {
      return NextResponse.json({ response: '📭 過去のタスク履歴はありません' });
    }

    // 🔹 タスク履歴を整形して Gemini に送信
    const formattedTasks = formatTasks(tasks);
    const response = await getAIResponse(formattedTasks, message);

    console.log('📝 AIの返答:', response);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('🚨 APIエラー:', error.message);
    return errorResponse('サーバーエラー', 500, error.message);
  }
}

// 🔹 Supabase からタスクを取得
async function fetchTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('title, description, createdAt')
    .order('createdAt', { ascending: false });

  if (error) throw new Error(`Supabase エラー: ${error.message}`);

  console.log('📂 取得したタスク:', tasks);
  return tasks || [];
}

// 🔹 タスク履歴を整形
function formatTasks(tasks: any[]) {
  return tasks
    .map(
      (task, index) =>
        `${index + 1}. 【${task.title}】\n  - 詳細: ${
          task.description || 'なし'
        }\n  - 作成日: ${task.createdAt}`
    )
    .join('\n\n');
}

// 🔹 Google Gemini API でタスク要約を取得
async function getAIResponse(taskHistory: string, message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      `以下は過去のタスク履歴です:\n${taskHistory}\n\nユーザーの質問: ${message}`
    );

    const responseText = await result.response.text();
    return responseText;
  } catch (error: any) {
    console.error('🚨 Gemini API エラー:', error.message);
    return '⚠️ AIからの応答を取得できませんでした';
  }
}

// 🔹 エラーレスポンス用ヘルパー関数
function errorResponse(message: string, status: number, details?: string) {
  console.error(`❌ ${message}`, details || '');
  return NextResponse.json({ error: message, details }, { status });
}
