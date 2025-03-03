import { GoogleGenerativeAI } from '@google/generative-ai';

import { AISettings, AIRequestBase, APIError, AITaskAnalysis } from './types';

export class GeminiClient {
  private static instance: GeminiClient;
  private client: GoogleGenerativeAI | null = null;
  private settings: AISettings = {
    provider: 'gemini',
    isEnabled: false,
  };

  private constructor() {}

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
    };
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

  async generateSummary(data: AIRequestBase): Promise<AITaskAnalysis> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.settings.apiKey) {
      headers['x-api-key'] = this.settings.apiKey;
    }

    const response = await fetch('/api/ai/summary', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...data,
        engine: this.settings.provider,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const error = result as APIError;
      throw new Error(error.details || error.error);
    }

    return result;
  }
} 