import { GoogleGenerativeAI } from '@google/generative-ai';

import { GeminiProvider } from '@/lib/ai/gemini';
import { AITaskAnalysis } from '@/lib/ai/types/analysis';
import { AIProvider, AIRequestBase } from '@/lib/ai/types/provider';
import { AISettings, Priority } from '@/types/common';
import { BaseTaskOutput } from '@/types/task/base';
import { AITaskSuggestion } from '@/types/task/suggestion';

export class GeminiClient implements AIProvider {
  private static instance: GeminiClient;
  private provider: GeminiProvider;
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
    this.provider = new GeminiProvider();
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
    this.provider.initialize(apiKey);
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
    return this.provider.analyzeTask(input);
  }

  async suggestNextTask(tasks: BaseTaskOutput[]): Promise<AITaskSuggestion> {
    return this.provider.suggestNextTask(tasks);
  }

  async generateTags(input: AIRequestBase): Promise<string[]> {
    return this.provider.generateTags(input);
  }

  async classifyCategory(input: AIRequestBase): Promise<string> {
    return this.provider.classifyCategory(input);
  }

  async getTagSuggestions(
    title: string,
    content: string,
    existingTags: { id: string; name: string }[]
  ): Promise<string[]> {
    return this.provider.getTagSuggestions(title, content, existingTags);
  }

  async analyzePriority(title: string, content: string): Promise<Priority> {
    return this.provider.analyzePriority(title, content);
  }
} 