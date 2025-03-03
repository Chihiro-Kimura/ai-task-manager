import { NextResponse } from 'next/server';

import { GeminiClient } from '@/lib/ai/gemini/client';
import { AITaskAnalysis } from '@/lib/ai/gemini/types';
import { withErrorHandler } from '@/lib/api/middleware/error-handler';
import { validateRequestBody } from '@/lib/api/middleware/validation';

interface ClassifyRequest {
  title: string;
  content: string;
}

function isClassifyRequest(data: unknown): data is ClassifyRequest {
  const request = data as ClassifyRequest;
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
    const validatedData = validateRequestBody(data, isClassifyRequest);

    const model = GeminiClient.getInstance().getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
以下のタスクの内容から、最も適切なカテゴリーを判断してください。
カテゴリーは以下から選択してください：
- 開発
- デザイン
- 企画
- 運用
- その他

タイトル: ${validatedData.title}
内容: ${validatedData.content}

以下の基準で判断してください：
- タスクの主な目的
- 必要なスキルや知識
- 作業の性質

出力形式：
{
  "category": "カテゴリー名",
  "confidence": 0.8  // 確信度（0.0 ~ 1.0）
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    try {
      const jsonResponse = JSON.parse(text) as AITaskAnalysis;
      if (jsonResponse.category) {
        return {
          category: jsonResponse.category,
          confidence: jsonResponse.confidence || 1.0,
        };
      }
      throw new Error('Invalid category value');
    } catch {
      // JSON形式でない場合は、テキストからカテゴリを抽出
      const category = extractCategory(text);
      return {
        category,
        confidence: 1.0,
      };
    }
  });
}

const VALID_CATEGORIES = ['開発', 'デザイン', '企画', '運用', 'その他'] as const;
type Category = typeof VALID_CATEGORIES[number];

function extractCategory(text: string): Category {
  const normalized = text.trim();
  if (VALID_CATEGORIES.includes(normalized as Category)) {
    return normalized as Category;
  }
  return 'その他'; // デフォルト値
}
