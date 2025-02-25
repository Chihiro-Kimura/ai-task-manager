import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    tagId: string;
  };
}

interface TagData {
  name: string;
  color?: string;
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

    const userId = session.user.id;
    const { tagId } = params;
    const data = (await request.json()) as TagData;

    // タグの所有者を確認
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // タグを更新
    const updatedTag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Failed to update tag:', error);
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

    const userId = session.user.id;
    const { tagId } = params;

    // タグの所有者を確認
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // タグを削除（関連するメモとの関係も自動的に削除される）
    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
