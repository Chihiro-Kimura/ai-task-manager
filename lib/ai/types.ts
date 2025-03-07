import { Priority } from '@/types/common';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string;
  dueDate: Date | null;
  status: string;
  tags: string[];
}

export interface AIProvider {
  name: string;
  description: string;
  isEnabled: boolean;
  initialize: () => void;
  complete: (prompt: string) => Promise<string>;
  analyzeTask: (title: string, description: string) => Promise<{
    priority: {
      value: Priority;
      confidence: number;
      reason: string;
    };
    category: {
      category: string;
      confidence: number;
      reason: string;
    };
    dueDate: Date | null;
    tags: string[];
  }>;
  suggestNextTask: (tasks: Task[]) => Promise<{
    title: string;
    description: string;
    priority: Priority;
    category: string;
    estimatedDuration: string;
    dependencies: string[];
  }>;
  generateTags: (text: string) => Promise<string[]>;
  classifyCategory: (text: string) => Promise<string>;
  getTagSuggestions: (title: string, content: string, existingTags: { id: string; name: string }[]) => Promise<string[]>;
  analyzePriority: (title: string, content: string) => Promise<Priority>;
  analyzeText: (prompt: string) => Promise<string>;
} 