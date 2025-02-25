import { AIEndpoint } from './types';

export const AI_ENDPOINTS: Record<string, AIEndpoint> = {
  summary: {
    path: '/api/ai/summary',
    geminiModel: 'gemini-pro',
    transformersModel: {
      task: 'summarization',
      model: 'Xenova/distilbart-cnn-12-6',
    },
    description: 'タスクの要約生成',
  },
};
