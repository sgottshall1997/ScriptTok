import fs from 'fs/promises';
import path from 'path';
import { getEnv } from '../env';

/**
 * Universal cache implementation
 * Uses Redis if REDIS_URL is available, otherwise falls back to JSON file cache
 * TTL support with automatic cleanup of expired entries
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  cleanupInterval?: number; // How often to clean expired entries (ms)
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ICache {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  cleanup(): Promise<void>;
}

class FileCache implements ICache {
  private cacheDir: string;
  private defaultTtl: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.cacheDir = path.join(process.cwd(), 'server', '.cache');
    this.defaultTtl = config.ttl;
    
    // Ensure cache directory exists
    this.ensureCacheDir();
    
    // Start periodic cleanup
    if (config.cleanupInterval) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup().catch(console.error);
      }, config.cleanupInterval);
    }
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('❌ Failed to create cache directory:', error);
    }
  }

  private getFilePath(key: string): string {
    // Sanitize key for filesystem
    const sanitized = key.replace(/[^a-zA-Z0-9\-_]/g, '_');
    return path.join(this.cacheDir, `${sanitized}.json`);
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const filePath = this.getFilePath(key);
      const content = await fs.readFile(filePath, 'utf8');
      const entry: CacheEntry<T> = JSON.parse(content);
      
      // Check if expired
      const now = Date.now();
      if (now > entry.timestamp + entry.ttl) {
        await this.delete(key); // Clean up expired entry
        return null;
      }
      
      return entry.data;
    } catch (error) {
      // File doesn't exist or is corrupted
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl
      };
      
      await fs.writeFile(filePath, JSON.stringify(entry), 'utf8');
    } catch (error) {
      console.error(`❌ Failed to write cache entry ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, which is fine
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();
      let cleaned = 0;
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.cacheDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const entry: CacheEntry = JSON.parse(content);
          
          if (now > entry.timestamp + entry.ttl) {
            await fs.unlink(filePath);
            cleaned++;
          }
        } catch (error) {
          // File is corrupted, delete it
          await fs.unlink(path.join(this.cacheDir, file));
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
      }
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

class RedisCache implements ICache {
  private redis: any; // Redis client type
  private defaultTtl: number;

  constructor(config: CacheConfig) {
    this.defaultTtl = Math.floor(config.ttl / 1000); // Redis uses seconds
    // TODO: Implement Redis client initialization
    // This would require adding Redis client library
    throw new Error('Redis cache not implemented yet - using file cache');
  }

  async get<T = any>(key: string): Promise<T | null> {
    // TODO: Implement Redis get
    return null;
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    // TODO: Implement Redis set
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement Redis delete
  }

  async clear(): Promise<void> {
    // TODO: Implement Redis clear
  }

  async cleanup(): Promise<void> {
    // Redis handles TTL automatically
  }
}

// Cache factory
export function createCache(config: CacheConfig = { ttl: 24 * 60 * 60 * 1000 }): ICache {
  const redisUrl = getEnv('REDIS_URL');
  
  if (redisUrl) {
    try {
      return new RedisCache(config);
    } catch (error) {
      console.warn('⚠️ Redis unavailable, falling back to file cache:', error);
    }
  }
  
  return new FileCache({
    ...config,
    cleanupInterval: config.cleanupInterval || 60 * 60 * 1000 // Cleanup every hour
  });
}

// Amazon-specific cache with 24h TTL
export function createAmazonCache(): ICache {
  return createCache({
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 4 * 60 * 60 * 1000 // Cleanup every 4 hours
  });
}

// Global cache instances
let amazonCache: ICache | null = null;

export function getAmazonCache(): ICache {
  if (!amazonCache) {
    amazonCache = createAmazonCache();
    console.log('💾 Amazon cache initialized (24h TTL, file-based)');
  }
  return amazonCache;
}