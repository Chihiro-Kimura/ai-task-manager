import { TagColor } from '@/lib/constants/colors';
import { TaskWithExtras } from '@/types/task';
import { AITaskSuggestion } from '@/types/task/suggestion';

export interface AITaskAnalysisProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
  onClose: () => void;
}

export interface AIFeatureProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
}

export interface AISummaryProps extends AIFeatureProps {
  summary: string;
}

// AIによって提案されるタグの基本型
export type AITag = {
  name: string;
  color: TagColor;
};

// タグ提案の結果型（すべてのタグがcolor情報を持つ）
export type TagSuggestion = AITag;

export interface AITagsProps extends AIFeatureProps {
  suggestedTags: TagSuggestion[];
}

export interface AIPriorityProps extends AIFeatureProps {
  priority: '高' | '中' | '低';
}

export interface AICategoryProps {
  category: {
    category: string;
    confidence: number;
    reason?: string;
  };
  onMutate: () => Promise<void>;
}

export interface AINextTaskProps extends AIFeatureProps {
  nextTask: AITaskSuggestion;
  onRefresh: () => void;
}

export interface AIAnalysisResult {
  summary?: { summary: string };
  priority?: '高' | '中' | '低';
  classify?: {
    category: string;
    confidence: number;
    reason?: string;
  };
  suggest?: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
  tags?: {
    suggestedTags: Array<{
      name: string;
      color: string | null;
    }>;
  };
} 