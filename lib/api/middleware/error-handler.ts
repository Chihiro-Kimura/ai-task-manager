import { NextResponse } from 'next/server';

import { AIError } from '@/lib/ai/gemini/types';

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
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