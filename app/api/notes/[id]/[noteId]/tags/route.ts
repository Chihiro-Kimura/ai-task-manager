import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tags } = (await req.json()) as { tags: string[] };

    if (!tags) {
      return new NextResponse('Missing tags', { status: 400 });
    }

    const note = await db.note.update({
      where: {
        id: params.noteId,
        userId: session.user.id,
      },
      data: {
        tags: {
          set: tags.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(note.tags);
  } catch (error) {
    console.error('[NOTE_TAGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 