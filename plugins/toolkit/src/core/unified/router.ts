/**
 * Unified Search Router
 *
 * Main router that intelligently routes search queries to the appropriate
 * search strategy based on query analysis and available data.
 *
 * @module core/unified/router
 */

import { QueryAnalyzer } from './analyzer.js';
import { StrategyFactory } from './strategies.js';
import {
  SearchStrategy,
  UnifiedSearchOptions,
  UnifiedSearchResult,
  RouterConfig,
  DEFAULT_ROUTER_CONFIG,
  QueryAnalysis,
  StrategyResult,
} from './types.js';

/**
 * Simple cache implementation for search results
 */
class SearchCache {
  private cache = new Map<string, { result: UnifiedSearchResult; timestamp: number }>();
  private ttl: number;
  private maxSize: number;

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): UnifiedSearchResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(key: string, result: UnifiedSearchResult): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Unified Search Router
 */
export class SearchRouter {
  private analyzer: QueryAnalyzer;
  private strategyFactory: StrategyFactory;
  private config: RouterConfig;
  private cache: SearchCache;

  constructor(config?: Partial<RouterConfig>) {
    this.config = { ...DEFAULT_ROUTER_CONFIG, ...config };
    this.analyzer = new QueryAnalyzer();
    this.strategyFactory = new StrategyFactory({
      maxResults: this.config.defaultMaxResults,
      cacheEnabled: this.config.cacheEnabled,
    });
    this.cache = new SearchCache(this.config.maxCacheSize, this.config.cacheTTL);
  }

  /**
   * Perform a unified search
   */
  async search(query: string, options?: UnifiedSearchOptions): Promise<UnifiedSearchResult> {
    const startTime = Date.now();

    // Merge options with defaults
    const mergedOptions: UnifiedSearchOptions = {
      strategy: SearchStrategy.AUTO,
      maxResults: this.config.defaultMaxResults,
      timeout: this.config.defaultTimeout,
      useCache: this.config.cacheEnabled,
      includeContext: true,
      contextLines: 3,
      minScore: 0.3,
      ...options,
    };

    // Check cache first
    if (mergedOptions.useCache !== false) {
      const cacheKey = this.getCacheKey(query, mergedOptions);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
        };
      }
    }

    // Analyze the query
    const queryAnalysis = this.analyzer.analyze(query);

    // Determine strategy to use
    const strategy = mergedOptions.strategy === SearchStrategy.AUTO
      ? queryAnalysis.recommendedStrategy
      : (mergedOptions.strategy ?? queryAnalysis.recommendedStrategy);

    // Execute search
    const searchResult = await this.executeSearch(
      query,
      queryAnalysis,
      strategy,
      mergedOptions
    );

    const result: UnifiedSearchResult = {
      results: searchResult.results,
      strategy,
      queryAnalysis,
      strategyResults: searchResult.strategyResults,
      totalExecutionTime: Date.now() - startTime,
      resultCount: searchResult.results.length,
      fromCache: false,
    };

    // Cache the result
    if (mergedOptions.useCache !== false) {
      const cacheKey = this.getCacheKey(query, mergedOptions);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Execute search with strategy and fallbacks
   */
  private async executeSearch(
    query: string,
    queryAnalysis: QueryAnalysis,
    strategy: SearchStrategy,
    options: UnifiedSearchOptions
  ): Promise<{
    results: import('./types.js').SearchResult[];
    strategyResults?: StrategyResult[];
  }> {
    const strategiesToTry: SearchStrategy[] = [strategy];
    const strategyResults: StrategyResult[] = [];

    // Add fallback strategies if enabled
    if (this.config.enableFallback && strategy === SearchStrategy.AUTO) {
      strategiesToTry.push(...queryAnalysis.alternativeStrategies.slice(0, this.config.maxFallbacks));
    }

    // Try each strategy until we get results
    for (const strat of strategiesToTry) {
      try {
        const searchStrategy = this.strategyFactory.getStrategy(strat);
        const result = await searchStrategy.search(query, options);
        strategyResults.push(result);

        // If we got good results, return them
        if (result.results.length > 0 && result.score >= (options.minScore || 0.3)) {
          return {
            results: result.results.slice(0, options.maxResults),
            strategyResults,
          };
        }
      } catch (error) {
        // Log error and continue to next strategy
        console.error(`Strategy ${strat} failed:`, error);
        strategyResults.push({
          strategy: strat,
          score: 0,
          results: [],
          executionTime: 0,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // If all strategies failed, return empty results
    return {
      results: [],
      strategyResults,
    };
  }

  /**
   * Generate cache key from query and options
   */
  private getCacheKey(query: string, options: UnifiedSearchOptions): string {
    const relevantOptions = {
      strategy: options.strategy,
      maxResults: options.maxResults,
      filePatterns: options.filePatterns,
      languages: options.languages,
    };
    return `${query}:${JSON.stringify(relevantOptions)}`;
  }

  /**
   * Clear the search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }

  /**
   * Get router configuration
   */
  getConfig(): RouterConfig {
    return { ...this.config };
  }

  /**
   * Update router configuration
   */
  updateConfig(updates: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get the max cache size
   */
  get maxCacheSize(): number {
    return this.config.maxCacheSize;
  }
}
