/**
 * RAG (Retrieval-Augmented Generation) Core Module
 *
 * Provides intelligent token optimization through:
 * - AST-based code extraction (surgeon mode)
 * - Semantic caching with similarity matching
 * - Budget management with configurable thresholds
 *
 * @module core/rag
 */
export { RAGOptimizer, CHARS_PER_TOKEN, BudgetThreshold, OptimizationMode, type ReadBudget, type OptimizationResult, type OptimizerConfig, DEFAULT_CONFIG, } from './optimizer.js';
export { SurgeonExtractor, ExtractionMode, type ExtractionResult, type SurgeonConfig, DEFAULT_SURGEON_CONFIG, } from './surgeon.js';
export { SemanticCache, type CacheEntry, type CacheStats, type SimilarityResult, type CacheConfig, DEFAULT_CACHE_CONFIG, } from './cache.js';
export { extractKeywords, extractKeywordSet, jaccardSimilarity, cosineKeywordSimilarity, type KeywordExtractionOptions, } from './keywords.js';
/**
 * Quick access factory for creating optimizer with default config
 */
export declare function createOptimizer(config?: Partial<import('./optimizer.js').OptimizerConfig>): any;
/**
 * Quick access factory for creating surgeon with default config
 */
export declare function createSurgeon(config?: Partial<import('./surgeon.js').SurgeonConfig>): any;
/**
 * Quick access factory for creating cache with default config
 */
export declare function createCache(maxSize?: number, ttl?: number): any;
//# sourceMappingURL=index.d.ts.map