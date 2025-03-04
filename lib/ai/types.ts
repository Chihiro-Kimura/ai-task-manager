import { Priority, Tag } from '@/types/common';

export interface AIEndpoint {
  path: string;
  geminiModel?: string;
  transformersModel?: {
    task: string;
    model: string;
  };
  description: string;
}

export interface TaskSummary {
  summary: string;
  keywords: string[];
}

export interface TaskClassification {
  category: string;
  confidence: number;
  reason?: string;
}

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

export interface TaskInput {
  title: string;
  description: string | null;
  priority: Priority | null;
  tags?: Tag[];
}

export interface TaskOutput extends TaskInput {
  id: string;
  status: string;
  category: string;
  due_date: Date | null;
  task_order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface AITaskAnalysis {
  summary?: string;
  category?: {
    category: string;
    confidence: number;
    reason?: string;
  };
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

export interface AIProvider {
  isEnabled: boolean;
  analyzeTask: (input: AIRequestBase) => Promise<AITaskAnalysis>;
  suggestNextTask: (tasks: TaskOutput[]) => Promise<AITaskSuggestion>;
  generateTags: (input: AIRequestBase) => Promise<string[]>;
  classifyCategory: (input: AIRequestBase) => Promise<string>;
  getTagSuggestions: (title: string, content: string, existingTags: { id: string; name: string }[]) => Promise<string[]>;
  analyzePriority: (title: string, content: string) => Promise<Priority>;
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

export type NextTaskSuggestion = AITaskSuggestion;
