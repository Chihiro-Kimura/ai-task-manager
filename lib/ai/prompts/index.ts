import {
  PromptTemplate,
  AIPromptOutputMap
} from '@/types/ai';

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
    outputFormat: {} as AIPromptOutputMap['summary'],
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
    "タグ名1",
    "タグ名2",
    "タグ名3"
  ]
}

注意：
- タグは5つ以内にしてください
- タグは短く、具体的にしてください
- タグは日本語で出力してください
- 既存のタグを優先的に使用してください`,
    outputFormat: {} as AIPromptOutputMap['tags'],
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
    outputFormat: {} as AIPromptOutputMap['classify'],
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
    outputFormat: {} as AIPromptOutputMap['priority'],
  },

  suggest: {
    prompt: `
対象となる現在のタスクについて、次のステップとなるタスクを提案してください。

■ 対象タスク（このタスクの次のステップを提案してください）：
タイトル: {{title}}
説明: {{content}}

■ 既存タスク一覧（重複を避けるための参照用）：
{{tasksText}}

■ タスク提案の手順：
1. 対象タスクの目的を理解
   - タイトルと説明から主要な目的を特定
   - 必要な技術スタックや実装範囲を確認

2. 次のステップを検討
   - 対象タスクの直接的な続きとなる作業を特定
   - 具体的で実行可能な粒度に分割
   - 30分〜2時間で完了できる規模に調整

3. 重複チェック
   - 既存タスク一覧と照合
   - 類似の作業や目的を持つタスクがないか確認
   - 重複が見つかった場合は、異なる視点や範囲で再検討

■ 出力形式：
{
  "nextTask": {
    "title": "具体的な動詞から始まるタイトル",
    "description": "3行以内の簡潔な説明",
    "priority": "高" または "中" または "低",
    "estimatedDuration": "30分" または "1時間" または "2時間",
    "dependencies": ["依存する既存タスクのタイトル"]
  }
}

■ 例（認証システムのリファクタリングの場合）：
適切な提案：
{
  "nextTask": {
    "title": "JWT認証の設定ファイル作成",
    "description": "NextAuth.jsの設定ファイルを作成し、JWTの有効期限、暗号化キー、セッション管理の設定を行う。",
    "priority": "高",
    "estimatedDuration": "1時間",
    "dependencies": ["認証システムのリファクタリング"]
  }
}

■ 重要な制約：
1. 必ず対象タスクの内容に関連する提案をすること
2. 既存タスクとの重複を避けること
3. 具体的な作業内容を提案すること
4. 実行可能な粒度に分割すること
`,
    outputFormat: {} as AIPromptOutputMap['suggest'],
  }
} as const; 