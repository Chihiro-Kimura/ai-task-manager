import { GeminiClient } from './gemini/client';
import { AIProvider } from './types/provider';

export type AIProviderType = 'gemini';

export class AIProviderManager {
  private static instance: AIProviderManager;
  private providers: Map<AIProviderType, AIProvider>;
  private activeProvider: AIProviderType = 'gemini';

  private constructor() {
    this.providers = new Map();
    this.providers.set('gemini', GeminiClient.getInstance());
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  async initializeProviders(): Promise<void> {
    // Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        this.initializeProvider('gemini', geminiApiKey);
      } catch (error) {
        console.warn('Failed to initialize Gemini with env API key:', error);
      }
    }
  }

  initializeProvider(type: AIProviderType, apiKey: string): void {
    const provider = this.providers.get(type);
    if (provider) {
      provider.initialize(apiKey);
      this.activeProvider = type;
    }
  }

  getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }

  getActiveProvider(): AIProvider | undefined {
    return this.providers.get(this.activeProvider);
  }

  getProviderInfo(type: AIProviderType): { name: string; description: string } | undefined {
    const provider = this.providers.get(type);
    if (provider) {
      return {
        name: provider.name,
        description: provider.description,
      };
    }
    return undefined;
  }

  getApiKey(type: AIProviderType): string | undefined {
    return type === 'gemini'
      ? process.env.GEMINI_API_KEY
      : undefined;
  }
} 