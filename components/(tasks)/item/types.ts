import { TaskWithExtras } from '@/types/task';

export interface AITaskAnalysisProps {
  selectedFeatureId: string | null;
  isLoading: boolean;
  error?: string;
  summary?: { summary: string };
  tags?: string[];
  priority?: '高' | '中' | '低';
  category?: { category: string; confidence: number };
  nextTask?: {
    title: string;
    description: string;
    priority: '高' | '中' | '低';
  };
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
  setSelectedFeatureId: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface AIFeatureProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
} 