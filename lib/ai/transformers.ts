import { pipeline, Pipeline } from '@xenova/transformers';

import {
  AIProvider,
  TaskSummary,
  TaskClassification,
  NextTaskSuggestion,
  Priority,
  AIError,
} from './types';

type ModelType =
  | 'sentiment'
  | 'summarization'
  | 'classification'
  | 'suggestion'
  | 'taskCreation';

interface Classifiers {
  sentiment?: Pipeline;
  summarization?: Pipeline;
  classification?: Pipeline;
  suggestion?: Pipeline;
  taskCreation?: Pipeline;
}

async function callPythonApi(
  endpoint: string,
  data: Record<string, unknown>
): Promise<any> {
  const response = await fetch(`/api/python/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'エラーが発生しました');
  }

  return response.json();
}

export class TransformersProvider implements AIProvider {
  name = 'Hugging Face Transformers';
  description = 'ローカルで実行される無料のAIモデル';
  isEnabled = true;
  requiresApiKey = false;

  private classifiers: Classifiers = {};

  initialize(): void {
    // ローカルモデルのため初期化は不要
  }

  private async getClassifier(type: ModelType): Promise<Pipeline> {
    if (!this.classifiers[type]) {
      switch (type) {
        case 'summarization':
          this.classifiers[type] = await pipeline(
            'summarization',
            'Xenova/distilbart-cnn-12-6'
          );
          break;
        case 'classification':
          this.classifiers[type] = await pipeline(
            'text-classification',
            'Xenova/distilbert-base-uncased'
          );
          break;
        case 'suggestion':
          this.classifiers[type] = await pipeline(
            'text2text-generation',
            'Xenova/bart-base'
          );
          break;
        case 'taskCreation':
          this.classifiers[type] = await pipeline(
            'text2text-generation',
            'Xenova/flan-t5-small'
          );
          break;
        default:
          this.classifiers[type] = await pipeline(
            'sentiment-analysis',
            'Xenova/sentiment-multilingual'
          );
      }
    }
    return this.classifiers[type]!;
  }

  async getTagSuggestions(
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    try {
      const result = await callPythonApi('tag_suggester', {
        title,
        content,
        existingTags: existingTags.map((tag) => tag.name),
      });

      if (!Array.isArray(result.tags)) {
        throw new Error('Invalid response format from tag suggester');
      }

      return result.tags;
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: 'タグの提案生成中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }

  async analyzePriority(title: string, content: string): Promise<Priority> {
    try {
      const result = await callPythonApi('priority_analyzer', {
        title,
        content,
      });

      if (!['高', '中', '低'].includes(result.priority)) {
        throw new Error('Invalid priority value');
      }

      return result.priority as Priority;
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: '優先度の分析中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }

  async summarizeTask(title: string, content: string): Promise<TaskSummary> {
    try {
      const result = await callPythonApi('summarizer', {
        title,
        content,
      });

      if (!result.summary || !Array.isArray(result.keywords)) {
        throw new Error('Invalid summary format');
      }

      return {
        summary: result.summary,
        keywords: result.keywords,
      };
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: '要約の生成中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }

  async classifyTask(
    title: string,
    content: string
  ): Promise<TaskClassification> {
    try {
      const result = await callPythonApi('task_classifier', {
        title,
        content,
      });

      if (
        !['今すぐ', '次に', 'いつか'].includes(result.category) ||
        typeof result.confidence !== 'number' ||
        result.confidence < 0 ||
        result.confidence > 1
      ) {
        throw new Error('Invalid classification format');
      }

      return {
        category: result.category,
        confidence: result.confidence,
      };
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: 'タスクの分類中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }

  async suggestNextTask(
    tasks: {
      title: string;
      description?: string;
      priority?: Priority;
      status: string;
    }[]
  ): Promise<NextTaskSuggestion> {
    try {
      const result = await callPythonApi('task_suggester', {
        tasks: tasks.map((task) => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
        })),
      });

      if (
        !result.title ||
        !result.description ||
        !['高', '中', '低'].includes(result.priority)
      ) {
        throw new Error('Invalid task suggestion format');
      }

      return {
        title: result.title,
        description: result.description,
        priority: result.priority as Priority,
      };
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: '次のタスクの提案中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }

  async createTaskFromText(text: string): Promise<{
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
  }> {
    try {
      const result = await callPythonApi('task_creator', {
        text,
      });

      if (
        !result.title ||
        !result.description ||
        !['高', '中', '低'].includes(result.priority) ||
        !Array.isArray(result.tags)
      ) {
        throw new Error('Invalid task creation format');
      }

      return {
        title: result.title,
        description: result.description,
        priority: result.priority as Priority,
        tags: result.tags,
      };
    } catch (error) {
      throw {
        type: 'UNKNOWN_ERROR',
        message: 'テキストからのタスク生成中にエラーが発生しました。',
        originalError: error,
      } as AIError;
    }
  }
}

// TransformersProviderのインスタンスをエクスポート
export const transformersProvider = new TransformersProvider();
