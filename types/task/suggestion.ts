import { Priority } from '../common';

/**
 * AIによるタスク提案の型
 */
export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
  estimatedDuration?: string;
  dependencies?: string[];
}

/**
 * タスク提案のレスポンス型
 */
export interface TaskSuggestionResponse {
  nextTask: AITaskSuggestion;
} 