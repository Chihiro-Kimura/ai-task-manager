import OpenAI from 'openai';

import { Priority } from '@/types/common';

import { AIProvider, AIError, AIRequestBase, AITaskAnalysis, AITaskSuggestion, TaskOutput } from './types';

function createAIError(
  type: AIError['type'],
  message: string,
  originalError?: unknown
): AIError {
  return {
    type,
    message,
    originalError,
  };
}

export class OpenAIProvider implements AIProvider {
  name = 'ChatGPT';
  description = 'OpenAIが提供する高性能なAIモデル（GPT-3.5-turbo）';
  private client: OpenAI | null = null;
  isEnabled = false;

  initialize(apiKey: string): void {
    if (!apiKey) {
      throw createAIError('API_KEY_NOT_SET', 'OpenAI APIキーが設定されていません');
    }
    this.client = new OpenAI({ apiKey });
    this.isEnabled = true;
  }

  private async generateResponse(prompt: string): Promise<string> {
    if (!this.client || !this.isEnabled) {
      throw createAIError('API_KEY_NOT_SET', 'OpenAI APIが初期化されていません');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof Error && error.message.includes('429')) {
        throw createAIError(
          'RATE_LIMIT_EXCEEDED',
          'APIの利用制限に達しました。しばらく時間をおいて再度お試しください。'
        );
      }
      throw createAIError('UNKNOWN_ERROR', 'AIの処理中にエラーが発生しました。', error);
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
        return '中'; // デフォルト値
      }

      return priority;
    } catch (error) {
      if ((error as AIError).type) {
        throw error;
      }
      throw createAIError('UNKNOWN_ERROR', '優先度の分析中にエラーが発生しました。', error);
    }
  }

  async analyzeTask(_input: AIRequestBase): Promise<AITaskAnalysis> {
    throw new Error('未実装');
  }

  async suggestNextTask(_tasks: TaskOutput[]): Promise<AITaskSuggestion> {
    throw new Error('未実装');
  }

  async generateTags(_input: AIRequestBase): Promise<string[]> {
    throw new Error('未実装');
  }

  async classifyCategory(_input: AIRequestBase): Promise<string> {
    throw new Error('未実装');
  }

  async getTagSuggestions(
    _title: string,
    _content: string,
    _existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    throw new Error('未実装');
  }
} 