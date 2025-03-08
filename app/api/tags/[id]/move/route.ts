import { type Tag } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/db/client';
import { validateTagHierarchy, updateTagPath, type TagWithHierarchy } from '@/lib/utils/tag';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { newParentId } = await request.json();
    const tagId = params.id;

    // 全てのタグを取得して階層構造を構築
    const allTags = await prisma.tag.findMany({
      where: { userId: session.user.id },
    });

    // 階層構造の検証
    const tagsWithHierarchy: TagWithHierarchy[] = allTags.map(tag => ({
      ...tag,
      children: [],
      level: 0,
      path: '',
    }));

    // 階層構造を構築
    tagsWithHierarchy.forEach(tag => {
      if (tag.parentId) {
        const parent = tagsWithHierarchy.find(t => t.id === tag.parentId);
        if (parent) {
          parent.children.push(tag);
          tag.level = parent.level + 1;
        }
      }
    });

    // 移動の検証
    const validation = validateTagHierarchy(tagsWithHierarchy, tagId, newParentId);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // タグの移動を実行
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { parentId: newParentId || null },
      include: {
        _count: {
          select: {
            notes: true,
            tasks: true,
          },
        },
      },
    });

    // パスを更新
    const newPath = updateTagPath(tagsWithHierarchy, tagId);
    await prisma.tag.update({
      where: { id: tagId },
      data: { path: newPath },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Error moving tag:', error);
    return NextResponse.json(
      { error: 'Failed to move tag' },
      { status: 500 }
    );
  }
} 