import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AIProviderType } from '@/lib/ai/provider-manager';

interface AIProviderState {
  provider: AIProviderType;
  apiKey: string | null;
  isInitialized: boolean;
  setProvider: (provider: AIProviderType) => void;
  setApiKey: (apiKey: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAIProviderStore = create<AIProviderState>()(
  persist(
    (set) => ({
      provider: 'openai',
      apiKey: null,
      isInitialized: false,
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: 'ai-provider-storage',
      // APIキーなどの機密情報を保存するため、暗号化を有効にする
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        isInitialized: state.isInitialized,
      }),
    }
  )
); 