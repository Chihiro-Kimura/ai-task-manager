import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import { AIProvider, AISettings } from '@/lib/ai/types';

interface AIState {
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  getActiveProvider: () => AIProvider;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      settings: {
        provider: 'transformers',
        isEnabled: true,
      },
      updateSettings: (newSettings) => {
        set((state) => {
          const settings = {
            ...state.settings,
            ...newSettings,
          };

          // APIキーが設定されている場合はGeminiプロバイダーを初期化
          if (settings.provider === 'gemini' && settings.apiKey) {
            geminiProvider.initialize(settings.apiKey);
          }

          return { settings };
        });
      },
      getActiveProvider: () => {
        const { settings } = get();
        if (settings.provider === 'gemini' && settings.apiKey) {
          return geminiProvider;
        }
        return transformersProvider;
      },
    }),
    {
      name: 'ai-settings',
    }
  )
);
