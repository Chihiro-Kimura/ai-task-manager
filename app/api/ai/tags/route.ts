import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface TagRequest {
  engine: 'gemini' | 'transformers';
  title: string;
  content: string;
  existingTags: { id: string; name: string }[];
}

function isTagRequest(data: unknown): data is TagRequest {
  const request = data as TagRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    (request.engine === 'gemini' || request.engine === 'transformers') &&
    typeof request.title === 'string' &&
    typeof request.content === 'string' &&
    Array.isArray(request.existingTags) &&
    request.existingTags.every(
      (tag) =>
        typeof tag === 'object' &&
        tag !== null &&
        typeof tag.id === 'string' &&
        typeof tag.name === 'string'
    )
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { engine, title, content, existingTags } = validateRequestBody(
      data,
      isTagRequest
    );

    if (engine === 'gemini') {
      const apiKey = validateApiKey(req.headers);
      geminiProvider.initialize(apiKey);
      return await geminiProvider.getTagSuggestions(
        title,
        content,
        existingTags
      );
    }

    return await transformersProvider.getTagSuggestions(
      title,
      content,
      existingTags
    );
  });
}
