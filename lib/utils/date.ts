import { format, formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

import { type TimeZone } from '@/store/settings-store';

const locales = {
  ja,
  en: enUS,
};

export type DateFormat = 'full' | 'date' | 'time' | 'relative';

interface FormatDateOptions {
  format?: DateFormat;
  timeZone?: TimeZone;
  locale?: keyof typeof locales;
}

/**
 * 日付を「YYYY年MM月DD日」形式でフォーマットします
 */
export function formatDate(
  date: Date | string,
  options: FormatDateOptions = {}
): string {
  const {
    format: formatType = 'full',
    timeZone = 'Asia/Tokyo',
    locale = 'ja',
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locales[locale];

  // タイムゾーンの調整
  const tzOffset = new Date().getTimezoneOffset();
  const tzDiff = {
    'Asia/Tokyo': 9,
    'UTC': 0,
    'America/Los_Angeles': -8,
  }[timeZone];
  
  const adjustedDate = new Date(
    dateObj.getTime() + (tzOffset + tzDiff * 60) * 60 * 1000
  );

  switch (formatType) {
    case 'full':
      return format(adjustedDate, 'PPPp', { locale: localeObj });
    case 'date':
      return format(adjustedDate, 'PP', { locale: localeObj });
    case 'time':
      return format(adjustedDate, 'p', { locale: localeObj });
    case 'relative':
      return formatDistanceToNow(adjustedDate, {
        addSuffix: true,
        locale: localeObj,
      });
    default:
      return format(adjustedDate, 'PPPp', { locale: localeObj });
  }
}

/**
 * 日付を「YYYY年MM月DD日 HH:mm」形式でフォーマットします
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年MM月dd日 HH:mm', { locale: ja });
} 