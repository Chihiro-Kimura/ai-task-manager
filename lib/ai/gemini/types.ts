import { Priority } from '@/types/common';

import { AIRequestBase } from '../types';

export interface AIRequestValidation<T> {
  validator: (data: unknown) => data is T;
  errorMessage: string;
}

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