import { AISettings } from '@/lib/ai/types';
import { useAIStore } from '@/store/aiStore';

interface AISettingsHook {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
}

export function useAISettings(): AISettingsHook {
  const { settings, updateSettings } = useAIStore();

  return {
    settings,
    updateSettings,
  };
}
