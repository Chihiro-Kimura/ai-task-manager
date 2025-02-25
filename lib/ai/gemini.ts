import { GoogleGenerativeAI } from '@google/generative-ai';

import { AIProvider, Priority } from './types';

class GeminiProvider implements AIProvider {
  name = 'Gemini AI';
  description = 'Googleが提供する高性能なAIモデル';
  isEnabled = false;
  requiresApiKey = true;
  private genAI: GoogleGenerativeAI | null = null;

  initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.isEnabled = true;
  }

  private validateSetup(): void {
    if (!this.genAI) {
      throw new Error('Gemini AI has not been initialized with an API key');
    }
  }

  async getTagSuggestions(
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    try {
      this.validateSetup();
      if (!title || !content) {
        throw new Error('Title and content are required');
      }

      const model = this.genAI!.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `
以下のメモのタイトルと内容から、適切なタグを3つ程度提案してください。
既存のタグがある場合は、それらも考慮してください。
タグは短く、具体的で、カテゴリ分類に適したものにしてください。
結果は配列形式の文字列で返してください。

タイトル: ${title}
内容: ${content}
${
  existingTags.length > 0
    ? `既存のタグ: ${existingTags.map((tag) => tag.name).join(', ')}`
    : ''
}

出力形式:
["タグ1", "タグ2", "タグ3"]
`;

      const result = await model.generateContent(prompt);
      if (!result.response) {
        throw new Error('No response from Gemini API');
      }

      const text = result.response.text();
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const match = text.match(/\[(.*?)\]/);
      if (!match) {
        throw new Error('Invalid response format from Gemini API');
      }

      const suggestions = JSON.parse(`[${match[1]}]`) as string[];
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('No valid tag suggestions received');
      }

      const normalizedSuggestions = suggestions
        .map((tag) => tag.trim().replace(/['"]/g, ''))
        .filter((tag) => tag.length > 0);

      if (normalizedSuggestions.length === 0) {
        throw new Error('No valid tags after normalization');
      }

      return normalizedSuggestions.slice(0, 3);
    } catch (error) {
      console.error('Failed to get tag suggestions:', error);
      return [];
    }
  }

  async analyzePriority(title: string, content: string): Promise<Priority> {
    try {
      this.validateSetup();
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `
以下のメモのタイトルと内容から、タスクの優先度を判断してください。
優先度は「高」「中」「低」の3段階で評価してください。

タイトル: ${title}
内容: ${content}

以下の基準で判断してください：
- 緊急性（期限や時間的制約）
- 重要性（影響範囲や結果の重大さ）
- 依存関係（他のタスクとの関連性）

出力形式:
"高" または "中" または "低" のいずれか一つだけを出力してください。
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      if (text === '高' || text === '中' || text === '低') {
        return text;
      }

      console.warn('Invalid priority response from Gemini:', text);
      return '中';
    } catch (error) {
      console.error('Failed to analyze priority:', error);
      return '中';
    }
  }
}

export const geminiProvider = new GeminiProvider();
