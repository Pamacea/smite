/**
 * Search Feature Module - Layer 2
 * High-level search functionality built on MCP clients
 *
 * This module provides agent-friendly search functions with:
 * - Web search with advanced filters
 * - Search + read workflows
 * - Parallel multi-source search
 * - Structured result types
 */

import type {
  Result,
  WebSearchOptions,
  WebSearchResult,
  ReadUrlOptions,
} from '../mcp/types.js';
import { WebSearchClient } from '../mcp/web-search-client.js';
import { WebReaderClient } from '../mcp/web-reader-client.js';
import { isSuccess } from '../mcp/index.js';

// ============================================================================
// Feature-Specific Types
// ============================================================================

/**
 * Enhanced search result with domain and metadata
 */
export interface EnhancedSearchResult extends WebSearchResult {
  domain: string;
  timestamp: string;
  extractedAt: string;
}

/**
 * Search and read result
 */
export interface SearchAndReadResult {
  query: string;
  searchResults: EnhancedSearchResult[];
  content: Map<string, string>;
  totalResults: number;
  successfulReads: number;
}

/**
 * Multi-search result
 */
export interface MultiSearchResult {
  queries: string[];
  results: Map<string, EnhancedSearchResult[]>;
  totalResults: number;
}

/**
 * Search feature options
 */
export interface SearchFeatureOptions {
  /**
   * Maximum number of search results to return
   */
  maxResults?: number;

  /**
   * Time range filter
   */
  timeRange?: WebSearchOptions['timeRange'];

  /**
   * Domain filter (comma-separated or array)
   */
  domainFilter?: string | string[];

  /**
   * Location for search results
   */
  location?: WebSearchOptions['location'];

  /**
   * Content size (medium or high)
   */
  contentSize?: WebSearchOptions['contentSize'];

  /**
   * Enrich results with domain and timestamp
   */
  enrich?: boolean;
}

/**
 * Search and read options
 */
export interface SearchAndReadOptions {
  /**
   * Number of top results to read
   */
  readCount?: number;

  /**
   * Options for reading URLs
   */
  readOptions?: Partial<ReadUrlOptions>;

  /**
   * Search options
   */
  searchOptions?: Partial<WebSearchOptions>;
}

/**
 * Multi-search options
 */
export interface MultiSearchOptions {
  /**
   * Execute searches in parallel (default: true)
   */
  parallel?: boolean;

  /**
   * Maximum concurrent searches (default: 3)
   */
  maxConcurrency?: number;

  /**
   * Common search options applied to all queries
   */
  commonOptions?: Partial<WebSearchOptions>;
}

// ============================================================================
// Search Feature Class
// ============================================================================

/**
 * Search Feature Module
 *
 * Provides high-level search functionality for agents
 *
 * @example
 * ```typescript
 * const searchFeature = new SearchFeature();
 *
 * // Simple web search
 * const results = await searchFeature.searchWeb('Browser MCP');
 *
 * // Search with filters
 * const recent = await searchFeature.searchWeb('AI tools', {
 *   timeRange: 'oneWeek',
 *   location: 'us'
 * });
 *
 * // Search and read top results
 * const research = await searchFeature.searchAndRead('MCP servers', {
 *   readCount: 5
 * });
 *
 * // Parallel multi-source search
 * const comparison = await searchFeature.searchMultiple([
 *   'Browser automation tools',
 *   'Web scraping libraries'
 * ]);
 * ```
 */
export class SearchFeature {
  private readonly webSearch: WebSearchClient;
  private readonly webReader: WebReaderClient;

  constructor(
    webSearchClient?: WebSearchClient,
    webReaderClient?: WebReaderClient
  ) {
    this.webSearch = webSearchClient || new WebSearchClient();
    this.webReader = webReaderClient || new WebReaderClient();
  }

  // ========================================================================
  // Core Search Functionality
  // ========================================================================

