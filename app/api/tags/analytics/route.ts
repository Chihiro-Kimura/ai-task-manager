import { type Tag } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/db/client';

interface TagWithCount extends Tag {
  _count: {
    notes: number;
    tasks: number;
  };
}

interface TagAnalytics {
  totalTags: number;
  totalUsage: number;
  topTags: Array<{
    id: string;
    name: string;
    color: string | null;
    usage: {
      total: number;
      notes: number;
      tasks: number;
    };
  }>;
  hierarchyStats: {
    maxDepth: number;
    avgDepth: number;
    totalParents: number;
    totalLeaves: number;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    color: string | null;
    createdAt: Date;
  }>;
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 全てのタグを取得（使用数を含む）
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 階層構造の分析
    const depthMap = new Map<string, number>();
    let maxDepth = 0;
    let totalDepth = 0;
    let totalParents = 0;
    let totalLeaves = 0;

    (allTags as TagWithCount[]).forEach(tag => {
      // 親タグを持つタグの深さを計算
      if (tag.parentId) {
        const parentDepth = depthMap.get(tag.parentId) || 0;
        const currentDepth = parentDepth + 1;
        depthMap.set(tag.id, currentDepth);
        maxDepth = Math.max(maxDepth, currentDepth);
        totalDepth += currentDepth;
      } else {
        depthMap.set(tag.id, 0);
      }

      // 親タグと葉タグの数を計算
      const hasChildren = allTags.some(t => t.parentId === tag.id);
      if (hasChildren) {
        totalParents++;
      } else {
        totalLeaves++;
      }
    });

    // 使用頻度でソートしたトップタグを取得
    const topTags = (allTags as TagWithCount[])
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usage: {
          total: tag._count.notes + tag._count.tasks,
          notes: tag._count.notes,
          tasks: tag._count.tasks,
        },
      }))
      .sort((a, b) => b.usage.total - a.usage.total)
      .slice(0, 10);

    const analytics: TagAnalytics = {
      totalTags: allTags.length,
      totalUsage: (allTags as TagWithCount[]).reduce(
        (sum, tag) => sum + tag._count.notes + tag._count.tasks,
        0
      ),
      topTags,
      hierarchyStats: {
        maxDepth,
        avgDepth: totalDepth / allTags.length,
        totalParents,
        totalLeaves,
      },
      recentActivity: allTags
        .slice(0, 5)
        .map(({ id, name, color, createdAt }) => ({
          id,
          name,
          color,
          createdAt,
        })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching tag analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag analytics' },
      { status: 500 }
    );
  }
} 