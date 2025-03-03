import { AIError } from '@/lib/ai/gemini/types';

export function validateApiKey(headers: Headers): string {
  const apiKey = headers.get('x-api-key');
  if (!apiKey) {
    throw {
      type: 'API_KEY_NOT_SET',
      message:
        'APIキーが設定されていません。設定画面からAPIキーを設定してください。',
    } as AIError;
  }
  return apiKey;
}

export function validateRequestBody<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(data)) {
    throw {
      type: 'INVALID_REQUEST',
      message: 'リクエストの形式が不正です。',
    } as AIError;
  }
  return data;
} 