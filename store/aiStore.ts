import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AIProviderManager } from '@/lib/ai/provider-manager';
import { AIProvider } from '@/lib/ai/types';

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
      isEnabled: false,
      useAI: true,
      model: undefined,
      temperature: 0.3,
      maxOutputTokens: 1024,
      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },
      getActiveProvider: () => {
        const { isEnabled } = get();
        if (!isEnabled) {
          throw new Error('AI機能が無効になっています');
        }

        const providerManager = AIProviderManager.getInstance();
        const currentProvider = providerManager.getActiveProvider();
        if (!currentProvider.isEnabled) {
          throw new Error('AIプロバイダーが設定されていません');
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
