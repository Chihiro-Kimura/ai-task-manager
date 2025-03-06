import { Priority, Tag } from '@/types/common';
import { Category } from '@/types/task/category';
import { AITaskSuggestion } from '@/types/task/suggestion';

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
 * プロンプト出力型のマップ
 */
export interface AIPromptOutputMap {
  summary: SummaryOutput;
  tags: TagsOutput;
  classify: ClassifyOutput;
  priority: PriorityOutput;
  suggest: NextTaskOutput;
} 