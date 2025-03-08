'use client';

import { Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { type ReactNode, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/hooks/use-translations';
import { applyFontSize } from '@/lib/utils/font-size';
import { useSettingsStore } from '@/store/settings-store';

export function ThemeSettings(): ReactNode {
  const { theme, setTheme } = useTheme();
  const { fontSize, language, timeZone, setFontSize, setLanguage, setTimeZone } =
    useSettingsStore();
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // フォントサイズの変更を適用
  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  // 言語変更時の処理
  const handleLanguageChange = (newLanguage: string): void => {
    setLanguage(newLanguage as 'ja' | 'en');
    
    // 現在のパスから言語部分を取得
    const segments = pathname.split('/');
    // 最初の空の要素とロケールを除去
    const pathWithoutLocale = segments.slice(2).join('/');
    // 新しい言語でパスを構築
    const newPath = `/${newLanguage}/${pathWithoutLocale}`;
    
    // 新しいパスに遷移
    router.push(newPath);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">
            {t('settings.theme.darkMode.label')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t('settings.theme.darkMode.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
          <Moon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">
            {t('settings.theme.fontSize.label')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t('settings.theme.fontSize.description')}
          </p>
        </div>
        <Select value={fontSize} onValueChange={setFontSize}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('settings.theme.fontSize.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">{t('settings.theme.fontSize.small')}</SelectItem>
            <SelectItem value="medium">{t('settings.theme.fontSize.medium')}</SelectItem>
            <SelectItem value="large">{t('settings.theme.fontSize.large')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">
            {t('settings.theme.language.label')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t('settings.theme.language.description')}
          </p>
        </div>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('settings.theme.language.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ja">{t('settings.theme.language.ja')}</SelectItem>
            <SelectItem value="en">{t('settings.theme.language.en')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">
            {t('settings.theme.timeZone.label')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t('settings.theme.timeZone.description')}
          </p>
        </div>
        <Select value={timeZone} onValueChange={setTimeZone}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('settings.theme.timeZone.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Tokyo">{t('settings.theme.timeZone.tokyo')}</SelectItem>
            <SelectItem value="UTC">{t('settings.theme.timeZone.utc')}</SelectItem>
            <SelectItem value="America/Los_Angeles">{t('settings.theme.timeZone.la')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => router.refresh()}>{t('common.save')}</Button>
      </div>
    </div>
  );
} 