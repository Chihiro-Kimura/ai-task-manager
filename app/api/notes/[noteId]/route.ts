import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { UpdateNoteData } from '@/types/note';

interface RouteParams {
  params: {
    noteId: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const noteId = params.noteId;
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
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

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to fetch note:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
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

    const noteId = params.noteId;
    const data = (await request.json()) as UpdateNoteData;

    // ノートの存在確認
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // タグの存在確認（指定されている場合）
    if (data.tags) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: data.tags },
          userId: session.user.id,
        },
      });

      if (tags.length !== data.tags.length) {
        return NextResponse.json(
          { error: 'Some tags were not found' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      title: data.title,
      content: data.content,
      priority: data.priority,
      tags: {
        set: data.tags ? data.tags.map(tagId => ({ id: tagId })) : [],
      },
    };

    console.log('Update data:', updateData);

    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: updateData,
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

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const noteId = params.noteId;
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 