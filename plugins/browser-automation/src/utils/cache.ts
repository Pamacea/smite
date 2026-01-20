/**
 * Cache Utility - Performance optimization layer
 *
 * Provides:
 * - In-memory LRU cache with TTL
 * - Request deduplication (same request in-flight)
 * - Cache hit/miss metrics
 * - Configurable cache options
 *
 * @module @smite/browser-automation/utils/cache
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  /**
   * Cached data
   */
  data: T;

  /**
   * Timestamp when entry was created
   */
  createdAt: number;

  /**
   * Time-to-live in milliseconds
   */
  ttl: number;

  /**
   * Number of times this entry was accessed
   */
  hits: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /**
   * Total number of cache hits
   */
  hits: number;

  /**
   * Total number of cache misses
   */
  misses: number;

  /**
   * Current cache size (number of entries)
   */
  size: number;

  /**
   * Hit rate (0-1)
   */
  hitRate: number;

  /**
   * Number of evicted entries
   */
  evictions: number;
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /**
   * Default time-to-live in milliseconds (default: 1 hour)
   */
  ttl?: number;

  /**
   * Maximum number of entries (default: 1000)
   */
  maxSize?: number;

  /**
   * Enable request deduplication (default: true)
   */
  deduplicate?: boolean;

  /**
   * Enable statistics tracking (default: true)
   */
  trackStats?: boolean;
}

/**
 * Pending request for deduplication
 */
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// ============================================================================
// Cache Implementation
// ============================================================================

/**
 * In-memory LRU cache with TTL and deduplication
 *
 * @example
 * ```typescript
 * const cache = new Cache<string>({ ttl: 3600000, maxSize: 1000 });
 *
 * // Set value
 * cache.set('key', 'value', 60000); // 1 minute TTL
 *
 * // Get value
 * const value = cache.get('key'); // Returns cached value or undefined
 *
 * // Get or compute (with deduplication)
 * const value = await cache.getOrSet('key', async () => {
 *   return await expensiveOperation();
 * }, 60000);
 *
 * // Get statistics
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
 * ```
 */
