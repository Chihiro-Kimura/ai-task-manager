/**
 * 有効なカテゴリーの定義
 */
export const VALID_CATEGORIES = ['inbox', 'doing', 'todo'] as const;

/**
 * カテゴリーの型
 */
export type Category = typeof VALID_CATEGORIES[number];

/**
 * カテゴリー分類の結果型
 */
export interface CategoryClassification {
  category: Category;
  confidence: number;
  reason: string;
} 