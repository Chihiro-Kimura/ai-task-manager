import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Tag[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tags } = (await req.json()) as { tags: string[] };

    if (!tags) {
      return new NextResponse('Missing tags', { status: 400 });
    }

    const note = await prisma.note.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        tags: {
          set: tags.map((id) => ({ id })),
        },
      },
      select: {
        tags: true,
      },
    });

    return NextResponse.json(note.tags);
  } catch (error) {
    console.error('[NOTE_TAGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 