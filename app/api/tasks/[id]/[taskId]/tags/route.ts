import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';
import { TagInput, updateAndConnectTags } from '@/lib/utils/tag';

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tags } = (await req.json()) as { tags: (string | TagInput)[] };
    const { taskId } = await params;

    if (!tags) {
      return new NextResponse('Missing tags', { status: 400 });
    }

    const updatedTags = await updateAndConnectTags(session.user.id, taskId, tags, 'task');
    return NextResponse.json(updatedTags);
  } catch (error) {
    console.error('[TASK_TAGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 