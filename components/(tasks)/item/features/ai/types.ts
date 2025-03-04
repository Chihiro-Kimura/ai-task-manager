import { TaskWithExtras } from '@/types/task';

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

export interface AITagsProps extends AIFeatureProps {
  suggestedTags: string[];
}

export interface AIPriorityProps extends AIFeatureProps {
  priority: '高' | '中' | '低';
}

export interface AICategoryProps extends AIFeatureProps {
  category: {
    category: string;
    confidence: number;
  };
}

export interface AINextTaskProps extends AIFeatureProps {
  nextTask: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
}

export interface AIAnalysisResult {
  summary?: { summary: string };
  tags?: string[];
  priority?: '高' | '中' | '低';
  category?: { category: string; confidence: number };
  nextTask?: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
} 