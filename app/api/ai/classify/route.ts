import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface ClassifyRequest {
  title: string;
  content: string;
}

function isClassifyRequest(data: unknown): data is ClassifyRequest {
  const request = data as ClassifyRequest;
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
    const { title, content } = validateRequestBody(data, isClassifyRequest);
    const apiKey = validateApiKey(req.headers);

    geminiProvider.initialize(apiKey);
    return await geminiProvider.classifyTask(title, content);
  });
}
