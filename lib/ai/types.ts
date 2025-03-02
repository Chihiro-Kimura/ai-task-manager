export type Priority = '高' | '中' | '低';

export interface AIEndpoint {
  path: string;
  model: string;
  description: string;
}

export interface TaskSummary {
  summary: string;
}

export interface TaskClassification {
  category: string;
  confidence: number;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status: string;
}

export interface NextTaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
}

export interface AIProvider {
  name: string;
  description: string;
  isEnabled: boolean;
  initialize?: (apiKey: string) => void;
  getTagSuggestions: (
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ) => Promise<string[]>;
  analyzePriority: (title: string, content: string) => Promise<Priority>;
  summarizeTask: (title: string, content: string) => Promise<TaskSummary>;
  classifyTask: (title: string, content: string) => Promise<TaskClassification>;
  suggestNextTask: (tasks: TaskInput[]) => Promise<NextTaskSuggestion>;
  createTaskFromText: (text: string) => Promise<{
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
  }>;
}

export interface AISettings {
  provider: 'gemini';
  isEnabled: boolean;
  apiKey?: string;
  model?: string;
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
