import { NextRequest, NextResponse } from 'next/server';

import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import { Priority } from '@/lib/ai/types';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status: string;
}

interface SuggestRequest {
  engine: 'gemini' | 'transformers';
  tasks: TaskInput[];
}

function isSuggestRequest(data: unknown): data is SuggestRequest {
  const request = data as SuggestRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    (request.engine === 'gemini' || request.engine === 'transformers') &&
    Array.isArray(request.tasks) &&
    request.tasks.every(
      (task) =>
        typeof task === 'object' &&
        task !== null &&
        typeof task.title === 'string' &&
        (task.description === undefined ||
          typeof task.description === 'string') &&
        (task.priority === undefined ||
          ['高', '中', '低'].includes(task.priority)) &&
        typeof task.status === 'string'
    )
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await req.json();
    const { engine, tasks } = validateRequestBody(data, isSuggestRequest);

    if (engine === 'gemini') {
      const apiKey = validateApiKey(req.headers);
      geminiProvider.initialize(apiKey);
      return await geminiProvider.suggestNextTask(tasks);
    }

    return await transformersProvider.suggestNextTask(tasks);
  });
}
