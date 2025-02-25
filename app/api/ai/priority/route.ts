import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface PriorityRequest {
  engine: 'gemini' | 'transformers';
  title: string;
  content: string;
}

function isPriorityRequest(data: unknown): data is PriorityRequest {
  const request = data as PriorityRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    (request.engine === 'gemini' || request.engine === 'transformers') &&
    typeof request.title === 'string' &&
    typeof request.content === 'string'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { engine, title, content } = validateRequestBody(
      data,
      isPriorityRequest
    );

    if (engine === 'gemini') {
      const apiKey = validateApiKey(req.headers);
      geminiProvider.initialize(apiKey);
      return await geminiProvider.analyzePriority(title, content);
    }

    return await transformersProvider.analyzePriority(title, content);
  });
}
