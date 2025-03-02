import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key check:', apiKey ? '設定されています' : '設定されていません');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 401 }
      );
    }

    const { title, content, existingTags } = await request.json();
    console.log('Request payload:', { 
      titleReceived: !!title, 
      contentReceived: !!content,
      existingTagsCount: existingTags?.length || 0
    });

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    try {
      console.log('Generating content with model...');
      const existingTagNames = existingTags?.map((tag: { name: string }) => tag.name).join(', ') || '';
      const prompt = `
以下のテキストに適したタグを5つ以内で提案してください。
既存のタグ: ${existingTagNames}

タイトル: ${title}
内容: ${content}

タグの条件:
- 短く簡潔な単語やフレーズ
- 内容を適切に表現している
- 既存のタグを優先的に使用
- 新しいタグは必要な場合のみ提案

出力形式：
カンマ区切りのタグリスト（例: "タグ1, タグ2, タグ3"）`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();
      console.log('Content generated successfully:', text);

      // カンマで区切られたタグを配列に変換
      const tags = text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (tags.length === 0) {
        return NextResponse.json(
          { error: 'タグの生成に失敗しました' },
          { status: 500 }
        );
      }

      return NextResponse.json(tags);

    } catch (error) {
      console.error('Tags generation error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { 
          error: 'タグの生成に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 500 }
    );
  }
}
