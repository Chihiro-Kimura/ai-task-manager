import { TaskSummary } from './types';

interface CacheItem {
  summary: TaskSummary;
  timestamp: number;
  expiresAt: number;
}

const CACHE_EXPIRY = 1000 * 60 * 60; // 1時間

class SummaryCache {
  private cache: Map<string, CacheItem>;

  constructor() {
    this.cache = new Map();
  }

  private createCacheKey(title: string, content: string): string {
    return `${title}:${content}`;
  }

  get(title: string, content: string): TaskSummary | null {
    const key = this.createCacheKey(title, content);
    const item = this.cache.get(key);

    if (!item) return null;

    // キャッシュの有効期限をチェック
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.summary;
  }

  set(title: string, content: string, summary: TaskSummary): void {
    const key = this.createCacheKey(title, content);
    const now = Date.now();

    this.cache.set(key, {
      summary,
      timestamp: now,
      expiresAt: now + CACHE_EXPIRY,
    });

    // 古いキャッシュをクリーンアップ
    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const summaryCache = new SummaryCache();