  /**
   * Search the web with optional filters
   *
   * @param query - Search query string
   * @param options - Search options (filters, location, etc.)
   * @returns Promise<Result<EnhancedSearchResult[]>> - Enhanced search results
   *
   * @example
   * ```typescript
   * const results = await searchFeature.searchWeb('TypeScript patterns', {
   *   timeRange: 'oneMonth',
   *   location: 'us',
   *   maxResults: 10
   * });
   * ```
   */
  async searchWeb(
    query: string,
    options: SearchFeatureOptions = {}
  ): Promise<Result<EnhancedSearchResult[]>> {
    try {
      // Prepare search options
      const searchOptions: WebSearchOptions = {
        query,
        ...(options.timeRange && { timeRange: options.timeRange }),
        ...(options.domainFilter && {
          domainFilter: Array.isArray(options.domainFilter)
            ? options.domainFilter.join(',')
            : options.domainFilter
        }),
        ...(options.location && { location: options.location }),
        ...(options.contentSize && { contentSize: options.contentSize }),
      };

      // Execute search
      const result = await this.webSearch.search(searchOptions);

      if (!result.success) {
        return result as Result<EnhancedSearchResult[]>;
      }

      // Enrich results if requested
      let searchResults = result.data;

      if (options.maxResults) {
        searchResults = searchResults.slice(0, options.maxResults);
      }

      const enhancedResults = options.enrich !== false
        ? this.enrichSearchResults(searchResults)
        : searchResults.map(r => ({
            ...r,
            domain: '',
            timestamp: '',
            extractedAt: ''
          }));

      return { success: true, data: enhancedResults };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Search web and read top N results
   *
   * @param query - Search query string
   * @param options - Search and read options
   * @returns Promise<Result<SearchAndReadResult>> - Search results + content
   *
   * @example
   * ```typescript
   * const result = await searchFeature.searchAndRead('Browser automation', {
   *   readCount: 3,
   *   searchOptions: { timeRange: 'oneWeek' }
   * });
   *
   * if (result.success) {
   *   console.log(`Read ${result.data.successfulReads} pages`);
   *   for (const [url, content] of result.data.content) {
   *     console.log(`Content from ${url}:`, content.substring(0, 200));
   *   }
   * }
   * ```
   */
  async searchAndRead(
    query: string,
    options: SearchAndReadOptions = {}
  ): Promise<Result<SearchAndReadResult>> {
    try {
      // Step 1: Search web
      const searchResult = await this.searchWeb(query, {
        ...options.searchOptions,
        enrich: true,
      });

      if (!searchResult.success) {
        return searchResult as Result<SearchAndReadResult>;
      }

      const searchResults = searchResult.data;
      const readCount = options.readCount || 3;
      const topResults = searchResults.slice(0, readCount);

      // Step 2: Read top results
      const urls = topResults.map(r => r.url);
      const readResult = await this.webReader.readMultiple(
        urls,
        options.readOptions
      );

      if (!readResult.success) {
        return readResult as Result<SearchAndReadResult>;
      }

      // Step 3: Build composite result
      const searchAndReadResult: SearchAndReadResult = {
        query,
        searchResults: topResults,
        content: readResult.data,
        totalResults: searchResults.length,
        successfulReads: readResult.data.size,
      };

      return { success: true, data: searchAndReadResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Search multiple queries in parallel
   *
   * @param queries - Array of search queries
   * @param options - Multi-search options
   * @returns Promise<Result<MultiSearchResult>> - Aggregated search results
   *
   * @example
   * ```typescript
   * const result = await searchFeature.searchMultiple(
   *   ['React hooks', 'Vue composition API', 'Svelte stores'],
   *   {
   *     parallel: true,
   *     commonOptions: { timeRange: 'oneMonth' }
   *   }
   * );
   *
   * if (result.success) {
   *   console.log(`Total results: ${result.data.totalResults}`);
   *   for (const [query, results] of result.data.results) {
   *     console.log(`${query}: ${results.length} results`);
   *   }
   * }
   * ```
   */
  async searchMultiple(
    queries: string[],
    options: MultiSearchOptions = {}
  ): Promise<Result<MultiSearchResult>> {
    try {
      const parallel = options.parallel !== false;
      const maxConcurrency = options.maxConcurrency || 3;
      const resultsMap = new Map<string, EnhancedSearchResult[]>();

      if (parallel) {
        // Parallel execution with concurrency limit
        const batches: string[][] = [];
        for (let i = 0; i < queries.length; i += maxConcurrency) {
          batches.push(queries.slice(i, i + maxConcurrency));
        }

        for (const batch of batches) {
          const batchResults = await Promise.all(
            batch.map(query =>
              this.searchWeb(query, { ...options.commonOptions, enrich: true })
            )
          );

          for (let i = 0; i < batch.length; i++) {
            const query = batch[i];
            const result = batchResults[i];

            if (isSuccess(result)) {
              resultsMap.set(query, result.data);
            } else {
              resultsMap.set(query, []);
            }
          }
        }
      } else {
        // Sequential execution
        for (const query of queries) {
          const result = await this.searchWeb(query, {
            ...options.commonOptions,
            enrich: true,
          });

          if (isSuccess(result)) {
            resultsMap.set(query, result.data);
          } else {
            resultsMap.set(query, []);
          }
        }
      }

      // Calculate total results
      const totalResults = Array.from(resultsMap.values())
        .reduce((sum, results) => sum + results.length, 0);

      const multiSearchResult: MultiSearchResult = {
        queries,
        results: resultsMap,
        totalResults,
      };

      return { success: true, data: multiSearchResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Convenience Methods
  // ========================================================================

  /**
   * Search recent results (convenience method)
   *
   * @param query - Search query
   * @param timeRange - Time range filter (default: 'oneWeek')
   * @returns Promise<Result<EnhancedSearchResult[]>> - Recent search results
   *
   * @example
   * ```typescript
   * const recent = await searchFeature.searchRecent('AI news', 'oneDay');
   * ```
   */
  async searchRecent(
    query: string,
    timeRange: 'oneDay' | 'oneWeek' | 'oneMonth' = 'oneWeek'
  ): Promise<Result<EnhancedSearchResult[]>> {
    return this.searchWeb(query, { timeRange, enrich: true });
  }

  /**
   * Search specific domains (convenience method)
   *
   * @param query - Search query
   * @param domains - Domain(s) to search
   * @returns Promise<Result<EnhancedSearchResult[]>> - Domain-specific results
   *
   * @example
   * ```typescript
   * const docs = await searchFeature.searchDomains(
   *   'TypeScript generics',
   *   ['github.com', 'typescriptlang.org']
   * );
   * ```
   */
  async searchDomains(
    query: string,
    domains: string | string[]
  ): Promise<Result<EnhancedSearchResult[]>> {
    return this.searchWeb(query, { domainFilter: domains, enrich: true });
  }

  /**
   * Research workflow: Search + Read + Summarize
   *
   * @param query - Research query
   * @param readCount - Number of sources to read (default: 3)
   * @returns Promise<Result<string>> - Research summary
   *
   * @example
   * ```typescript
   * const summary = await searchFeature.research('Browser MCP architecture');
   * console.log(summary.data);
   * // Output:
   * // # Research Summary: Browser MCP architecture
   * //
   * // ## Sources
   * // 1. [Title](url) - summary
   * // 2. [Title](url) - summary
   * // ...
   * //
   * // ## Key Findings
   * // ... content from top 3 sources ...
   * ```
   */
  async research(
    query: string,
    readCount: number = 3
  ): Promise<Result<string>> {
    try {
      const result = await this.searchAndRead(query, { readCount });

      if (!result.success) {
        return result as Result<string>;
      }

      const summary = this.formatResearchSummary(result.data);
      return { success: true, data: summary };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Enrich search results with domain and timestamps
   */
  private enrichSearchResults(
    results: WebSearchResult[]
  ): EnhancedSearchResult[] {
    const now = new Date().toISOString();

    return results.map(result => {
      let domain = '';

      try {
        const url = new URL(result.url);
        domain = url.hostname;
      } catch {
        domain = 'unknown';
      }

      return {
        ...result,
        domain,
        timestamp: result.publishedDate || now,
        extractedAt: now,
      };
    });
  }

  /**
   * Format research summary
   */
  private formatResearchSummary(data: SearchAndReadResult): string {
    const lines = [
      `# Research Summary: ${data.query}`,
      '',
      `## Sources (${data.searchResults.length})`,
      '',
      ...data.searchResults.map((result, i) => {
        return [
          `${i + 1}. **${result.title}**`,
          `   ${result.url}`,
          `   ${result.domain} - ${result.summary.substring(0, 150)}${result.summary.length > 150 ? '...' : ''}`,
        ].join('\n');
      }),
      '',
      '## Key Findings',
      '',
      ...Array.from(data.content.entries()).slice(0, 3).map(([url, content], i) => {
        const preview = content.substring(0, 800).replace(/\n/g, ' ');
        return `### Source ${i + 1}\n\n**URL:** ${url}\n\n${preview}${content.length > 800 ? '...' : ''}\n`;
      }),
      '',
      '---',
      `*Generated at ${new Date().toISOString()}*`,
      '',
    ];

    return lines.join('\n');
  }
}

// ============================================================================
// Convenience Functions (Agent-Friendly API)
// ============================================================================

/**
 * Quick web search
 *
 * @param query - Search query
 * @param options - Optional search configuration
 * @returns Promise<Result<EnhancedSearchResult[]>> - Search results
 *
 * @example
 * ```typescript
 * const results = await searchWeb('Browser automation');
 * if (results.success) {
 *   console.log(`Found ${results.data.length} results`);
 * }
 * ```
 */
export async function searchWeb(
  query: string,
  options?: SearchFeatureOptions
): Promise<Result<EnhancedSearchResult[]>> {
  const feature = new SearchFeature();
  return feature.searchWeb(query, options);
}

/**
 * Search and read top results
 *
 * @param query - Search query
 * @param options - Optional configuration
 * @returns Promise<Result<SearchAndReadResult>> - Search + content
 *
 * @example
 * ```typescript
 * const result = await searchAndRead('MCP servers', { readCount: 5 });
 * if (result.success) {
 *   console.log(`Read ${result.data.successfulReads} pages`);
 * }
 * ```
 */
export async function searchAndRead(
  query: string,
  options?: SearchAndReadOptions
): Promise<Result<SearchAndReadResult>> {
  const feature = new SearchFeature();
  return feature.searchAndRead(query, options);
}

/**
 * Search multiple queries
 *
 * @param queries - Array of queries
 * @param options - Optional configuration
 * @returns Promise<Result<MultiSearchResult>> - Aggregated results
 *
 * @example
 * ```typescript
 * const result = await searchMultiple(['React', 'Vue', 'Angular']);
 * if (result.success) {
 *   console.log(`Total: ${result.data.totalResults} results`);
 * }
 * ```
 */
export async function searchMultiple(
  queries: string[],
  options?: MultiSearchOptions
): Promise<Result<MultiSearchResult>> {
  const feature = new SearchFeature();
  return feature.searchMultiple(queries, options);
}

/**
 * Research workflow
 *
 * @param query - Research query
 * @param readCount - Number of sources to read
 * @returns Promise<Result<string>> - Research summary
 *
 * @example
 * ```typescript
 * const summary = await research('Browser automation tools');
 * console.log(summary.data);
 * ```
 */
export async function research(
  query: string,
  readCount?: number
): Promise<Result<string>> {
  const feature = new SearchFeature();
  return feature.research(query, readCount);
}
