import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/db/client';
import { type TagWithHierarchy } from '@/lib/utils/tag';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 全てのタグを取得
    const allTags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            notes: true,
            tasks: true,
          },
        },
      },
    });

    // 階層構造を構築
    const tagsWithHierarchy: TagWithHierarchy[] = allTags.map(tag => ({
      ...tag,
      children: [],
      level: 0,
      path: '',
    }));

    // 親子関係を構築
    tagsWithHierarchy.forEach(tag => {
      if (tag.parentId) {
        const parent = tagsWithHierarchy.find(t => t.id === tag.parentId);
        if (parent) {
          parent.children.push(tag);
          tag.level = parent.level + 1;
        }
      }
    });

    // パスを更新
    tagsWithHierarchy.forEach(tag => {
      const path: string[] = [tag.name];
      let currentTag = tag;
      
      while (currentTag.parentId) {
        const parent = tagsWithHierarchy.find(t => t.id === currentTag.parentId);
        if (!parent) break;
        path.unshift(parent.name);
        currentTag = parent;
      }
      
      tag.path = path.join(' / ');
    });

    // ルートタグ（親を持たないタグ）のみを返す
    const rootTags = tagsWithHierarchy.filter(tag => !tag.parentId);

    return NextResponse.json(rootTags);
  } catch (error) {
    console.error('Error fetching tag hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag hierarchy' },
      { status: 500 }
    );
  }
} 