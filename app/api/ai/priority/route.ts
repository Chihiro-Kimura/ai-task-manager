import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AI_PROMPTS } from '@/lib/ai/prompts';
import { AIRequestBase } from '@/lib/ai/types/provider';
import { Priority } from '@/types/common';

type PriorityRequest = AIRequestBase;

const validation = {
  validator: (data: unknown): data is PriorityRequest => {
    const request = data as PriorityRequest;
    return (
      typeof request === 'object' &&
      request !== null &&
      typeof request.title === 'string' &&
      typeof request.content === 'string'
    );
  },
  errorMessage: 'タイトルと内容は必須です',
};

export async function POST(request: Request): Promise<NextResponse> {
  return handleAIRequest<PriorityRequest, { priority: Priority }>(
    request,
    validation,
    async (data, model) => {
      const prompt = AI_PROMPTS.priority.prompt
        .replace('{{title}}', data.title)
        .replace('{{content}}', data.content);

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<{ priority: Priority }>(text);

      if (jsonResponse?.priority && isPriority(jsonResponse.priority)) {
        return { priority: jsonResponse.priority };
      }

      // JSON形式でない場合は、テキストから優先度を抽出
      const priority = extractPriority(text);
      return { priority };
    }
  );
}

function isPriority(value: string): value is Priority {
  return ['高', '中', '低'].includes(value);
}

function extractPriority(text: string): Priority {
  const normalized = text.trim();
  if (normalized === '高' || normalized === '中' || normalized === '低') {
    return normalized;
  }
  return '中'; // デフォルト値
}
