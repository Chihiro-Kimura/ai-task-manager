import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface CreateRequest {
  text: string;
}

function isCreateRequest(data: unknown): data is CreateRequest {
  const request = data as CreateRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    typeof request.text === 'string'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { text } = validateRequestBody(data, isCreateRequest);
    const apiKey = validateApiKey(req.headers);

    geminiProvider.initialize(apiKey);
    return await geminiProvider.createTaskFromText(text);
  });
}
