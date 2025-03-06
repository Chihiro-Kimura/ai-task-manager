import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';

type Props = {
  params: {
    id: string;
  };
};

export async function PATCH(
  req: Request,
  { params }: Props
): Promise<NextResponse<Tag>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const id = await params.id;
    const data = await req.json();

    const tag = await prisma.tag.update({
      where: {
        id,
        userId: session.user.id,
      },
      data,
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('[TAGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // タグの存在確認
    const tag = await prisma.tag.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    await prisma.tag.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TAG_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 