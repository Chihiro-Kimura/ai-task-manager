import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import { AISettings } from '@/lib/ai/types';

interface AIStore {
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  getActiveProvider: () => typeof geminiProvider | typeof transformersProvider;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      settings: {
        provider: 'transformers',
        isEnabled: true,
      },
      updateSettings: (newSettings) =>
        set((state) => {
          const settings = { ...state.settings, ...newSettings };

          // Gemini APIキーが設定された場合
          if (settings.provider === 'gemini' && settings.apiKey) {
            geminiProvider.initialize(settings.apiKey);
          }

          return { settings };
        }),
      getActiveProvider: () => {
        const { provider } = get().settings;
        return provider === 'gemini' ? geminiProvider : transformersProvider;
      },
    }),
    {
      name: 'ai-settings',
    }
  )
);
