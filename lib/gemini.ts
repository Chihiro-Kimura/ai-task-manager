import { GoogleGenerativeAI } from '@google/generative-ai';

const isDevelopment = process.env.NODE_ENV === 'development';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function getTagSuggestions(
  title: string,
  content: string,
  existingTags: { id: string; name: string }[]
): Promise<string[]> {
  try {
    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    if (isDevelopment) {
      console.log('🤖 Sending prompt to Gemini:', prompt);
    }

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('No response from Gemini API');
    }

    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    if (isDevelopment) {
      console.log('🤖 Gemini response:', text);
    }

    // 文字列から配列を抽出
    const match = text.match(/\[(.*?)\]/);
    if (!match) {
      console.error('Invalid response format:', text);
      throw new Error('Invalid response format from Gemini API');
    }

    try {
      const suggestions = JSON.parse(`[${match[1]}]`) as string[];

      // 提案されたタグの検証
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('No valid tag suggestions received');
      }

      // タグの正規化
      const normalizedSuggestions = suggestions
        .map((tag) => tag.trim().replace(/['"]/g, ''))
        .filter((tag) => tag.length > 0);

      if (normalizedSuggestions.length === 0) {
        throw new Error('No valid tags after normalization');
      }

      return normalizedSuggestions.slice(0, 3); // 最大3つのタグに制限
    } catch (parseError) {
      console.error('Failed to parse suggestions:', parseError);
      if (parseError instanceof Error) {
        throw new Error(
          `Failed to parse tag suggestions: ${parseError.message}`
        );
      }
      throw new Error('Failed to parse tag suggestions: Unknown error');
    }
  } catch (error) {
    console.error('Failed to get tag suggestions:', error);
    if (error instanceof Error) {
      throw new Error(`Tag suggestion failed: ${error.message}`);
    }
    throw new Error('Tag suggestion failed: Unknown error');
  }
}

export async function analyzePriority(
  title: string,
  content: string
): Promise<'高' | '中' | '低'> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    if (isDevelopment) {
      console.log('🤖 Sending prompt to Gemini:', prompt);
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    if (isDevelopment) {
      console.log('🤖 Gemini response:', text);
    }

    if (text === '高' || text === '中' || text === '低') {
      return text;
    }

    console.warn('Invalid priority response from Gemini:', text);
    return '中'; // デフォルト値
  } catch (error) {
    console.error('Failed to analyze priority:', error);
    return '中'; // エラー時のデフォルト値
  }
}
