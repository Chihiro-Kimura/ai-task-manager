import { z } from 'zod';

import { AIRequestBase } from '@/lib/ai/types/provider';
import { Priority } from '@/types/common';


export interface AIRequestValidation<T> {
  validator: (data: unknown) => data is T;
  errorMessage: string;
}

export function createRequestValidation<T>(
  validator: (data: unknown) => data is T,
  errorMessage: string
): AIRequestValidation<T> {
  return { validator, errorMessage };
}

export const aiRequestBaseSchema = z.object({
  text: z.string().min(1, 'テキストは必須です'),
  language: z.enum(['ja', 'en']).default('ja'),
});

export function validateAIRequestBase(data: unknown): data is AIRequestBase {
  return aiRequestBaseSchema.safeParse(data).success;
}

export const AI_REQUEST_BASE_VALIDATION: AIRequestValidation<AIRequestBase> = {
  validator: validateAIRequestBase,
  errorMessage: 'テキストは必須です',
};

// リクエスト型
export interface AIAnalysisRequest extends AIRequestBase {
  existingTags?: string[];
}

// レスポンス型
export interface AIAnalysisResponse {
  analysis: {
    summary?: string;
    category?: string;
    confidence?: number;
    suggestedPriority?: Priority;
    suggestedTags?: string[];
  };
  error?: {
    type: string;
    message: string;
    originalError?: unknown;
  };
} 