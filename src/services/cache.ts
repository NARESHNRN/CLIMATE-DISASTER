/**
 * In-memory API Response Cache with TTL (Time-To-Live).
 * Caches by endpoint + location + optional parameters.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttlMs: number;
}

class InMemoryCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  public clear(): void {
    this.store.clear();
  }

  public buildKey(endpoint: string, location?: string, extraParams?: Record<string, unknown>): string {
    const loc = (location || 'global').toLowerCase().trim();
    const params = extraParams ? JSON.stringify(extraParams) : '';
    return `${endpoint}:${loc}:${params}`;
  }
}

export const apiCache = new InMemoryCache();
