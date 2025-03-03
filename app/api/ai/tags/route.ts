import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { GeminiClient } from '@/lib/ai/gemini/client';
import { AITaskAnalysis } from '@/lib/ai/gemini/types';
import { withErrorHandler } from '@/lib/api/middleware/error-handler';
import { validateRequestBody } from '@/lib/api/middleware/validation';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { getRandomColor } from '@/lib/utils/styles';

interface TagsRequest {
  title: string;
  content: string;
  existingTags?: { name: string }[];
}

function isTagsRequest(data: unknown): data is TagsRequest {
  const request = data as TagsRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    typeof request.title === 'string' &&
    typeof request.content === 'string' &&
    (!request.existingTags || Array.isArray(request.existingTags))
  );
}

interface TagsUpdateRequest {
  tags: string[];
}

function isTagsUpdateRequest(data: unknown): data is TagsUpdateRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    'tags' in data &&
    Array.isArray((data as TagsUpdateRequest).tags)
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  return withErrorHandler(async () => {
    const data = await request.json();
    const validatedData = validateRequestBody(data, isTagsRequest);

    const model = GeminiClient.getInstance().getClient().getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const existingTagNames = validatedData.existingTags?.map(tag => tag.name).join(', ') || '';
    const prompt = `
以下のテキストに適したタグを5つ以内で提案してください。
既存のタグ: ${existingTagNames}

タイトル: ${validatedData.title}
内容: ${validatedData.content}

タグの条件:
- 短く簡潔な単語やフレーズ
- 内容を適切に表現している
- 既存のタグを優先的に使用
- 新しいタグは必要な場合のみ提案

出力形式：
{
  "suggestedTags": ["タグ1", "タグ2", "タグ3"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    try {
      const jsonResponse = JSON.parse(text) as AITaskAnalysis;
      if (jsonResponse.suggestedTags) {
        return { suggestedTags: jsonResponse.suggestedTags };
      }
      throw new Error('Invalid response format');
    } catch {
      // JSON形式でない場合は、テキストをカンマで分割してタグとして使用
      const tags = text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // 最大5つのタグに制限

      return {
        suggestedTags: tags,
      };
    }
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    if (!isTagsUpdateRequest(data)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { tags } = data;
    const { id: taskId } = await Promise.resolve(params);

    // タスクの所有者を確認
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    // タグの作成と更新を1つのトランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // 既存のタグをキャッシュとして保持
      const existingTags = await tx.tag.findMany({
        where: {
          name: {
            in: tags,
            mode: 'insensitive',
          },
          userId: session.user.id,
        },
      });

      // 既存のタグ名をマップとして保持
      const existingTagsMap = new Map(
        existingTags.map((tag) => [tag.name.toLowerCase(), tag])
      );

      // 新しいタグを作成（存在しないものだけ）
      const newTags = await Promise.all(
        tags
          .filter(tag => !existingTagsMap.has(tag.toLowerCase()))
          .map(name =>
            tx.tag.create({
              data: {
                name,
                userId: session.user.id,
                color: JSON.stringify(getRandomColor()),
              },
            })
          )
      );

      // すべてのタグを結合
      const allTags = [...existingTags, ...newTags];

      // タスクのタグを更新
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          tags: {
            set: allTags.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });

      return updatedTask.tags;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Failed to update task tags:', error);
    return NextResponse.json(
      { error: 'Failed to update task tags' },
      { status: 500 }
    );
  }
}
