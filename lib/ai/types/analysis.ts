import { AITag } from '@/components/(tasks)/item/features/ai/types';
import { Priority } from '@/types/common';
import { Category } from '@/types/task/category';
import { AITaskSuggestion } from '@/types/task/suggestion';

/**
 * AIタスク分析の結果型
 */
export interface AITaskAnalysis {
  summary?: string;
  category?: {
    category: Category;
    confidence: number;
    reason?: string;
  };
  confidence?: number;
  suggestedPriority?: Priority;
  suggestedTags?: (string | AITag)[];
}

export type { AITaskSuggestion }; 