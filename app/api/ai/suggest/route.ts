import { Task } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';


import { geminiProvider } from '@/lib/ai/gemini';
import { llamaProvider } from '@/lib/ai/llama';
import { Priority, TaskInput } from '@/lib/ai/types';
import {
  validateApiKey,
  validateRequestBody,
  withErrorHandler,
} from '@/lib/api/utils';

interface SuggestRequest {
  engine: 'gemini' | 'llama';
  tasks: Task[];
}

function isSuggestRequest(data: unknown): data is SuggestRequest {
  const request = data as SuggestRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    (request.engine === 'gemini' || request.engine === 'llama') &&
    Array.isArray(request.tasks) &&
    request.tasks.every(
      (task) =>
        typeof task === 'object' &&
        task !== null &&
        typeof task.title === 'string' &&
        typeof task.status === 'string'
    )
  );
}

function convertToTaskInput(task: Task): TaskInput {
  return {
    title: task.title,
    description: task.description || undefined,
    priority: task.priority as Priority | undefined,
    status: task.status,
  };
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

    const taskInputs = tasks.map(convertToTaskInput);
    return await llamaProvider.suggestNextTask(taskInputs);
  });
}
