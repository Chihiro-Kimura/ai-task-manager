import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AI_PROMPTS } from '@/lib/ai/prompts';
import { AIRequestBase } from '@/lib/ai/types/provider';
import { Category } from '@/types/task/category';

type ClassifyRequest = AIRequestBase;

interface CategoryClassification {
  category: Category;
  confidence: number;
  reason: string;
}

const VALID_CATEGORIES: Category[] = ['inbox', 'doing', 'todo'];

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
  return handleAIRequest<ClassifyRequest, CategoryClassification>(
    request,
    validation,
    async (data, model) => {
      const prompt = AI_PROMPTS.classify.prompt
        .replace('{{title}}', data.title)
        .replace('{{content}}', data.content);

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<CategoryClassification>(text);

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

function isValidCategory(category: string): category is Category {
  return VALID_CATEGORIES.includes(category as Category);
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
