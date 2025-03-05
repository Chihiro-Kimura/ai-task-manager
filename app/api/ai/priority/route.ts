import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AIRequestBase } from '@/lib/ai/types';
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
      const prompt = `
以下のタスクの内容から、優先度を判断してください。
優先度は「高」「中」「低」の3段階で評価してください。

タイトル: ${data.title}
内容: ${data.content}

以下の基準で判断してください：
- 緊急性（期限や時間的制約）
- 重要性（影響範囲や結果の重大さ）
- 依存関係（他のタスクとの関連性）
- 工数（作業量、複雑さ）

出力形式：
{
  "priority": "高" または "中" または "低"
}`;

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

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && ['高', '中', '低'].includes(value);
}

function extractPriority(text: string): Priority {
  const normalized = text.trim();
  if (normalized === '高' || normalized === '中' || normalized === '低') {
    return normalized;
  }
  return '中'; // デフォルト値
}
