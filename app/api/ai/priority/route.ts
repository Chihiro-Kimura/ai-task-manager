import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface PriorityRequest {
  title: string;
  content: string;
}

function isPriorityRequest(data: unknown): data is PriorityRequest {
  const request = data as PriorityRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    typeof request.title === 'string' &&
    typeof request.content === 'string'
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { title, content } = validateRequestBody(data, isPriorityRequest);
    const apiKey = validateApiKey(req.headers);

    geminiProvider.initialize(apiKey);
    return await geminiProvider.analyzePriority(title, content);
  });
}
