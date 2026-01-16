/**
 * Unified Search Module
 *
 * Provides intelligent search routing that automatically selects the best
 * search strategy based on query type and context.
 *
 * @module core/unified
 */

// Type exports
export {
  SearchStrategy,
  QueryType,
  UnifiedSearchOptions,
  UnifiedSearchResult,
  QueryAnalysis,
  StrategyResult,
  SearchResult,
  RouterConfig,
  DEFAULT_ROUTER_CONFIG,
} from './types.js';

// Analyzer exports
export {
  QueryAnalyzer,
} from './analyzer.js';

// Strategy exports
export {
  SemanticSearchStrategy,
  LiteralSearchStrategy,
  HybridSearchStrategy,
  RAGSearchStrategy,
  StrategyFactory,
  type ISearchStrategy,
} from './strategies.js';

// Router exports
export {
  SearchRouter,
} from './router.js';

/**
 * Quick access factory for creating search router
 */
export function createSearchRouter(config?: Partial<import('./types.js').RouterConfig>) {
  const { SearchRouter: Router } = require('./router.js');
  return new Router(config);
}
