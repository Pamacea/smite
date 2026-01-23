/**
 * Semantic Cache - Content caching with similarity matching
 *
 * Implements semantic caching with cosine similarity to identify
 * related queries and reuse cached content, improving performance
 * and reducing redundant processing.
 */
/**
 * Cache entry
 */
export interface CacheEntry {
    id: string;
    query: string;
    filePath: string;
    content: string;
    tokens: number;
    timestamp: number;
    accessCount: number;
    lastAccess: number;
}
/**
 * Cache statistics
 */
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    totalEntries: number;
}
/**
 * Similarity result
 */
export interface SimilarityResult {
    entry: CacheEntry;
    similarity: number;
}
/**
 * Semantic Cache configuration
 */
export interface CacheConfig {
    maxSize: number;
    ttl: number;
    similarityThreshold: number;
}
/**
 * Default configuration
 */
export declare const DEFAULT_CACHE_CONFIG: CacheConfig;
/**
 * Semantic Cache class
 */
export declare class SemanticCache {
    private cache;
    private queryIndex;
    private fileIndex;
    private config;
    private stats;
    constructor(maxSize?: number, ttl?: number);
    /**
     * Generate cache key from query and file path
     */
    private generateKey;
    /**
     * Calculate cosine similarity between two strings
     */
    private calculateSimilarity;
    /**
     * Update indexes for a cache entry
     */
    private updateIndexes;
    /**
     * Remove entry from indexes
     */
    private removeFromIndexes;
    /**
     * Clean up expired entries
     */
    private cleanup;
    /**
     * Evict least recently used entry if cache is full
     */
    private evictIfNeeded;
    /**
     * Get cached content by query and file path
     */
    get(query: string, filePath: string): Promise<CacheEntry | null>;
    /**
     * Set cache entry
     */
    set(query: string, filePath: string, content: string, tokens: number): Promise<void>;
    /**
     * Find similar entries
     */
    findSimilar(query: string, limit?: number): Promise<SimilarityResult[]>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
    /**
     * Remove entry by ID
     */
    delete(id: string): boolean;
    /**
     * Get all entries
     */
    entries(): CacheEntry[];
    /**
     * Get entry by ID
     */
    getEntry(id: string): CacheEntry | undefined;
}
//# sourceMappingURL=cache.d.ts.map