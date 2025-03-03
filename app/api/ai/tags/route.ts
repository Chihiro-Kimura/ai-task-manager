import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRandomColor } from '@/lib/utils';

interface Props {
  params: {
    id: string;
  };
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
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 401 }
      );
    }

    const { title, content, existingTags } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    try {
      const existingTagNames = existingTags?.map((tag: { name: string }) => tag.name).join(', ') || '';
      const prompt = `
以下のテキストに適したタグを5つ以内で提案してください。
既存のタグ: ${existingTagNames}

タイトル: ${title}
内容: ${content}

タグの条件:
- 短く簡潔な単語やフレーズ
- 内容を適切に表現している
- 既存のタグを優先的に使用
- 新しいタグは必要な場合のみ提案

出力形式：
カンマ区切りのタグリスト（例: "タグ1, タグ2, タグ3"）`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();

      // カンマで区切られたタグを配列に変換
      const tags = text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (tags.length === 0) {
        return NextResponse.json(
          { error: 'タグの生成に失敗しました' },
          { status: 500 }
        );
      }

      return NextResponse.json(tags);

    } catch (error) {
      return NextResponse.json(
        { 
          error: 'タグの生成に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Props
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
    // paramsをawaitして使用
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
        existingTags.map(tag => [tag.name.toLowerCase(), tag])
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task tags' },
      { status: 500 }
    );
  }
}
