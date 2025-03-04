import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AIRequestBase } from '@/lib/ai/types';

type ClassifyRequest = AIRequestBase;

const VALID_CATEGORIES = ['inbox', 'doing', 'todo'] as const;
type Category = typeof VALID_CATEGORIES[number];

interface ClassifyResponse {
  category: Category;
  confidence: number;
  reason: string;
}

const validation = {
  validator: (data: unknown): data is ClassifyRequest => {
    const request = data as ClassifyRequest;
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
  return handleAIRequest<ClassifyRequest, ClassifyResponse>(
    request,
    validation,
    async (data, model) => {
      const prompt = `
以下のタスクを最適なカテゴリーに分類してください。

タイトル: ${data.title}
内容: ${data.content}

カテゴリーの説明:
- inbox: 未整理のタスク。まだ優先度や実行時期が決まっていないもの
- doing: 現在進行中または今すぐ着手すべきタスク
- todo: 次に実行予定のタスク。優先度は決まっているが、今すぐには着手しないもの

出力形式：
{
  "category": "inbox" または "doing" または "todo",
  "confidence": 分類の確信度（0.0から1.0の数値）,
  "reason": "このカテゴリーに分類した理由の説明"
}

注意：
- タスクの緊急性、重要性、依存関係を考慮してください
- 確信度は分類の確実性を表す数値で、1.0が最も確実です
- 理由は具体的に説明してください`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<ClassifyResponse>(text);

      if (jsonResponse?.category && isValidCategory(jsonResponse.category)) {
        return {
          category: jsonResponse.category,
          confidence: jsonResponse.confidence || 0.7,
          reason: jsonResponse.reason || '理由が提供されませんでした',
        };
      }

      // JSON形式でない場合は、テキストから分類を抽出
      const category = extractCategory(text);
      return {
        category,
        confidence: 0.5,
        reason: '自動抽出された分類です',
      };
    }
  );
}

function isValidCategory(value: unknown): value is Category {
  return typeof value === 'string' && VALID_CATEGORIES.includes(value as Category);
}

function extractCategory(text: string): Category {
  const normalized = text.toLowerCase();
  for (const category of VALID_CATEGORIES) {
    if (normalized.includes(category)) {
      return category;
    }
  }
  return 'inbox'; // デフォルト値
}
