import { GoogleGenerativeAI } from '@google/generative-ai';

import { AITaskAnalysis } from '@/lib/ai/types/analysis';
import { AIError } from '@/lib/ai/types/errors';
import { AIProvider, AIRequestBase } from '@/lib/ai/types/provider';
import { AISettings , Priority } from '@/types/common';
import { BaseTaskOutput } from '@/types/task/base';
import { AITaskSuggestion } from '@/types/task/suggestion';

export class GeminiClient implements AIProvider {
  private static instance: GeminiClient;
  private client: GoogleGenerativeAI | null = null;
  private settings: AISettings = {
    provider: 'gemini',
    isEnabled: true,
    useAI: true,
    model: 'gemini-pro',
    temperature: 0.7,
    maxOutputTokens: 1024,
  };

  name = 'Gemini';
  description = 'Google提供の高性能なAIモデル';
  isEnabled = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedSettings = localStorage.getItem('ai-settings');
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed.state?.settings?.useAI !== undefined) {
            this.settings.useAI = parsed.state.settings.useAI;
          }
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }
  }

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  initialize(apiKey: string): void {
    this.client = new GoogleGenerativeAI(apiKey);
    this.settings = {
      ...this.settings,
      apiKey,
      isEnabled: true,
      useAI: true,
      provider: 'gemini',
    };
    this.isEnabled = true;

    this.persistSettings();
    console.log('GeminiClient initialized with settings:', this.settings);
  }

  private persistSettings(): void {
    if (typeof window !== 'undefined') {
      try {
        const aiSettings = {
          state: {
            settings: {
              useAI: this.settings.useAI
            }
          }
        };
        localStorage.setItem('ai-settings', JSON.stringify(aiSettings));
      } catch (error) {
        console.error('Failed to persist settings:', error);
      }
    }
  }

  getClient(): GoogleGenerativeAI {
    if (!this.client) {
      throw new Error('Gemini client is not initialized');
    }
    return this.client;
  }

  getSettings(): AISettings {
    return this.settings;
  }

  setUseAI(useAI: boolean): void {
    this.settings.useAI = useAI;
    this.persistSettings();
  }

  isAIAvailable(): boolean {
    return this.settings.isEnabled && this.settings.useAI;
  }

  async analyzeTask(input: AIRequestBase): Promise<AITaskAnalysis> {
    if (!this.settings.apiKey) {
      throw new Error('APIキーが設定されていません');
    }

    const response = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
      },
      body: JSON.stringify({
        ...input,
        engine: this.settings.provider,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const error = result as AIError;
      throw new Error(error.message);
    }

    return result;
  }

  async suggestNextTask(_tasks: BaseTaskOutput[]): Promise<AITaskSuggestion> {
    throw new Error('Method not implemented.');
  }

  async generateTags(_input: AIRequestBase): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  async classifyCategory(_input: AIRequestBase): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async getTagSuggestions(
    _title: string,
    _content: string,
    _existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  async analyzePriority(_title: string, _content: string): Promise<Priority> {
    throw new Error('Method not implemented.');
  }
} 