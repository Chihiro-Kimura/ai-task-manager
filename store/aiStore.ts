import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { geminiProvider } from '@/lib/ai/gemini';
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
        provider: 'gemini',
        isEnabled: true,
      },
      updateSettings: (newSettings) => {
        set((state) => {
          const settings = {
            ...state.settings,
            ...newSettings,
          };

          if (settings.apiKey) {
            geminiProvider.initialize(settings.apiKey);
          }

          return { settings };
        });
      },
      getActiveProvider: () => {
        const { settings } = get();
        if (!settings.apiKey) {
          throw new Error('APIキーが設定されていません');
        }
        return geminiProvider;
      },
    }),
    {
      name: 'ai-settings',
    }
  )
);
