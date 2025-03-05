import { Priority, Tag } from '@/types/common';
import { Category } from '@/types/task/category';
import { AITaskSuggestion } from '@/types/task/suggestion';

/**
 * プロンプトテンプレートの基本型
 */
export interface PromptTemplate<T = unknown> {
  prompt: string;
  outputFormat: T;
}

/**
 * AIの出力フォーマット型
 */
export interface SummaryOutput {
  summary: string;
}

export interface TagsOutput {
  suggestedTags: Tag[];
}

export interface ClassifyOutput {
  category: Category;
  confidence: number;
  reason: string;
}

export interface PriorityOutput {
  priority: Priority;
}

export interface NextTaskOutput {
  nextTask: AITaskSuggestion;
}

/**
 * プロンプトのキー型
 */
export type AIPromptKey = 'summary' | 'tags' | 'classify' | 'priority' | 'suggest';

/**
 * プロンプト出力型のマップ
 */
export type AIPromptOutputMap = {
  summary: SummaryOutput;
  tags: TagsOutput;
  classify: ClassifyOutput;
  priority: PriorityOutput;
  suggest: NextTaskOutput;
}; 