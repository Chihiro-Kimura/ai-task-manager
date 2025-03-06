import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AI_PROMPTS } from '@/lib/ai/prompts';
import { BaseTaskOutput } from '@/types/task/base';
import { TaskSuggestionResponse } from '@/types/task/suggestion';

interface SuggestRequest {
  currentTask: BaseTaskOutput;
  tasks: BaseTaskOutput[];
}

const validation = {
  validator: (data: unknown): data is SuggestRequest => {
    const request = data as SuggestRequest;
    return (
      typeof request === 'object' &&
      request !== null &&
      typeof request.currentTask === 'object' &&
      request.currentTask !== null &&
      Array.isArray(request.tasks) &&
      request.tasks.every((task) => typeof task === 'object' && task !== null)
    );
  },
  errorMessage: '現在のタスクとタスクリストは必須です',
};

export async function POST(request: Request): Promise<NextResponse> {
  return handleAIRequest<SuggestRequest, TaskSuggestionResponse>(
    request,
    validation,
    async (data, model) => {
      // 現在のタスクと他のタスクを分けて整形
      const currentTaskText = `
【対象タスク】
タイトル: ${data.currentTask.title}
説明: ${data.currentTask.description || '説明なし'}
優先度: ${data.currentTask.priority || '未設定'}
ステータス: ${data.currentTask.status}
カテゴリー: ${data.currentTask.category}
`;

      const otherTasksText = data.tasks
        .filter(task => task.id !== data.currentTask.id)
        .map(
          (task) => `
【既存タスク】
タイトル: ${task.title}
説明: ${task.description || '説明なし'}
優先度: ${task.priority || '未設定'}
ステータス: ${task.status}
カテゴリー: ${task.category}
`
        )
        .join('\n');

      const tasksText = `${currentTaskText}\n${otherTasksText}`;

      const prompt = AI_PROMPTS.suggest.prompt
        .replace('{{title}}', data.currentTask.title)
        .replace('{{content}}', data.currentTask.description || '')
        .replace('{{tasksText}}', tasksText);

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      console.log('[AI Suggestion Response]:', text);
      
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
