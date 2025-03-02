import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface TagsRequest {
  title: string;
  content: string;
  existingTags: { id: string; name: string }[];
}

function isTagsRequest(data: unknown): data is TagsRequest {
  const request = data as TagsRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
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
    const { title, content, existingTags } = validateRequestBody(
      data,
      isTagsRequest
    );
    const apiKey = validateApiKey(req.headers);

    geminiProvider.initialize(apiKey);
    return await geminiProvider.getTagSuggestions(title, content, existingTags);
  });
}
