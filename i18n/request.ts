import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`@/messages/${locale}.json`)).default,
  timeZone: 'Asia/Tokyo',
  now: new Date(),
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix: 'as-needed',
})); 