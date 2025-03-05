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
  suggestedTags: string[] | Array<{
    name: string;
    color: string;
  }>;
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
  nextTask: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
}

export interface AIAnalysisResult {
  summary?: { summary: string };
  tags?: string[];
  priority?: {
    priority: '高' | '中' | '低';
  } | '高' | '中' | '低';
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
  suggestedTags?: Array<{
    name: string;
    color: string;
  }>;
} 