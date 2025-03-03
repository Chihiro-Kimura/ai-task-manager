import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
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

    const task = await db.task.update({
      where: {
        id: params.taskId,
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

    return NextResponse.json(task.tags);
  } catch (error) {
    console.error('[TASK_TAGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 