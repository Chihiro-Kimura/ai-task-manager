import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { getRandomTagColor } from '@/lib/constants/colors';
import { prisma } from '@/lib/db/client';

// タグの作成・更新用のデータ型
interface TagData {
  name: string;
  color?: string;
}

export async function GET(): Promise<NextResponse<Tag[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            notes: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('[TAGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse<Tag>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = (await req.json()) as TagData;

    // 既存のタグを検索
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive', // 大文字小文字を区別しない
        },
        userId: session.user.id,
      },
    });

    // 既存のタグがある場合はそれを返す
    if (existingTag) {
      const responseTag = {
        ...existingTag,
        color: existingTag.color ? JSON.parse(existingTag.color) : null,
      };
      return NextResponse.json(responseTag);
    }

    // 新しいタグを作成
    const randomColor = getRandomTagColor();
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: JSON.stringify(randomColor),
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            notes: true,
            tasks: true,
          },
        },
      },
    });

    // レスポンスを返す前に色情報をパースする
    const responseTag = {
      ...tag,
      color: tag.color ? JSON.parse(tag.color) : null,
    };

    return NextResponse.json(responseTag);
  } catch (error) {
    console.error('[TAGS_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
