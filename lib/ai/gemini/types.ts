import { Priority } from '@/types/common';

// 基本リクエスト型
export interface AIRequestBase {
  title: string;
  content: string;
}

// APIエラー型
export interface APIError {
  error: string;
  details?: string;
}

export interface AIRequestValidation<T> {
  validator: (data: unknown) => data is T;
  errorMessage: string;
}

export interface AITaskAnalysis {
  summary?: string;
  category?: string;
  confidence?: number;
  suggestedPriority?: Priority;
  suggestedTags?: string[];
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
  estimatedDuration?: string;
  dependencies?: string[];
}

export type AIErrorType =
  | 'API_KEY_NOT_SET'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'INVALID_REQUEST';

export interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: unknown;
}

export interface AISettings {
  provider: 'gemini';
  isEnabled: boolean;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

// リクエスト型
export interface AIAnalysisRequest {
  title: string;
  content: string;
  existingTags?: string[];
}

// レスポンス型
export interface AIAnalysisResponse {
  analysis: AITaskAnalysis;
  error?: AIError;
} 