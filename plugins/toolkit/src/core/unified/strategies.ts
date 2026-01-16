/**
 * Search Strategies
 *
 * Implements different search strategies that can be used by the unified router.
 *
 * @module core/unified/strategies
 */

import { SearchStrategy, SearchResult, StrategyResult } from './types.js';
import { MgrepClient } from '../mgrep/client.js';
import { SemanticSearch } from '../mgrep/search.js';
import { RAGOptimizer } from '../rag/optimizer.js';

/**
 * Base strategy interface
 */
export interface ISearchStrategy {
  /** Strategy name */
  readonly name: SearchStrategy;

  /** Execute search with this strategy */
  search(query: string, options: Record<string, unknown>): Promise<StrategyResult>;
}

/**
 * Semantic search strategy using mgrep
 */
export class SemanticSearchStrategy implements ISearchStrategy {
  readonly name = SearchStrategy.SEMANTIC;
  private client: MgrepClient;
  private semanticSearch: SemanticSearch;

  constructor(config?: Record<string, unknown>) {
    this.client = new MgrepClient(config);
    this.semanticSearch = new SemanticSearch({
      maxResults: (config?.maxResults as number) || 50,
    });
  }

  async search(query: string, options: Record<string, unknown>): Promise<StrategyResult> {
    const startTime = Date.now();

    try {
      const maxResults = (options.maxResults as number) || 50;

      const result = await this.semanticSearch.search(query, undefined, {
        maxResults,
      });

      const results: SearchResult[] = result.results.map(r => ({
        filePath: r.file,
        lineNumber: r.startLine || 0,
        content: r.snippet || '',
        score: r.score,
      }));

      return {
        strategy: this.name,
        score: result.results.length > 0 ? result.results[0].score : 0,
        results,
        executionTime: Date.now() - startTime,
        metadata: {
          totalResults: result.results.length,
          usedFallback: result.stats.usedFallback,
        },
      };
    } catch (error) {
      return {
        strategy: this.name,
        score: 0,
        results: [],
        executionTime: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

/**
 * Literal search strategy using grep-like patterns
 */
export class LiteralSearchStrategy implements ISearchStrategy {
  readonly name = SearchStrategy.LITERAL;
  private client: MgrepClient;

  constructor(config?: Record<string, unknown>) {
    this.client = new MgrepClient(config);
  }

  async search(query: string, options: Record<string, unknown>): Promise<StrategyResult> {
    const startTime = Date.now();

    try {
      const maxResults = (options.maxResults as number) || 50;

      const result = await this.client.search(query, undefined, {
        maxCount: maxResults,
        recursive: true,
        content: true,
        caseInsensitive: true,
      });

      if (!result.success || !result.results) {
        return {
          strategy: this.name,
          score: 0,
          results: [],
          executionTime: Date.now() - startTime,
          metadata: {
            error: result.error || 'Search failed',
          },
        };
      }

      const results: SearchResult[] = result.results.map(r => ({
        filePath: r.file,
        lineNumber: r.startLine || 0,
        content: r.snippet || '',
        score: r.score,
      }));

      return {
        strategy: this.name,
        score: results.length > 0 ? 1.0 : 0,
        results,
        executionTime: Date.now() - startTime,
        metadata: {
          totalResults: results.length,
        },
      };
    } catch (error) {
      return {
        strategy: this.name,
        score: 0,
        results: [],
        executionTime: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

/**
 * Hybrid search strategy combining semantic and literal
 */
export class HybridSearchStrategy implements ISearchStrategy {
  readonly name = SearchStrategy.HYBRID;
  private semantic: SemanticSearchStrategy;
  private literal: LiteralSearchStrategy;

  constructor(config?: Record<string, unknown>) {
    this.semantic = new SemanticSearchStrategy(config);
    this.literal = new LiteralSearchStrategy(config);
  }

  async search(query: string, options: Record<string, unknown>): Promise<StrategyResult> {
    const startTime = Date.now();

    try {
      // Run both strategies in parallel
      const [semanticResult, literalResult] = await Promise.all([
        this.semantic.search(query, options),
        this.literal.search(query, options),
      ]);

      // Merge and deduplicate results
      const mergedResults = this.mergeResults(
        semanticResult.results,
        literalResult.results
      );

      // Calculate combined score
      const combinedScore = Math.max(
        semanticResult.score,
        literalResult.score,
        mergedResults.length > 0 ? mergedResults[0].score || 0 : 0
      );

      return {
        strategy: this.name,
        score: combinedScore,
        results: mergedResults,
        executionTime: Date.now() - startTime,
        metadata: {
          semanticResults: semanticResult.results.length,
          literalResults: literalResult.results.length,
          mergedResults: mergedResults.length,
        },
      };
    } catch (error) {
      return {
        strategy: this.name,
        score: 0,
        results: [],
        executionTime: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Merge results from multiple strategies
   */
  private mergeResults(...resultSets: SearchResult[][]): SearchResult[] {
    const mergedMap = new Map<string, SearchResult>();

    for (const results of resultSets) {
      for (const result of results) {
        const key = `${result.filePath}:${result.lineNumber}`;
        const existing = mergedMap.get(key);

        if (!existing || (result.score && existing.score && result.score > existing.score)) {
          mergedMap.set(key, result);
        }
      }
    }

    // Sort by score descending
    return Array.from(mergedMap.values()).sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return scoreB - scoreA;
    });
  }
}

/**
 * RAG-based search strategy
 */
export class RAGSearchStrategy implements ISearchStrategy {
  readonly name = SearchStrategy.RAG;
  private optimizer: RAGOptimizer;

  constructor(config?: Record<string, unknown>) {
    this.optimizer = new RAGOptimizer({
      maxTokens: (config?.maxTokens as number) || 8000,
    });
  }

  async search(query: string, options: Record<string, unknown>): Promise<StrategyResult> {
    const startTime = Date.now();

    try {
      // Use RAG optimizer to find relevant code
      const maxResults = (options.maxResults as number) || 50;

      // This is a simplified RAG implementation
      // In a full implementation, you would:
      // 1. Generate embeddings for the query
      // 2. Search through indexed code
      // 3. Use the surgeon to extract relevant code
      // 4. Optimize the results for token budget

      const results: SearchResult[] = []; // Placeholder

      return {
        strategy: this.name,
        score: 0,
        results,
        executionTime: Date.now() - startTime,
        metadata: {
          note: 'RAG strategy not fully implemented',
        },
      };
    } catch (error) {
      return {
        strategy: this.name,
        score: 0,
        results: [],
        executionTime: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

/**
 * Strategy factory
 */
export class StrategyFactory {
  private strategies: Map<SearchStrategy, ISearchStrategy>;

  constructor(config?: Record<string, unknown>) {
    this.strategies = new Map<SearchStrategy, ISearchStrategy>();
    this.strategies.set(SearchStrategy.SEMANTIC, new SemanticSearchStrategy(config));
    this.strategies.set(SearchStrategy.LITERAL, new LiteralSearchStrategy(config));
    this.strategies.set(SearchStrategy.HYBRID, new HybridSearchStrategy(config));
    this.strategies.set(SearchStrategy.RAG, new RAGSearchStrategy(config));
  }

  /**
   * Get a strategy by name
   */
  getStrategy(strategy: SearchStrategy): ISearchStrategy {
    const s = this.strategies.get(strategy);
    if (!s) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
    return s;
  }

  /**
   * Get all available strategies
   */
  getAllStrategies(): ISearchStrategy[] {
    return Array.from(this.strategies.values());
  }
}
