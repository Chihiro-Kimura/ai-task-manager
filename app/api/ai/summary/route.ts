import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 401 }
      );
    }

    const { title, content } = await request.json();

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
      const prompt = `
以下のタスクの内容を3行程度で簡潔に要約してください。
重要なポイントを漏らさず、具体的にまとめてください。

タイトル：${title}
内容：${content}

出力形式：
{
  "summary": "要約文"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text(); // ✅ `await` を追加

      // JSON 形式かどうかをチェック
      const jsonMatch = text.match(/\{[^}]*"summary"[^}]*\}/);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]) as { summary: string };
          return NextResponse.json(jsonResponse);
        } catch (parseError) {
          console.warn('JSON parse error, returning raw text:', parseError);
        }
      }

      // JSON ではなかった場合、そのまま返す
      return NextResponse.json({ 
        summary: text.replace(/^```json\n|\n```$/g, '') // コードブロックがある場合は削除
      });

    } catch (error) {
      console.error('Summary generation error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { 
          error: 'タスクの要約生成に失敗しました',
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
