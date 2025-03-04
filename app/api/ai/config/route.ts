import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/config';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      apiKey: process.env.GEMINI_API_KEY || null,
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    return NextResponse.json(
      { error: '設定の取得に失敗しました' },
      { status: 500 }
    );
  }
} 