import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface CreateRequest {
  engine: 'gemini' | 'transformers';
  text: string;
}

function isCreateRequest(data: unknown): data is CreateRequest {
  const request = data as CreateRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    (request.engine === 'gemini' || request.engine === 'transformers') &&
    typeof request.text === 'string'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { engine, text } = validateRequestBody(data, isCreateRequest);

    if (engine === 'gemini') {
      const apiKey = validateApiKey(req.headers);
      geminiProvider.initialize(apiKey);
      return await geminiProvider.createTaskFromText(text);
    }

    return await transformersProvider.createTaskFromText(text);
  });
}
