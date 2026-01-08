/**
 * Intelligent caching layer with LRU and Redis support
 */

import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  size: number;
}

/**
 * LRU Cache implementation for in-memory caching
 */
export class MemoryCache<T> {
  private cache: LRUCache<string, CacheEntry<T>>;
  private stats: CacheStats;

  constructor(
    maxSize: number = 1000,
    ttl: number = 3600000 // 1 hour in ms
  ) {
    this.cache = new LRUCache<string, CacheEntry<T>>({
      max: maxSize,
      ttl,
      updateAgeOnGet: true,
      dispose: () => {
        this.stats.evictions++;
      },
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      size: 0,
    };
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (entry) {
      entry.hits++;
      this.stats.hits++;
      return entry.value;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
    };
    
    this.cache.set(key, entry, { ttl });
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats, size: this.cache.size };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Redis cache implementation (optional)
 */
export class RedisCache<T> {
  private client: any; // Redis client
  private stats: CacheStats;
  private ttl: number;

  constructor(client: any, ttl: number = 3600) {
    this.client = client;
    this.ttl = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      size: 0,
    };
  }

  /**
   * Get value from Redis
   */
  async get(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value) as T;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in Redis
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl || this.ttl, serialized);
      this.stats.sets++;
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * Delete value from Redis
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Clear pattern from Redis
   */
  async clear(pattern: string = '*'): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
}

/**
 * Generate cache key from request
 */
export function generateCacheKey(data: unknown): string {
  const serialized = JSON.stringify(data);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Generate fingerprint for prompt template
 */
export function generatePromptFingerprint(
  template: string,
  variables: Record<string, string>
): string {
  const data = { template, variables };
  return generateCacheKey(data);
}

/**
 * Cache factory
 */
export function createCache<T>(
  type: 'memory' | 'redis' = 'memory',
  options?: {
    maxSize?: number;
    ttl?: number;
    redisClient?: any;
  }
): MemoryCache<T> | RedisCache<T> {
  if (type === 'redis' && options?.redisClient) {
    return new RedisCache<T>(options.redisClient, options?.ttl);
  }
  
  return new MemoryCache<T>(options?.maxSize, options?.ttl);
}
