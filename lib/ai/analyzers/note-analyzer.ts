import { AIProvider } from '@/lib/ai/types';
import { NoteType } from '@/types/note';

interface NoteAnalysis {
  priority: '高' | '中' | '低';
  category: NoteType;
  suggestedTags: string[];
  relatedTasks: string[];
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export async function analyzeNoteContent(
  title: string,
  content: string,
  provider: AIProvider
): Promise<NoteAnalysis> {
  const prompt = `
以下のメモのタイトルと内容を分析し、日本語で回答してください：

タイトル：${title}
内容：${content}

以下の項目について分析してください：
1. 優先度（高、中、低）
2. カテゴリ（general: 一般, diary: 日記, idea: アイデア, reference: 参考資料, task_note: タスクメモ）
3. 推奨タグ（5つまで）
4. 関連タスク（3つまで）
5. 要約（100文字以内）
6. 重要ポイント（3つまで）
7. 感情分析（positive, neutral, negative）

回答は以下のJSON形式で返してください：
{
  "priority": "高" | "中" | "低",
  "category": "general" | "diary" | "idea" | "reference" | "task_note",
  "suggestedTags": ["タグ1", "タグ2", ...],
  "relatedTasks": ["タスク1", "タスク2", ...],
  "summary": "要約文",
  "keyPoints": ["ポイント1", "ポイント2", ...],
  "sentiment": "positive" | "neutral" | "negative",
  "reason": "分析理由の説明"
}
`;

  try {
    const response = await provider.analyzeText(prompt);
    const analysis = JSON.parse(response);

    return {
      priority: analysis.priority as '高' | '中' | '低',
      category: analysis.category as NoteType,
      suggestedTags: analysis.suggestedTags,
      relatedTasks: analysis.relatedTasks,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      sentiment: analysis.sentiment as 'positive' | 'neutral' | 'negative',
    };
  } catch (error) {
    console.error('Failed to analyze note:', error);
    throw new Error('メモの分析に失敗しました');
  }
} 