import { useAIStore } from '@/store/aiStore';
import { AISettings } from '@/types/common';

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
