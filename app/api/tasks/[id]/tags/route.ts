import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { updateAndConnectTags } from '@/lib/utils/tag';

interface TagsUpdateRequest {
  tags: string[];
}

function isTagsUpdateRequest(data: unknown): data is TagsUpdateRequest {
  const request = data as TagsUpdateRequest;
  return (
    typeof request === 'object' &&
    request !== null &&
    Array.isArray(request.tags) &&
    request.tags.every((tag) => typeof tag === 'string')
  );
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // タスクの存在確認
    const task = await prisma.task.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        tags: true
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const data = await req.json();
    if (!isTagsUpdateRequest(data)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const updatedTags = await updateAndConnectTags(
      session.user.id,
      id,
      data.tags,
      'task'
    );

    return NextResponse.json(updatedTags);
  } catch (error) {
    console.error('[TASK_TAGS_UPDATE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 