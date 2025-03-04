import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AITaskSuggestion, TaskOutput } from '@/lib/ai/types';

interface SuggestRequest {
  tasks: TaskOutput[];
}

const validation = {
  validator: (data: unknown): data is SuggestRequest => {
    const request = data as SuggestRequest;
    return (
      typeof request === 'object' &&
      request !== null &&
      Array.isArray(request.tasks) &&
      request.tasks.every((task) => typeof task === 'object' && task !== null)
    );
  },
  errorMessage: 'タスクリストは必須です',
};

export async function POST(request: Request): Promise<NextResponse> {
  return handleAIRequest<SuggestRequest, { nextTask: AITaskSuggestion }>(
    request,
    validation,
    async (data, model) => {
      const tasksText = data.tasks
        .map(
          (task) => `
タイトル: ${task.title}
説明: ${task.description || '説明なし'}
優先度: ${task.priority || '未設定'}
ステータス: ${task.status}
カテゴリー: ${task.category}
`
        )
        .join('\n');

      const prompt = `
以下の既存のタスクリストを分析し、次に取り組むべきタスクを提案してください。
既存のタスクの内容や優先度、依存関係を考慮して提案してください。

既存のタスク：
${tasksText}

出力形式：
{
  "nextTask": {
    "title": "タスクのタイトル",
    "description": "タスクの詳細な説明",
    "priority": "高" または "中" または "低",
    "estimatedDuration": "予想所要時間（例：30分、2時間）",
    "dependencies": ["依存するタスクのタイトル"]
  }
}

注意：
- タスクは具体的で実行可能な内容にしてください
- 優先度は既存のタスクとの関連性を考慮して設定してください
- 予想所要時間は現実的な見積もりにしてください
- 依存関係は既存のタスクの中から選んでください`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<{ nextTask: AITaskSuggestion }>(text);

      if (jsonResponse?.nextTask) {
        return { nextTask: jsonResponse.nextTask };
      }

      // エラー時のデフォルト値
      return {
        nextTask: {
          title: '新規タスク',
          description: 'タスクの提案に失敗しました',
          priority: '中',
        },
      };
    }
  );
}
