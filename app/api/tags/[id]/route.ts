import { Tag } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
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
  req: Request,
  { params }: Props
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    await prisma.tag.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TAGS_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 