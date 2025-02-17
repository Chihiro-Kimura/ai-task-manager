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

interface Task {
  title: string;
  description: string | null;
  createdAt: string;
}

// 🔹 メインの API ハンドラー
export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return errorResponse('メッセージが空です', 400);
    }

    const tasks = await fetchTasks();
    if (!tasks.length) {
      return NextResponse.json({ response: '過去のタスク履歴はありません' });
    }

    const formattedTasks = formatTasks(tasks);
    const response = await getAIResponse(formattedTasks, message);
    return NextResponse.json({ response });
  } catch (error) {
    return errorResponse(
      'サーバーエラー',
      500,
      error instanceof Error ? error.message : '不明なエラー'
    );
  }
}

// 🔹 Supabase からタスクを取得
async function fetchTasks() {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('title, description, createdAt')
    .order('createdAt', { ascending: false });

  if (error) throw new Error(`データベースエラー: ${error.message}`);
  return tasks || [];
}

// 🔹 タスク履歴を整形
function formatTasks(tasks: Task[]) {
  return tasks
    .map(
      (task, index) =>
        `${index + 1}. [${task.title}]\n  - 詳細: ${
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
    return result.response.text();
  } catch (error) {
    throw new Error(
      `AI応答の取得に失敗しました: ${
        error instanceof Error ? error.message : '不明なエラー'
      }`
    );
  }
}

// 🔹 エラーレスポンス用ヘルパー関数
function errorResponse(message: string, status: number, details?: string) {
  return NextResponse.json({ error: message, details }, { status });
}
