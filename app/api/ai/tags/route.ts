import { NextResponse } from 'next/server';

import { handleAIRequest, parseJSONResponse } from '@/lib/ai/gemini/request-handler';
import { AITaskAnalysis } from '@/lib/ai/types/analysis';
import { AIRequestBase } from '@/lib/ai/types/provider';

type TagsRequest = AIRequestBase & {
  existingTags?: string[];
};

// AIが提案するタグの型（idなし）
interface SuggestedTag {
  name: string;
  color: string;
}

interface TagsResponse {
  suggestedTags: SuggestedTag[];
}

const validation = {
  validator: (data: unknown): data is TagsRequest => {
    const request = data as TagsRequest;
    return (
      typeof request === 'object' &&
      request !== null &&
      typeof request.title === 'string' &&
      typeof request.content === 'string' &&
      (request.existingTags === undefined || Array.isArray(request.existingTags))
    );
  },
  errorMessage: 'タイトルと内容は必須です',
};

export async function POST(request: Request): Promise<NextResponse> {
  return handleAIRequest<TagsRequest, TagsResponse>(
    request,
    validation,
    async (data, model) => {
      const existingTagsText = data.existingTags?.join(', ') || '';
      const prompt = `
以下のタスクの内容から、適切なタグを提案してください。
タグは1つ以上、5つ以下で提案してください。

タイトル: ${data.title}
内容: ${data.content}
既存のタグ: ${existingTagsText}

出力形式：
{
  "suggestedTags": [
    {
      "name": "タグ名",
      "color": "カラーコード（例: #FF0000）"
    },
    ...
  ]
}

注意：
- タグは5つ以内にしてください
- タグは短く、具体的にしてください
- タグは日本語で出力してください
- 既存のタグを優先的に使用してください
- カラーコードは見やすい色を選んでください`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const jsonResponse = parseJSONResponse<AITaskAnalysis>(text);

      if (jsonResponse?.suggestedTags && Array.isArray(jsonResponse.suggestedTags)) {
        // 文字列配列をSuggestedTag配列に変換
        const tags: SuggestedTag[] = jsonResponse.suggestedTags.map(tag => {
          if (typeof tag === 'string') {
            return {
              name: tag,
              color: '#6366F1' // デフォルトカラー
            };
          }
          return tag as SuggestedTag;
        });
        return { suggestedTags: tags };
      }

      return { suggestedTags: [] };
    }
  );
}
