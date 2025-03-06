import { AIPromptKey } from '@/types/ai';

import { AI_PROMPTS } from './index';

type TemplateVariables = Record<string, string>;

export function getPrompt(key: AIPromptKey, variables: TemplateVariables): string {
  const template = AI_PROMPTS[key].prompt;
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replace(`{{${key}}}`, value),
    template
  );
}

export function validatePromptOutput<T>(key: AIPromptKey, output: unknown): output is T {
  // 基本的な型チェック
  if (!output || typeof output !== 'object') {
    return false;
  }

  // outputFormatの型に基づいて検証
  const expectedFormat = AI_PROMPTS[key].outputFormat;
  return Object.keys(expectedFormat).every((key) => key in output);
}

export function validatePromptKey(key: string): key is AIPromptKey {
  return key in AI_PROMPTS;
} 