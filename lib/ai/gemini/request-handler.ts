import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: validation.errorMessage },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          error: '処理に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 500 }
    );
  }
}

export function parseJSONResponse<T>(text: string): T | null {
  const jsonMatch = text.match(/\{[^}]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      console.warn('JSON parse error:', error);
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