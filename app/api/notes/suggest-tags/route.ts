import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { getTagSuggestions } from '@/lib/gemini';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 既存のタグを取得
    const existingTags = await prisma.tag.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (isDevelopment) {
      console.log('🔍 Suggesting tags for:', { title, content });
      console.log('📑 Existing tags:', existingTags.length);
    }

    // タグの提案を取得
    const suggestions = await getTagSuggestions(title, content, existingTags);

    if (isDevelopment) {
      console.log('✅ Suggested tags:', suggestions);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Failed to suggest tags:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to suggest tags';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
