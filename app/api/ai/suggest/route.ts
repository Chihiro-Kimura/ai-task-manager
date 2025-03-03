import { Task } from '@prisma/client';
import { NextResponse } from 'next/server';

import { GeminiClient } from '@/lib/ai/gemini/client';
import { AITaskSuggestion } from '@/lib/ai/gemini/types';
import { withErrorHandler } from '@/lib/api/middleware/error-handler';
import { validateRequestBody } from '@/lib/api/middleware/validation';
import { Priority } from '@/types/common';

interface SuggestRequest {
  tasks: Task[];
}

function isSuggestRequest(data: unknown): data is SuggestRequest {
  const request = data as SuggestRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    Array.isArray(request.tasks) &&
    request.tasks.every(
      (task) =>
        typeof task === 'object' &&
        task !== null &&
        typeof task.title === 'string' &&
        typeof task.status === 'string'
    )
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await request.json();
    const validatedData = validateRequestBody(data, isSuggestRequest);

    const model = GeminiClient.getInstance().getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const tasksInfo = validatedData.tasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
    }));

    const prompt = `
現在のタスクリストを分析し、次に取り組むべきタスクを提案してください。
以下は現在のタスクリストです：

${JSON.stringify(tasksInfo, null, 2)}

以下の点を考慮して提案してください：
- タスクの優先度
- タスクの依存関係
- 作業の効率性
- リソースの有効活用

出力形式：
{
  "title": "提案するタスクのタイトル",
  "description": "タスクの詳細な説明",
  "priority": "高" | "中" | "低",
  "estimatedDuration": "予想される所要時間（例：2時間）",
  "dependencies": ["依存するタスクのタイトル"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    try {
      const jsonResponse = JSON.parse(text) as AITaskSuggestion;
      if (isValidSuggestion(jsonResponse)) {
        return jsonResponse;
      }
      throw new Error('Invalid suggestion format');
    } catch {
      // JSON形式でない場合は、エラーを返す
      throw new Error('Failed to generate task suggestion');
    }
  });
}

function isValidSuggestion(data: unknown): data is AITaskSuggestion {
  const suggestion = data as AITaskSuggestion;
  return (
    typeof suggestion === 'object' &&
    suggestion !== null &&
    typeof suggestion.title === 'string' &&
    typeof suggestion.description === 'string' &&
    isPriority(suggestion.priority) &&
    (!suggestion.estimatedDuration || typeof suggestion.estimatedDuration === 'string') &&
    (!suggestion.dependencies || Array.isArray(suggestion.dependencies))
  );
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && ['高', '中', '低'].includes(value);
}
