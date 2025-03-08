'use client';

import { type ReactNode } from 'react';

import { formatDate, type DateFormat } from '@/lib/utils/date';
import { useSettingsStore } from '@/store/settings-store';

interface FormattedDateProps {
  date: Date | string;
  format?: DateFormat;
}

export function FormattedDate({ date, format }: FormattedDateProps): ReactNode {
  const { language, timeZone } = useSettingsStore();

  const formattedDate = formatDate(date, {
    format,
    timeZone,
    locale: language,
  });

  return <time dateTime={new Date(date).toISOString()}>{formattedDate}</time>;
} 