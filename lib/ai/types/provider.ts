import { Priority } from '@/types/common';
import { BaseTaskOutput } from '@/types/task/base';

import { AITaskAnalysis, AITaskSuggestion } from './analysis';

/**
 * AIプロバイダーの設定
 */
export interface AIEndpoint {
  path: string;
  geminiModel?: string;
  transformersModel?: {
    task: string;
    model: string;
  };
  description: string;
}

/**
 * AIリクエストの基本型
 */
export interface AIRequestBase {
  title: string;
  content: string;
}

/**
 * AIプロバイダーのインターフェース
 */
export interface AIProvider {
  name: string;
  description: string;
  isEnabled: boolean;
  initialize: (apiKey: string) => void;
  analyzeTask: (input: AIRequestBase) => Promise<AITaskAnalysis>;
  suggestNextTask: (tasks: BaseTaskOutput[]) => Promise<AITaskSuggestion>;
  generateTags: (input: AIRequestBase) => Promise<string[]>;
  classifyCategory: (input: AIRequestBase) => Promise<string>;
  getTagSuggestions: (
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ) => Promise<string[]>;
  analyzePriority: (title: string, content: string) => Promise<Priority>;
} 