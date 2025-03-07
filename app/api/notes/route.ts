import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { CreateNoteData, NoteSortKey } from '@/types/note';

const ITEMS_PER_PAGE = 12;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const priority = searchParams.get('priority')?.split(',');
    const sort = searchParams.get('sort') as NoteSortKey | null;
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? String(ITEMS_PER_PAGE));

    const where: Prisma.NoteWhereInput = {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                content: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
      ...(priority?.length ? { priority: { in: priority } } : {}),
    };

    const orderBy = (() => {
      switch (sort) {
        case 'title':
          return { title: 'asc' } as const;
        case 'createdAt':
          return { createdAt: 'asc' } as const;
        case '-createdAt':
          return { createdAt: 'desc' } as const;
        default:
          return { updatedAt: 'desc' } as const;
      }
    })();

    // 総件数を取得
    const total = await prisma.note.count({ where });

    // ページネーションを適用してデータを取得
    const notes = await prisma.note.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Cache-Control ヘッダーを設定
    const headers = new Headers();
    headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');

    return NextResponse.json(
      {
        notes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers }
    );
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as CreateNoteData;
    const userId = session.user.id;

    // タグの存在確認
    const tags = data.tags?.length
      ? await prisma.tag.findMany({
          where: {
            id: { in: data.tags },
            userId: session.user.id,
          },
        })
      : [];

    // メモを作成（タグの関連付けも同時に行う）
    const newNote = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority,
        userId,
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
