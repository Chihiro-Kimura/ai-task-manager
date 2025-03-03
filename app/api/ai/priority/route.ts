import { NextResponse } from 'next/server';

import { GeminiClient } from '@/lib/ai/gemini/client';
import { AITaskAnalysis } from '@/lib/ai/gemini/types';
import { withErrorHandler } from '@/lib/api/middleware/error-handler';
import { validateRequestBody } from '@/lib/api/middleware/validation';
import { Priority } from '@/types/common';

interface PriorityRequest {
  title: string;
  content: string;
}

function isPriorityRequest(data: unknown): data is PriorityRequest {
  const request = data as PriorityRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    typeof request.title === 'string' &&
    typeof request.content === 'string'
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await request.json();
    const validatedData = validateRequestBody(data, isPriorityRequest);

    const model = GeminiClient.getInstance().getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
以下のタスクの内容から、優先度を判断してください。
優先度は「高」「中」「低」の3段階で評価してください。

タイトル: ${validatedData.title}
内容: ${validatedData.content}

以下の基準で判断してください：
- 緊急性（期限や時間的制約）
- 重要性（影響範囲や結果の重大さ）
- 依存関係（他のタスクとの関連性）

出力形式：
{
  "suggestedPriority": "高" または "中" または "低"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    try {
      const jsonResponse = JSON.parse(text) as AITaskAnalysis;
      if (jsonResponse.suggestedPriority && isPriority(jsonResponse.suggestedPriority)) {
        return { suggestedPriority: jsonResponse.suggestedPriority };
      }
      throw new Error('Invalid priority value');
    } catch {
      // JSON形式でない場合は、テキストから優先度を抽出
      const priority = extractPriority(text);
      return { suggestedPriority: priority };
    }
  });
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
