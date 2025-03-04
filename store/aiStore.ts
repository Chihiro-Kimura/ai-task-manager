import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { geminiProvider } from '@/lib/ai/gemini';
import { AIProvider } from '@/lib/ai/types';
import { AISettings } from '@/types/common';

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
        apiKey: undefined,
        isEnabled: false,
        useAI: true
      },
      updateSettings: (newSettings) => {
        const currentSettings = get().settings;
        set({ settings: { ...currentSettings, ...newSettings } });
      },
      getActiveProvider: () => {
        const { settings } = get();
        if (!settings.apiKey || !settings.isEnabled) {
          throw new Error('AI機能が利用できません');
        }
        return geminiProvider;
      },
    }),
    {
      name: 'ai-settings',
      skipHydration: true,
    }
  )
);
