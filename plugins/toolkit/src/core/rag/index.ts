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

// Optimizer exports
export {
  RAGOptimizer,
  CHARS_PER_TOKEN,
  BudgetThreshold,
  OptimizationMode,
  type ReadBudget,
  type OptimizationResult,
  type OptimizerConfig,
  DEFAULT_CONFIG,
} from './optimizer.js';

// Surgeon exports
export {
  SurgeonExtractor,
  ExtractionMode,
  type ExtractionResult,
  type SurgeonConfig,
  DEFAULT_SURGEON_CONFIG,
} from './surgeon.js';

// Cache exports
export {
  SemanticCache,
  type CacheEntry,
  type CacheStats,
  type SimilarityResult,
  type CacheConfig,
  DEFAULT_CACHE_CONFIG,
} from './cache.js';

// Keywords exports
export {
  extractKeywords,
  extractKeywordSet,
  jaccardSimilarity,
  cosineKeywordSimilarity,
  type KeywordExtractionOptions,
} from './keywords.js';

/**
 * Quick access factory for creating optimizer with default config
 */
export function createOptimizer(config?: Partial<import('./optimizer.js').OptimizerConfig>) {
  const { RAGOptimizer: Optimizer } = require('./optimizer.js');
  return new Optimizer(config);
}

/**
 * Quick access factory for creating surgeon with default config
 */
export function createSurgeon(config?: Partial<import('./surgeon.js').SurgeonConfig>) {
  const { SurgeonExtractor: Surgeon } = require('./surgeon.js');
  return new Surgeon(config);
}

/**
 * Quick access factory for creating cache with default config
 */
export function createCache(maxSize?: number, ttl?: number) {
  const { SemanticCache: Cache } = require('./cache.js');
  return new Cache(maxSize, ttl);
}
