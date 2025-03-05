import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AITaskAnalysis } from '@/lib/ai/types/analysis';
import { AIRequestBase } from '@/lib/ai/types/provider';

type SummaryRequest = AIRequestBase;

const validation = {
  validator: (data: unknown): data is SummaryRequest => {
    const request = data as SummaryRequest;
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
  return handleAIRequest<SummaryRequest, { summary: string }>(
    request,
    validation,
    async (data, model) => {
      const prompt = `
以下のタスクの内容を3行程度で簡潔に要約してください。
重要なポイントを漏らさず、具体的にまとめてください。

タイトル：${data.title}
内容：${data.content}

出力形式：
{
  "summary": "要約文"
}`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<AITaskAnalysis>(text);

      if (jsonResponse?.summary) {
        return { summary: jsonResponse.summary };
      }

      // JSON形式でない場合は、テキストをそのまま要約として使用
      return { summary: text.trim() };
    }
  );
}
