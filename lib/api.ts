import { useAIStore } from '@/store/aiStore';

import { TaskSummary } from './ai/types';

interface AIRequestBase {
  title: string;
  content: string;
}

interface APIError {
  error: string;
  details?: string;
}

export async function generateSummary(
  data: AIRequestBase
): Promise<TaskSummary> {
  const { settings } = useAIStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Gemini使用時のみAPIキーを設定
  if (settings.provider === 'gemini' && settings.apiKey) {
    headers['x-api-key'] = settings.apiKey;
  }

  const response = await fetch('/api/ai/summary', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...data,
      engine: settings.provider,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = result as APIError;
    throw new Error(error.details || error.error);
  }

  return result;
}
