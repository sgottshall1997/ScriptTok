/**
 * Simple in-memory cache for API responses
 * This reduces OpenAI API usage by caching similar requests
 */

// Cache entry with TTL (time to live)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Cache configuration
interface CacheConfig {
  defaultTtl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries in the cache
}

export class CacheService<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  
  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map<string, CacheEntry<T>>();
    this.config = {
      defaultTtl: 1000 * 60 * 60, // 1 hour default TTL
      maxSize: 100, // Default max 100 entries
      ...config
    };
  }
  
  /**
   * Generate a cache key from the request parameters
   */
  generateKey(params: Record<string, any>): string {
    // Sort keys to ensure consistent key generation regardless of order
    const sortedParams = Object.keys(params).sort().reduce(
      (obj, key) => {
        obj[key] = params[key];
        return obj;
      },
      {} as Record<string, any>
    );
    
    return JSON.stringify(sortedParams);
  }
  
  /**
   * Set an item in the cache
   */
  set(key: string, data: T, ttl?: number): void {
    // Clean expired entries first
    this.cleanExpired();
    
    // Enforce cache size limit
    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Calculate expiration time
    const expiresAt = Date.now() + (ttl || this.config.defaultTtl);
    
    // Store in cache
    this.cache.set(key, { data, expiresAt });
  }
  
  /**
   * Get an item from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    // If entry exists and is not expired
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    
    // Entry not found or expired
    if (entry) {
      // Clean up expired entry
      this.cache.delete(key);
    }
    
    return undefined;
  }
  
  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    // Use Array.from to avoid iterator issues
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    });
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the current cache size
   */
  size(): number {
    return this.cache.size;
  }
}