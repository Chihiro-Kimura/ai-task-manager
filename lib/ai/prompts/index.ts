import {
  PromptTemplate,
  SummaryOutput,
  TagsOutput,
  ClassifyOutput,
  PriorityOutput,
  NextTaskOutput,
  AIPromptOutputMap
} from './types';

export const AI_PROMPTS: {
  [K in keyof AIPromptOutputMap]: PromptTemplate<AIPromptOutputMap[K]>;
} = {
  summary: {
    prompt: `
以下のタスクの内容を3行程度で簡潔に要約してください。
重要なポイントを漏らさず、具体的にまとめてください。

タイトル：{{title}}
内容：{{content}}

出力形式：
{
  "summary": "要約文"
}`,
    outputFormat: {} as SummaryOutput,
  },
  
  tags: {
    prompt: `
以下のタスクの内容から、適切なタグを提案してください。
タグは1つ以上、5つ以下で提案してください。

タイトル: {{title}}
内容: {{content}}
既存のタグ: {{existingTags}}

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
- カラーコードは見やすい色を選んでください`,
    outputFormat: {} as TagsOutput,
  },

  classify: {
    prompt: `
以下のタスクを最適なカテゴリーに分類してください。

タイトル: {{title}}
内容: {{content}}

カテゴリーの説明:
- inbox: 未整理のタスク。まだ優先度や実行時期が決まっていないもの
- doing: 現在進行中または今すぐ着手すべきタスク
- todo: 次に実行予定のタスク。優先度は決まっているが、今すぐには着手しないもの

出力形式：
{
  "category": "inbox" または "doing" または "todo",
  "confidence": 分類の確信度（0.0から1.0の数値）,
  "reason": "このカテゴリーに分類した理由の説明"
}

注意：
- タスクの緊急性、重要性、依存関係を考慮してください
- 確信度は分類の確実性を表す数値で、1.0が最も確実です
- 理由は具体的に説明してください`,
    outputFormat: {} as ClassifyOutput,
  },

  priority: {
    prompt: `
以下のタスクの内容から、優先度を判断してください。
優先度は「高」「中」「低」の3段階で評価してください。

タイトル: {{title}}
内容: {{content}}

以下の基準で判断してください：
- 緊急性（期限や時間的制約）
- 重要性（影響範囲や結果の重大さ）
- 依存関係（他のタスクとの関連性）
- 工数（作業量、複雑さ）

出力形式：
{
  "priority": "高" または "中" または "低"
}`,
    outputFormat: {} as PriorityOutput,
  },

  suggest: {
    prompt: `
以下の既存のタスクリストを分析し、次に取り組むべきタスクを提案してください。
既存のタスクの内容や優先度、依存関係を考慮して提案してください。

既存のタスク：
{{tasksText}}

出力形式：
{
  "nextTask": {
    "title": "タスクのタイトル",
    "description": "タスクの詳細な説明",
    "priority": "高" または "中" または "低",
    "estimatedDuration": "予想所要時間（例：30分、2時間）",
    "dependencies": ["依存するタスクのタイトル"]
  }
}

注意：
- タスクは具体的で実行可能な内容にしてください
- 優先度は既存のタスクとの関連性を考慮して設定してください
- 予想所要時間は現実的な見積もりにしてください
- 依存関係は既存のタスクの中から選んでください`,
    outputFormat: {} as NextTaskOutput,
  }
} as const;

export * from './types'; 