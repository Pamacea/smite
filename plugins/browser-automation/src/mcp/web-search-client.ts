/**
 * Web Search MCP Client Wrapper
 * Wraps mcp__web-search-prime__webSearchPrime
 */

import type {
  IMcpClient,
  Result,
  WebSearchOptions,
  WebSearchResult,
  RetryConfig,
} from './types.js';
import {
  DEFAULT_RETRY_CONFIG,
  McpError,
  McpRetryError,
} from './types.js';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate next delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  return delay;
}

/**
 * Execute with retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  toolName: string,
  config: RetryConfig
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's a validation error or certain status codes
      if (error instanceof McpError) {
        // Check if error is retryable
        const isRetryable = !error.message.includes('validation') &&
                          !error.message.includes('invalid') &&
                          !error.message.includes('400');

        if (!isRetryable || attempt === config.maxAttempts - 1) {
          throw error;
        }
      }

      // Wait before next retry
      if (attempt < config.maxAttempts - 1) {
        const delay = calculateDelay(attempt, config);
        console.warn(`⚠️  ${toolName} failed (attempt ${attempt + 1}/${config.maxAttempts}), retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new McpRetryError(toolName, config.maxAttempts, lastError);
}

/**
 * Web Search Client
 * Wrapper for mcp__web-search-prime__webSearchPrime
 */
export class WebSearchClient implements IMcpClient {
  private readonly toolName = 'webSearchPrime';
  private available: boolean = true;

  constructor(private readonly retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  /**
   * Check if the MCP server is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Invoke the web search tool directly
   */
  async invoke<T>(tool: string, args: unknown): Promise<Result<T>> {
    try {
      // Note: In actual implementation, this would call the MCP server
      // For now, we're creating the wrapper structure
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis.mcp__web_search_prime__webSearchPrime(args);
      }, tool, this.retryConfig);

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Search the web with structured options
   *
   * @param options - Search options including query, filters, and location
   * @returns Promise<SearchResult[]> - Array of search results with metadata
   *
   * @example
   * ```typescript
   * const client = new WebSearchClient();
   * const results = await client.search({
   *   query: 'Browser MCP servers',
   *   timeRange: 'oneWeek',
   *   location: 'us',
   *   contentSize: 'medium'
   * });
   * ```
   */
  async search(options: WebSearchOptions): Promise<Result<WebSearchResult[]>> {
    try {
      // Validate required fields
      if (!options.query || typeof options.query !== 'string') {
        throw new McpError(
          this.toolName,
          'Invalid query',
          'Query must be a non-empty string'
        );
      }

      // Prepare arguments for MCP tool
      const args = {
        search_query: options.query.trim(),
        ...(options.domainFilter && { search_domain_filter: options.domainFilter }),
        ...(options.timeRange && { search_recency_filter: options.timeRange }),
        ...(options.location && { location: options.location }),
        ...(options.contentSize && { content_size: options.contentSize }),
      };

      // Execute search with retry
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis.mcp__web_search_prime__webSearchPrime(args);
      }, this.toolName, this.retryConfig);

      // Transform response to structured format
      const searchResults: WebSearchResult[] = this.transformSearchResults(result);

      return { success: true, data: searchResults };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Search with a simpler interface (returns summary string)
   *
   * @param query - Search query string
   * @param options - Optional search configuration
   * @returns Promise<string> - Formatted search summary
   */
  async searchWithSummary(
    query: string,
    options?: Partial<WebSearchOptions>
  ): Promise<Result<string>> {
    const result = await this.search({ query, ...options });

    if (!result.success) {
      return result;
    }

    const summary = this.formatSearchResults(result.data);
    return { success: true, data: summary };
  }

  /**
   * Search recent results (convenience method)
   */
  async searchRecent(
    query: string,
    timeRange: 'oneDay' | 'oneWeek' | 'oneMonth' = 'oneWeek'
  ): Promise<Result<WebSearchResult[]>> {
    return this.search({ query, timeRange });
  }

  /**
   * Search specific domains (convenience method)
   */
  async searchDomains(
    query: string,
    domains: string[]
  ): Promise<Result<WebSearchResult[]>> {
    return this.search({
      query,
      domainFilter: domains.join(','),
    });
  }

  /**
   * Transform raw MCP response to structured search results
   */
  private transformSearchResults(raw: unknown): WebSearchResult[] {
    // The actual transformation depends on the MCP server response format
    // This is a placeholder that assumes the response structure
    const response = raw as any;

    if (!Array.isArray(response)) {
      throw new McpError(
        this.toolName,
        'Invalid response format',
        'Expected array of search results'
      );
    }

    return response.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      summary: item.summary || '',
      siteName: item.siteName || item.site_name || '',
      favicon: item.favicon || item.favicon_url,
      publishedDate: item.publishedDate || item.published_date,
    }));
  }

  /**
   * Format search results as human-readable summary
   */
  private formatSearchResults(results: WebSearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    const lines = [
      `Found ${results.length} result(s):\n`,
      ...results.map((result, index) => {
        return [
          `${index + 1}. ${result.title}`,
          `   ${result.url}`,
          `   ${result.siteName}${result.publishedDate ? ` - ${result.publishedDate}` : ''}`,
          `   ${result.summary.substring(0, 200)}${result.summary.length > 200 ? '...' : ''}`,
        ].join('\n');
      }),
    ];

    return lines.join('\n\n');
  }
}

/**
 * Convenience function for quick web search
 */
export async function webSearch(
  query: string,
  options?: Partial<WebSearchOptions>
): Promise<Result<WebSearchResult[]>> {
  const client = new WebSearchClient();
  return client.search({ query, ...options });
}
