import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';

interface RouteParams {
  params: {
    noteId: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tags } = await request.json();

    // ノートの存在確認
    const note = await prisma.note.findFirst({
      where: {
        id: params.noteId,
        userId: session.user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // タグの存在確認
    const existingTags = await prisma.tag.findMany({
      where: {
        id: { in: tags },
        userId: session.user.id,
      },
    });

    if (existingTags.length !== tags.length) {
      return NextResponse.json(
        { error: 'Some tags were not found' },
        { status: 400 }
      );
    }

    // タグの更新
    const updatedNote = await prisma.note.update({
      where: {
        id: params.noteId,
      },
      data: {
        tags: {
          set: existingTags.map((tag) => ({ id: tag.id })),
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

    return NextResponse.json(updatedNote.tags);
  } catch (error) {
    console.error('Failed to update note tags:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 