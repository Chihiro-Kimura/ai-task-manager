import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付を「YYYY年MM月DD日」形式でフォーマットします
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年MM月dd日', { locale: ja });
}

/**
 * 日付を「〇〇前」形式でフォーマットします
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ja });
}

/**
 * 日付を「YYYY年MM月DD日 HH:mm」形式でフォーマットします
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年MM月dd日 HH:mm', { locale: ja });
} 