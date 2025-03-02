import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('[TAGS_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
