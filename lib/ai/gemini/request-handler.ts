import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { AIError } from '@/lib/ai/types/errors';

import { AIRequestValidation } from './types';

const DEFAULT_CONFIG = {
  model: "gemini-1.5-pro",
  temperature: 0.3,
  maxOutputTokens: 1024,
} as const;

export async function handleAIRequest<T, R>(
  request: Request,
  validation: AIRequestValidation<T>,
  processor: (data: T, model: GenerativeModel) => Promise<R>
): Promise<NextResponse> {
  try {
    const data = await request.json();
    if (!validation.validator(data)) {
      const error: AIError = {
        type: 'INVALID_REQUEST',
        message: validation.errorMessage
      };
      return NextResponse.json(error, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const error: AIError = {
        type: 'API_KEY_NOT_SET',
        message: 'APIキーが設定されていません'
      };
      return NextResponse.json(error, { status: 400 });
    }

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: DEFAULT_CONFIG.model,
      generationConfig: {
        temperature: DEFAULT_CONFIG.temperature,
        maxOutputTokens: DEFAULT_CONFIG.maxOutputTokens,
      },
    });

    try {
      const result = await processor(data, model);
      return NextResponse.json(result);
    } catch (error) {
      console.error('AI processing error:', error);
      const aiError: AIError = {
        type: 'UNKNOWN_ERROR',
        message: '処理に失敗しました',
        originalError: error instanceof Error ? error : undefined
      };
      return NextResponse.json(aiError, { status: 500 });
    }
  } catch (error) {
    console.error('Request handling error:', error);
    const aiError: AIError = {
      type: 'INVALID_REQUEST',
      message: 'リクエストの処理に失敗しました',
      originalError: error instanceof Error ? error : undefined
    };
    return NextResponse.json(aiError, { status: 500 });
  }
}

export function parseJSONResponse<T>(text: string): T | null {
  // 配列またはオブジェクトのJSONを検出する正規表現
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      console.warn('JSON parse error:', error);
      // エラーの詳細をログに出力
      if (error instanceof Error) {
        console.warn('Error details:', {
          message: error.message,
          match: jsonMatch[0],
        });
      }
      return null;
    }
  }
  return null;
}

export function formatAIResponse(text: string): string {
  return text
    .replace(/^```json\n|\n```$/g, '') // コードブロックの削除
    .trim();
} 