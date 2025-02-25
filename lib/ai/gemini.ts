import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task } from '@prisma/client';

import {
  AIProvider,
  TaskSummary,
  TaskClassification,
  NextTaskSuggestion,
  Priority,
  AIError,
  AIErrorType,
} from './types';

const TIMEOUT_MS = 30000; // 30秒タイムアウト

function createAIError(
  type: AIErrorType,
  message: string,
  originalError?: unknown
): AIError {
  return {
    type,
    message,
    originalError,
  };
}

export class GeminiProvider implements AIProvider {
  name = 'Gemini AI';
  description = 'Googleが提供する高性能なAIモデル';
  private genAI: GoogleGenerativeAI | null = null;
  isEnabled = false;

  initialize(apiKey: string): void {
    if (!apiKey) {
      throw createAIError(
        'API_KEY_NOT_SET',
        'Gemini APIキーが設定されていません。設定画面からAPIキーを設定してください。'
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.isEnabled = true;
  }

  private async generateResponse(prompt: string): Promise<string> {
    if (!this.genAI || !this.isEnabled) {
      throw createAIError(
        'API_KEY_NOT_SET',
        'Gemini APIが初期化されていません。設定画面からAPIキーを設定してください。'
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
      );
      const resultPromise = model.generateContent(prompt);

      const result = await Promise.race([resultPromise, timeoutPromise]);
      if (result instanceof Error) {
        throw result;
      }

      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Request timeout') {
          throw createAIError(
            'TIMEOUT',
            'リクエストがタイムアウトしました。しばらく時間をおいて再度お試しください。'
          );
        }
        // レート制限エラーの判定（実際のGemini APIのエラーレスポンスに応じて調整が必要）
        if (
          error.message.includes('quota') ||
          error.message.includes('rate limit')
        ) {
          throw createAIError(
            'RATE_LIMIT_EXCEEDED',
            'APIの利用制限に達しました。しばらく時間をおいて再度お試しください。',
            error
          );
        }
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        'AIの処理中にエラーが発生しました。',
        error
      );
    }
  }

