import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AI_PROMPTS } from '@/lib/ai/prompts';
import { BaseTaskOutput } from '@/types/task/base';
import { TaskSuggestionResponse } from '@/types/task/suggestion';

interface SuggestRequest {
  tasks: BaseTaskOutput[];
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
  return handleAIRequest<SuggestRequest, TaskSuggestionResponse>(
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

      const prompt = AI_PROMPTS.suggest.prompt
        .replace('{{tasksText}}', tasksText);

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<TaskSuggestionResponse>(text);

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
