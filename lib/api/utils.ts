import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { AIError } from '@/lib/ai/types';
import { authOptions } from '@/lib/auth';

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'ログインが必要です。',
        },
        { status: 401 }
      );
    }

    const result = await handler();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);

    if ((error as AIError).type) {
      const aiError = error as AIError;
      return NextResponse.json(
        {
          error: aiError.type,
          message: aiError.message,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : '予期せぬエラーが発生しました。';
    return NextResponse.json(
      {
        error: 'UNKNOWN_ERROR',
        message,
      },
      { status: 500 }
    );
  }
}

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
