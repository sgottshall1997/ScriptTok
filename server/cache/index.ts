import fs from 'fs/promises';
import path from 'path';
import { getCacheConfig, isDevelopment } from '../env.js';

// Cache interface for consistent API across implementations
interface CacheInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
}

// Cache entry structure for file-based cache
interface CacheEntry {
  data: string;
  expires: number;
  created: number;
}

/**
 * File-based cache implementation for development and fallback
 */
class FileCache implements CacheInterface {
  private cacheDir: string;
  private defaultTTL: number;

  constructor(cacheDir = '.cache', defaultTTL = 3600) {
    this.cacheDir = path.resolve(cacheDir);
    this.defaultTTL = defaultTTL;
    this.ensureCacheDir();
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  async get(key: string): Promise<string | null> {
    try {
      const filePath = this.getFilePath(key);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(fileContent);
      
      // Check if entry has expired
      if (Date.now() > entry.expires) {
        await this.del(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      // File doesn't exist or other error
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = this.defaultTTL): Promise<void> {
    try {
      await this.ensureCacheDir();
      const filePath = this.getFilePath(key);
      const entry: CacheEntry = {
        data: value,
        expires: Date.now() + (ttlSeconds * 1000),
        created: Date.now()
      };
      
      await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8');
    } catch (error) {
      console.error('Failed to write cache entry:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const deletePromises = files
        .filter(file => file.endsWith('.json'))
        .map(file => fs.unlink(path.join(this.cacheDir, file)));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.cacheDir);
      let keys = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', '').replace(/_/g, ':'));
      
      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        keys = keys.filter(key => regex.test(key));
      }
      
      return keys;
    } catch (error) {
      return [];
    }
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.cacheDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(content);
          
          if (now > entry.expires) {
            await fs.unlink(filePath);
          }
        } catch (error) {
          // Skip problematic files
        }
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }
}

/**
 * Redis cache implementation for production
 */
class RedisCache implements CacheInterface {
  private client: any = null;
  private defaultTTL: number;
  private isConnected = false;

  constructor(redisUrl: string, defaultTTL = 3600) {
    this.defaultTTL = defaultTTL;
    this.initializeRedis(redisUrl);
  }

  private async initializeRedis(redisUrl: string): Promise<void> {
    try {
      // Note: Redis client would be initialized here in a real implementation
      // For now, we'll simulate with a warning
      console.warn('Redis implementation placeholder - would connect to:', redisUrl);
      this.isConnected = false; // Set to true when real Redis is implemented
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    
    try {
      // Redis implementation would go here
      return null;
    } catch (error) {
      console.error('Redis get failed:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = this.defaultTTL): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      // Redis implementation would go here
    } catch (error) {
      console.error('Redis set failed:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      // Redis implementation would go here
    } catch (error) {
      console.error('Redis del failed:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      // Redis implementation would go here
      return false;
    } catch (error) {
      console.error('Redis has failed:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      // Redis implementation would go here
    } catch (error) {
      console.error('Redis clear failed:', error);
    }
  }

  async keys(pattern = '*'): Promise<string[]> {
    if (!this.isConnected) return [];
    
    try {
      // Redis implementation would go here
      return [];
    } catch (error) {
      console.error('Redis keys failed:', error);
      return [];
    }
  }
}

/**
 * Unified cache manager that chooses implementation based on configuration
 */
class CacheManager {
  private cache: CacheInterface;
  private config: ReturnType<typeof getCacheConfig>;

  constructor() {
    this.config = getCacheConfig();
    
    if (this.config.useRedis && this.config.redisUrl) {
      console.log('🔄 Initializing Redis cache...');
      this.cache = new RedisCache(this.config.redisUrl);
    } else {
      console.log('📁 Using file-based cache for development');
      this.cache = new FileCache();
    }
  }

  /**
   * Generic cache getter with JSON parsing
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.cache.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Generic cache setter with JSON serialization
   */
  async set<T = any>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.cache.set(key, data, ttlSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  async del(key: string): Promise<void> {
    return this.cache.del(key);
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    return this.cache.clear();
  }

  /**
   * Get cache keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    return this.cache.keys(pattern);
  }

  /**
   * Cache wrapper for functions with automatic key generation
   */
  async wrap<T>(
    keyPrefix: string,
    keyParams: Record<string, any>,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const key = this.generateKey(keyPrefix, keyParams);
    
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch data and cache it
    const data = await fetchFn();
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  /**
   * Generate consistent cache keys
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Cleanup expired entries (file cache only)
   */
  async cleanup(): Promise<void> {
    if (this.cache instanceof FileCache) {
      await this.cache.cleanup();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    type: string;
    keyCount: number;
    isHealthy: boolean;
  }> {
    try {
      const keys = await this.keys();
      return {
        type: this.config.useRedis ? 'redis' : 'file',
        keyCount: keys.length,
        isHealthy: true
      };
    } catch (error) {
      return {
        type: this.config.useRedis ? 'redis' : 'file',
        keyCount: 0,
        isHealthy: false
      };
    }
  }
}

// Singleton cache manager instance
let cacheManager: CacheManager | null = null;

/**
 * Get the global cache manager instance
 */
export function getCache(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager();
  }
  return cacheManager;
}

// Cache TTL constants for different types of data
export const CACHE_TTL = {
  AMAZON_SEARCH: 1800,      // 30 minutes for search results
  AMAZON_PRODUCT: 3600,     // 1 hour for product details
  TRENDING_TOPICS: 14400,   // 4 hours for trending topics
  BROWSE_NODES: 86400,      // 24 hours for category data
  USER_PREFERENCES: 3600    // 1 hour for user settings
} as const;

// Cache key prefixes for organization
export const CACHE_KEYS = {
  AMAZON_SEARCH: 'amazon:search',
  AMAZON_PRODUCT: 'amazon:product',
  AMAZON_BROWSE: 'amazon:browse',
  TRENDING: 'trends',
  USER_PREFS: 'user:prefs'
} as const;

// Start cleanup interval for file cache in development
if (isDevelopment()) {
  setInterval(() => {
    getCache().cleanup().catch(console.error);
  }, 3600000); // Cleanup every hour
}

export type { CacheInterface };