  async getTagSuggestions(
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    try {
      const existingTagNames = existingTags.map((tag) => tag.name).join(', ');
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

回答は以下のようにカンマ区切りで返してください:
タグ1, タグ2, タグ3
`;

      const response = await this.generateResponse(prompt);
      const tags = response.split(',').map((tag) => tag.trim());

      if (tags.length === 0) {
        throw createAIError(
          'INVALID_RESPONSE',
          'タグの提案を生成できませんでした。'
        );
      }

      return tags;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        'タグの提案生成中にエラーが発生しました。',
        error
      );
    }
  }

  async analyzePriority(title: string, content: string): Promise<Priority> {
    try {
      const prompt = `
以下のタスクの優先度を「高」「中」「低」のいずれかで評価してください。

タイトル: ${title}
内容: ${content}

評価基準:
- 緊急性（期限、締切の有無）
- 重要性（影響範囲、ビジネスインパクト）
- 依存関係（他のタスクとの関連性）
- 工数（作業量、複雑さ）

回答は「高」「中」「低」のいずれかのみを返してください。
`;

      const response = await this.generateResponse(prompt);
      const priority = response.trim() as Priority;

      if (!['高', '中', '低'].includes(priority)) {
        throw createAIError(
          'INVALID_RESPONSE',
          '優先度の分析結果が不正です。デフォルト値の「中」を使用します。'
        );
      }

      return priority;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        '優先度の分析中にエラーが発生しました。',
        error
      );
    }
  }

  async summarizeTask(title: string, content: string): Promise<TaskSummary> {
    try {
      const prompt = `
以下のタスクの要約を生成し、重要なキーワードを抽出してください。

タイトル: ${title}
内容: ${content}

以下の形式でJSON形式で返してください:
{
  "summary": "100文字程度の要約文（重要なポイントを簡潔に）",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"]（5つまで）
}

要約の条件:
- 重要なポイントを漏らさない
- 具体的な数値や期限は保持する
- 簡潔で分かりやすい日本語
- 箇条書きは文章化する
`;

      const response = await this.generateResponse(prompt);
      let result: TaskSummary;

      try {
        result = JSON.parse(response);
      } catch {
        throw createAIError(
          'INVALID_RESPONSE',
          '要約の生成結果が不正なJSON形式です。'
        );
      }

      if (!result.summary || !Array.isArray(result.keywords)) {
        throw createAIError(
          'INVALID_RESPONSE',
          '要約の生成結果が不正な形式です。'
        );
      }

      return result;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        '要約の生成中にエラーが発生しました。',
        error
      );
    }
  }

  async classifyTask(
    title: string,
    content: string
  ): Promise<TaskClassification> {
    try {
      const prompt = `
以下のタスクを「今すぐ」「次に」「いつか」のいずれかに分類してください。

タイトル: ${title}
内容: ${content}

分類基準:
- 今すぐ: 緊急性が高く、すぐに着手すべきタスク（24時間以内に着手）
- 次に: 重要だが即時性はないタスク（1週間以内に着手）
- いつか: 優先度が低く、余裕があるときに実施するタスク

以下の形式でJSON形式で返してください:
{
  "category": "分類結果",
  "confidence": 0.0から1.0の確信度（小数点第2位まで）
}

注意事項:
- 期限や締切が明示されている場合は優先的に考慮
- タスクの依存関係も考慮
- プロジェクトの重要度も加味
`;

      const response = await this.generateResponse(prompt);
      let result: TaskClassification;

      try {
        result = JSON.parse(response);
      } catch {
        throw createAIError(
          'INVALID_RESPONSE',
          'タスクの分類結果が不正なJSON形式です。'
        );
      }

      if (
        !['今すぐ', '次に', 'いつか'].includes(result.category) ||
        typeof result.confidence !== 'number' ||
        result.confidence < 0 ||
        result.confidence > 1
      ) {
        throw createAIError(
          'INVALID_RESPONSE',
          'タスクの分類結果が不正な形式です。'
        );
      }

      return result;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        'タスクの分類中にエラーが発生しました。',
        error
      );
    }
  }

  async suggestNextTask(tasks: Task[]): Promise<NextTaskSuggestion> {
    try {
      const tasksDescription = tasks
        .map(
          (task) =>
            `- タイトル: ${task.title}\n  説明: ${
              task.description || '説明なし'
            }\n  優先度: ${task.priority || '未設定'}\n  ステータス: ${
              task.status
            }`
        )
        .join('\n');

      const prompt = `
現在のタスクリストを分析し、次に取り組むべきタスクを提案してください。

現在のタスク:
${tasksDescription}

以下の形式でJSON形式で返してください:
{
  "title": "タスクのタイトル（50文字以内）",
  "description": "タスクの説明（具体的なアクションを含む）",
  "priority": "高" | "中" | "低"
}

提案の条件:
- 現在のタスクの依存関係を考慮
- 具体的で実行可能なタスク
- プロジェクトの目標に沿った提案
- 既存のタスクと重複しない
`;

      const response = await this.generateResponse(prompt);
      let result: NextTaskSuggestion;

      try {
        result = JSON.parse(response);
      } catch {
        throw createAIError(
          'INVALID_RESPONSE',
          '次のタスクの提案結果が不正なJSON形式です。'
        );
      }

      if (
        !result.title ||
        !result.description ||
        !['高', '中', '低'].includes(result.priority)
      ) {
        throw createAIError(
          'INVALID_RESPONSE',
          '次のタスクの提案結果が不正な形式です。'
        );
      }

      return result;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        '次のタスクの提案中にエラーが発生しました。',
        error
      );
    }
  }

  async createTaskFromText(text: string): Promise<{
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
  }> {
    try {
      const prompt = `
以下のテキストからタスクを作成してください。

テキスト:
${text}

以下の形式でJSON形式で返してください:
{
  "title": "タスクのタイトル（50文字以内）",
  "description": "タスクの説明（具体的な内容、期限、条件などを含む）",
  "priority": "高" | "中" | "低",
  "tags": ["タグ1", "タグ2", "タグ3"]（5つまで）
}

生成の条件:
- タイトルは簡潔で分かりやすく
- 説明は具体的なアクションを含む
- 優先度は文脈から判断
- タグは内容を適切に表現
- 期限や条件が含まれている場合は保持
`;

      const response = await this.generateResponse(prompt);
      let result: {
        title: string;
        description: string;
        priority: Priority;
        tags: string[];
      };

      try {
        result = JSON.parse(response);
      } catch {
        throw createAIError(
          'INVALID_RESPONSE',
          'タスクの生成結果が不正なJSON形式です。'
        );
      }

      if (
        !result.title ||
        !result.description ||
        !['高', '中', '低'].includes(result.priority) ||
        !Array.isArray(result.tags)
      ) {
        throw createAIError(
          'INVALID_RESPONSE',
          'タスクの生成結果が不正な形式です。'
        );
      }

      return result;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError(
        'UNKNOWN_ERROR',
        'テキストからのタスク生成中にエラーが発生しました。',
        error
      );
    }
  }
}

export const geminiProvider = new GeminiProvider();
