import { pipeline } from '@xenova/transformers';

import { AIProvider, Priority } from './types';

class TransformersProvider implements AIProvider {
  name = 'Transformers';
  description = 'ローカルで動作する軽量な日本語AIモデル';
  isEnabled = true;
  requiresApiKey = false;

  private async getClassifier() {
    return await pipeline(
      'zero-shot-classification',
      'cl-tohoku/bert-base-japanese-v3'
    );
  }

  async getTagSuggestions(
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    try {
      const classifier = await this.getClassifier();
      const combinedText = `${title}\n${content}`;

      // 既存のタグから候補を生成
      const candidateLabels = existingTags.map((tag) => tag.name);

      // 一般的なタグカテゴリを追加
      const defaultCategories = [
        '仕事',
        '個人',
        '買い物',
        '予定',
        'アイデア',
        'タスク',
      ];
      candidateLabels.push(...defaultCategories);

      const result = await classifier(combinedText, {
        candidate_labels: candidateLabels,
        multi_label: true,
      });

      // スコアの高い順に上位3つのタグを返す
      return result.labels
        .slice(0, 3)
        .filter((label) => !existingTags.some((tag) => tag.name === label));
    } catch (error) {
      console.error('Failed to suggest tags with Transformers:', error);
      return [];
    }
  }

  async analyzePriority(title: string, content: string): Promise<Priority> {
    try {
      const classifier = await this.getClassifier();
      const combinedText = `${title}\n${content}`;

      const result = await classifier(combinedText, {
        candidate_labels: ['高', '中', '低'],
      });

      return result.labels[0] as Priority;
    } catch (error) {
      console.error('Failed to analyze priority with Transformers:', error);
      return '中';
    }
  }
}

export const transformersProvider = new TransformersProvider();
