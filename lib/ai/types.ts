export type Priority = '高' | '中' | '低';

export interface AIProvider {
  name: string;
  description: string;
  isEnabled: boolean;
  requiresApiKey: boolean;
  getTagSuggestions: (
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ) => Promise<string[]>;
  analyzePriority: (title: string, content: string) => Promise<Priority>;
}

export interface AISettings {
  provider: 'gemini' | 'transformers';
  apiKey?: string;
  usageLimit?: number;
  isEnabled: boolean;
}
