import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AIProviderManager } from '@/lib/ai/provider-manager';
import { AIProvider } from '@/lib/ai/types';
import { Priority } from '@/types/common';

const createEmptyProvider = (): AIProvider => ({
  name: 'Empty Provider',
  description: 'AI機能が無効な状態のプロバイダー',
  isEnabled: false,
  initialize: () => {},
  analyzeTask: async () => ({
    priority: {
      value: '中' as Priority,
      confidence: 1,
      reason: 'AI機能が無効です',
    },
    category: {
      category: 'inbox',
      confidence: 1,
      reason: 'AI機能が無効です',
    },
    dueDate: null,
    tags: [],
  }),
  suggestNextTask: async () => ({
    title: '',
    description: '',
    priority: '中' as Priority,
    category: 'inbox',
    estimatedDuration: '0分',
    dependencies: [],
  }),
  generateTags: async () => [],
  classifyCategory: async () => 'inbox',
  getTagSuggestions: async () => [],
  analyzePriority: async () => '中' as Priority,
});

interface AIState {
  isEnabled: boolean;
  useAI: boolean;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  updateSettings: (settings: Partial<AIState>) => void;
  getActiveProvider: () => AIProvider;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      isEnabled: true,
      useAI: true,
      model: undefined,
      temperature: 0.3,
      maxOutputTokens: 1024,
      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },
      getActiveProvider: () => {
        const { isEnabled, useAI } = get();
        if (!isEnabled || !useAI) {
          return createEmptyProvider();
        }

        const providerManager = AIProviderManager.getInstance();
        const currentProvider = providerManager.getActiveProvider();
        if (!currentProvider?.isEnabled) {
          return createEmptyProvider();
        }

        return currentProvider;
      },
    }),
    {
      name: 'ai-storage',
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        useAI: state.useAI,
        model: state.model,
        temperature: state.temperature,
        maxOutputTokens: state.maxOutputTokens,
      }),
    }
  )
);