export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private pending: Map<string, PendingRequest<T>> = new Map();
  private accessOrder: string[] = [];
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    evictions: 0,
  };

  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private readonly deduplicate: boolean;
  private readonly trackStats: boolean;

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl ?? 3600000; // 1 hour default
    this.maxSize = options.maxSize ?? 1000;
    this.deduplicate = options.deduplicate ?? true;
    this.trackStats = options.trackStats ?? true;

    // Clean up expired entries periodically
    this.startCleanupInterval();
  }

  // ========================================================================
  // Core Cache Operations
  // ========================================================================

  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or undefined if not found/expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    // Cache miss
    if (!entry) {
      this.recordMiss();
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.recordMiss();
      return undefined;
    }

    // Cache hit - update access order and increment hit count
    this.updateAccessOrder(key);
    entry.hits++;
    this.recordHit();

    return entry.data;
  }

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time-to-live in milliseconds (uses default if not provided)
   */
  set(key: string, value: T, ttl?: number): void {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data: value,
      createdAt: Date.now(),
      ttl: ttl ?? this.defaultTtl,
      hits: 0,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.updateStats();
  }

  /**
   * Get value from cache or compute and cache it
   *
   * If deduplication is enabled, identical in-flight requests
   * will be coalesced into a single promise.
   *
   * @param key - Cache key
   * @param compute - Function to compute value if not cached
   * @param ttl - Time-to-live in milliseconds
   * @returns Promise resolving to cached or computed value
   *
   * @example
   * ```typescript
   * const value = await cache.getOrSet('expensive', async () => {
   *   return await fetchData();
   * }, 60000);
   * ```
   */
  async getOrSet(
    key: string,
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Check for in-flight request (deduplication)
    if (this.deduplicate) {
      const pending = this.pending.get(key);
      if (pending) {
        console.log(`🔄 Cache deduplication: Reusing in-flight request for "${key}"`);
        return pending.promise;
      }
    }

    // Compute value
    const promise = compute();

    // Store pending request for deduplication
    if (this.deduplicate) {
      this.pending.set(key, { promise, timestamp: Date.now() });

      // Clean up pending request after completion
      promise.finally(() => {
        this.pending.delete(key);
      });
    }

    try {
      const value = await promise;

      // Cache the computed value
      this.set(key, value, ttl);

      return value;
    } catch (error) {
      // Don't cache errors
      this.pending.delete(key);
      throw error;
    }
  }

  /**
   * Check if a key exists in cache and is not expired
   *
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Delete a key from cache
   *
   * @param key - Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.pending.clear();

    if (this.trackStats) {
      this.stats = {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
        evictions: 0,
      };
    }
  }

  // ========================================================================
  // Statistics and Monitoring
  // ========================================================================

  /**
   * Get cache statistics
   *
   * @returns Current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics counters
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
    this.stats.hitRate = 0;
  }

  /**
   * Get cache size (number of entries)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  /**
   * Update access order for LRU eviction
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);

    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict oldest (least recently used) entry
   */
  private evictOldest(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const oldestKey = this.accessOrder[0];
    this.cache.delete(oldestKey);
    this.accessOrder.shift();
    this.stats.evictions++;
    this.updateStats();

    console.log(`🗑️  Cache eviction: Removed "${oldestKey}" (LRU)`);
  }

  /**
   * Record a cache hit
   */
  private recordHit(): void {
    if (!this.trackStats) return;
    this.stats.hits++;
    this.updateHitRate();
  }

  /**
   * Record a cache miss
   */
  private recordMiss(): void {
    if (!this.trackStats) return;
    this.stats.misses++;
    this.updateHitRate();
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    if (!this.trackStats) return;
    this.stats.size = this.cache.size;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    // Clean up every 5 minutes
    const interval = setInterval(() => {
      this.cleanupExpired();
    }, 300000);

    // Don't prevent process exit
    interval.unref();
  }

  /**
   * Remove all expired entries
   */
  private cleanupExpired(): void {
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: Removed ${cleaned} expired entries`);
      this.updateStats();
    }
  }
}

// ============================================================================
// Global Cache Instances
// ============================================================================

/**
 * Default cache instance for web reader results
 */
export const webReaderCache = new Cache<string>({
  ttl: 3600000, // 1 hour
  maxSize: 500,
  deduplicate: true,
  trackStats: true,
});

/**
 * Default cache instance for web search results
 */
export const webSearchCache = new Cache<any[]>({
  ttl: 1800000, // 30 minutes
  maxSize: 200,
  deduplicate: true,
  trackStats: true,
});

/**
 * Default cache instance for vision analysis results
 */
export const visionCache = new Cache<string>({
  ttl: 7200000, // 2 hours
  maxSize: 100,
  deduplicate: true,
  trackStats: true,
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a cache key from parameters
 *
 * @param prefix - Key prefix (e.g., 'web-reader', 'search')
 * @param params - Parameters to include in key
 * @returns Cache key string
 *
 * @example
 * ```typescript
 * const key = generateCacheKey('web-reader', {
 *   url: 'https://example.com',
 *   format: 'markdown'
 * });
 * // Returns: "web-reader:https://example.com:markdown"
 * ```
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
}

/**
 * Log cache statistics
 */
export function logCacheStats(cache: Cache<any>, label: string): void {
  const stats = cache.getStats();
  console.log(`📊 ${label} Cache Stats:`);
  console.log(`   Size: ${stats.size}/${stats.size > 0 ? '?' : '0'} entries`);
  console.log(`   Hits: ${stats.hits}`);
  console.log(`   Misses: ${stats.misses}`);
  console.log(`   Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  console.log(`   Evictions: ${stats.evictions}`);
}

/**
 * Reset all global caches
 */
export function resetAllCaches(): void {
  webReaderCache.clear();
  webSearchCache.clear();
  visionCache.clear();
  console.log('🧹 All caches cleared');
}
