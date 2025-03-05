import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { AIProvider } from './types';

export type AIProviderType = 'gemini' | 'openai';

export class AIProviderManager {
  private static instance: AIProviderManager;
  private providers: Map<AIProviderType, AIProvider>;
  private activeProvider: AIProviderType = 'openai';

  private constructor() {
    this.providers = new Map();
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('openai', new OpenAIProvider());

    // 環境変数からAPIキーを取得して初期化を試みる
    this.initializeFromEnv();
  }

  private initializeFromEnv(): void {
    // Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        this.initializeProvider('gemini', geminiApiKey);
      } catch (error) {
        console.warn('Failed to initialize Gemini with env API key:', error);
      }
    }

    // OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      try {
        this.initializeProvider('openai', openaiApiKey);
      } catch (error) {
        console.warn('Failed to initialize OpenAI with env API key:', error);
      }
    }
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  initializeProvider(type: AIProviderType, apiKey: string): void {
    const provider = this.providers.get(type);
    if (provider) {
      // 環境変数のAPIキーが存在する場合は、それを優先
      const envApiKey = type === 'gemini' 
        ? process.env.GEMINI_API_KEY 
        : process.env.OPENAI_API_KEY;

      if (envApiKey) {
        provider.initialize(envApiKey);
      } else {
        provider.initialize(apiKey);
      }
      this.activeProvider = type;
    }
  }

  getActiveProvider(): AIProvider {
    const provider = this.providers.get(this.activeProvider);
    if (!provider || !provider.isEnabled) {
      throw new Error('有効なAIプロバイダーが設定されていません');
    }
    return provider;
  }

  setActiveProvider(type: AIProviderType): void {
    if (!this.providers.get(type)?.isEnabled) {
      throw new Error('指定されたプロバイダーは初期化されていません');
    }
    this.activeProvider = type;
  }

  getProviderInfo(type: AIProviderType): { name: string; description: string } | null {
    const provider = this.providers.get(type);
    if (!provider) return null;
    return {
      name: provider.name,
      description: provider.description,
    };
  }

  isProviderEnabled(type: AIProviderType): boolean {
    return this.providers.get(type)?.isEnabled ?? false;
  }
} 