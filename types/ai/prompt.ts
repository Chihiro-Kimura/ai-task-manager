/**
 * プロンプトテンプレートの基本型
 */
export interface PromptTemplate<T = unknown> {
  prompt: string;
  outputFormat: T;
}

/**
 * プロンプトのキー型
 */
export type AIPromptKey = 'summary' | 'tags' | 'classify' | 'priority' | 'suggest'; 