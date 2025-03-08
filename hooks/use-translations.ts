import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useCallback } from 'react';

import { useSettingsStore } from '@/store/settings-store';

interface UseTranslationsReturn {
  t: (key: string, values?: Record<string, string | number>) => string;
  language: string;
}

export function useTranslations(): UseTranslationsReturn {
  const { language } = useSettingsStore();
  const t = useNextIntlTranslations();

  const translate = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      try {
        return t(key, values);
      } catch (error) {
        console.error(`Translation key not found: ${key}`, error);
        return key;
      }
    },
    [t]
  );

  return {
    t: translate,
    language,
  };
} 