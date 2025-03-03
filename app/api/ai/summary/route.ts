import { NextResponse } from 'next/server';

import { GeminiClient } from '@/lib/ai/gemini/client';
import { AITaskAnalysis } from '@/lib/ai/gemini/types';
import { withErrorHandler } from '@/lib/api/middleware/error-handler';
import { validateRequestBody } from '@/lib/api/middleware/validation';

interface SummaryRequest {
  title: string;
  content: string;
}

function isSummaryRequest(data: unknown): data is SummaryRequest {
  const request = data as SummaryRequest;
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
    const validatedData = validateRequestBody(data, isSummaryRequest);

    const model = GeminiClient.getInstance().getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
以下のタスクの内容を3行程度で簡潔に要約してください。
重要なポイントを漏らさず、具体的にまとめてください。

タイトル：${validatedData.title}
内容：${validatedData.content}

出力形式：
{
  "summary": "要約文"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    try {
      const jsonResponse = JSON.parse(text) as AITaskAnalysis;
      return jsonResponse;
    } catch {
      // JSON形式でない場合は、テキストをそのまま要約として使用
      return {
        summary: text.trim(),
      };
    }
  });
}
