"use strict";
/**
 * Semantic Cache - Content caching with similarity matching
 *
 * Implements semantic caching with cosine similarity to identify
 * related queries and reuse cached content, improving performance
 * and reducing redundant processing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticCache = exports.DEFAULT_CACHE_CONFIG = void 0;
const uuid_1 = require("uuid");
const keywords_1 = require("./keywords");
/**
 * Default configuration
 */
exports.DEFAULT_CACHE_CONFIG = {
    maxSize: 100,
    ttl: 3600000, // 1 hour in milliseconds
    similarityThreshold: 0.8, // 80% similarity threshold
};
/**
 * Semantic Cache class
 */
class SemanticCache {
    constructor(maxSize = 100, ttl = 3600000) {
        this.cache = new Map();
        this.queryIndex = new Map();
        this.fileIndex = new Map();
        this.config = {
            maxSize,
            ttl,
            similarityThreshold: exports.DEFAULT_CACHE_CONFIG.similarityThreshold,
        };
        this.stats = { hits: 0, misses: 0 };
    }
    /**
     * Generate cache key from query and file path
     */
    generateKey(query, filePath) {
        // Simple hash-based key generation
        const combined = `${query}:${filePath}`;
        // Use UUID for uniqueness (in production, consider using a proper hash function)
        return (0, uuid_1.v4)();
    }
    /**
     * Calculate cosine similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        return (0, keywords_1.cosineKeywordSimilarity)(str1, str2, { minLength: 3 });
    }
    /**
     * Update indexes for a cache entry
     */
    updateIndexes(entry) {
        // Update query index
        const keywords = (0, keywords_1.extractKeywords)(entry.query, { minLength: 3 });
        keywords.forEach(keyword => {
            if (!this.queryIndex.has(keyword)) {
                this.queryIndex.set(keyword, []);
            }
            this.queryIndex.get(keyword).push(entry.id);
        });
        // Update file index
        if (!this.fileIndex.has(entry.filePath)) {
            this.fileIndex.set(entry.filePath, []);
        }
        this.fileIndex.get(entry.filePath).push(entry.id);
    }
    /**
     * Remove entry from indexes
     */
    removeFromIndexes(entry) {
        const keywords = (0, keywords_1.extractKeywords)(entry.query, { minLength: 3 });
        keywords.forEach(keyword => {
            const ids = this.queryIndex.get(keyword);
            if (ids) {
                const index = ids.indexOf(entry.id);
                if (index > -1) {
                    ids.splice(index, 1);
                }
                if (ids.length === 0) {
                    this.queryIndex.delete(keyword);
                }
            }
        });
        const fileIds = this.fileIndex.get(entry.filePath);
        if (fileIds) {
            const index = fileIds.indexOf(entry.id);
            if (index > -1) {
                fileIds.splice(index, 1);
            }
            if (fileIds.length === 0) {
                this.fileIndex.delete(entry.filePath);
            }
        }
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const expiredIds = [];
        this.cache.forEach((entry, id) => {
            if (now - entry.timestamp > this.config.ttl) {
                expiredIds.push(id);
            }
        });
        expiredIds.forEach(id => {
            const entry = this.cache.get(id);
            if (entry) {
                this.removeFromIndexes(entry);
                this.cache.delete(id);
            }
        });
    }
    /**
     * Evict least recently used entry if cache is full
     */
    evictIfNeeded() {
        if (this.cache.size >= this.config.maxSize) {
            let lruId = null;
            let oldestAccess = Infinity;
            this.cache.forEach((entry, id) => {
                if (entry.lastAccess < oldestAccess) {
                    oldestAccess = entry.lastAccess;
                    lruId = id;
                }
            });
            if (lruId) {
                const entry = this.cache.get(lruId);
                if (entry) {
                    this.removeFromIndexes(entry);
                    this.cache.delete(lruId);
                }
            }
        }
    }
    /**
     * Get cached content by query and file path
     */
    async get(query, filePath) {
        this.cleanup();
        const now = Date.now();
        let bestMatch = null;
        let bestSimilarity = 0;
        // First, try exact match by file path
        const fileIds = this.fileIndex.get(filePath) || [];
        for (const id of fileIds) {
            const entry = this.cache.get(id);
            if (entry && now - entry.timestamp <= this.config.ttl) {
                const similarity = this.calculateSimilarity(query, entry.query);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = entry;
                }
            }
        }
        // If no good match by file, try by query keywords
        if (!bestMatch || bestSimilarity < this.config.similarityThreshold) {
            const keywords = (0, keywords_1.extractKeywords)(query, { minLength: 3 });
            const candidateIds = new Set();
            keywords.forEach(keyword => {
                const ids = this.queryIndex.get(keyword) || [];
                ids.forEach(id => candidateIds.add(id));
            });
            for (const id of candidateIds) {
                const entry = this.cache.get(id);
                if (entry && now - entry.timestamp <= this.config.ttl) {
                    const similarity = this.calculateSimilarity(query, entry.query);
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = entry;
                    }
                }
            }
        }
        if (bestMatch && bestSimilarity >= this.config.similarityThreshold) {
            bestMatch.accessCount++;
            bestMatch.lastAccess = now;
            this.stats.hits++;
            return bestMatch;
        }
        this.stats.misses++;
        return null;
    }
    /**
     * Set cache entry
     */
    async set(query, filePath, content, tokens) {
        this.cleanup();
        this.evictIfNeeded();
        const id = this.generateKey(query, filePath);
        const now = Date.now();
        const entry = {
            id,
            query,
            filePath,
            content,
            tokens,
            timestamp: now,
            accessCount: 0,
            lastAccess: now,
        };
        this.cache.set(id, entry);
        this.updateIndexes(entry);
    }
    /**
     * Find similar entries
     */
    async findSimilar(query, limit = 5) {
        const results = [];
        const keywords = (0, keywords_1.extractKeywords)(query, { minLength: 3 });
        const candidateIds = new Set();
        keywords.forEach(keyword => {
            const ids = this.queryIndex.get(keyword) || [];
            ids.forEach(id => candidateIds.add(id));
        });
        for (const id of candidateIds) {
            const entry = this.cache.get(id);
            if (entry) {
                const similarity = this.calculateSimilarity(query, entry.query);
                if (similarity > 0) {
                    results.push({ entry, similarity });
                }
            }
        }
        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, limit);
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: total > 0 ? this.stats.hits / total : 0,
            totalEntries: this.cache.size,
        };
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.queryIndex.clear();
        this.fileIndex.clear();
        this.stats = { hits: 0, misses: 0 };
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
    /**
     * Remove entry by ID
     */
    delete(id) {
        const entry = this.cache.get(id);
        if (entry) {
            this.removeFromIndexes(entry);
            return this.cache.delete(id);
        }
        return false;
    }
    /**
     * Get all entries
     */
    entries() {
        return Array.from(this.cache.values());
    }
    /**
     * Get entry by ID
     */
    getEntry(id) {
        return this.cache.get(id);
    }
}
exports.SemanticCache = SemanticCache;
//# sourceMappingURL=cache.js.map