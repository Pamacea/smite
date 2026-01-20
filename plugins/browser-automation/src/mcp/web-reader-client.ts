/**
 * Web Reader MCP Client Wrapper
 * Wraps mcp__web-reader__webReader
 */

import type {
  IMcpClient,
  Result,
  ReadUrlOptions,
  WebReaderResponse,
  RetryConfig,
} from './types.js';
import {
  DEFAULT_RETRY_CONFIG,
  McpError,
} from './types.js';
import {
  Cache,
  generateCacheKey,
  webReaderCache,
} from '../utils/cache.js';
import { metrics } from '../utils/metrics.js';

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

      // Don't retry if it's a validation error
      if (error instanceof McpError) {
        const isRetryable = !error.message.includes('validation') &&
                          !error.message.includes('invalid') &&
                          !error.message.includes('400') &&
                          !error.message.includes('404');

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

  throw new McpError(toolName, lastError, `Tool ${toolName} failed after ${config.maxAttempts} attempts`);
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Web Reader Client
 * Wrapper for mcp__web-reader__webReader
 */
export class WebReaderClient implements IMcpClient {
  private readonly toolName = 'webReader';
  private available: boolean = true;
  private readonly cache: Cache<string>;

  constructor(
    private readonly retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
    cache?: Cache<string>
  ) {
    // Use provided cache or default global cache
    this.cache = cache ?? webReaderCache;
  }

  /**
   * Check if the MCP server is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Invoke the web reader tool directly
   */
  async invoke<T>(tool: string, args: unknown): Promise<Result<T>> {
    try {
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis.mcp__web_reader__webReader(args);
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
   * Read a URL and convert to LLM-friendly format
   *
   * @param options - URL reading options
   * @returns Promise<string> - Content in markdown or text format
   *
   * @example
   * ```typescript
   * const client = new WebReaderClient();
   * const result = await client.readUrl({
   *   url: 'https://example.com',
   *   retainImages: true,
   *   withImagesSummary: true,
   *   returnFormat: 'markdown'
   * });
   * ```
   */
  async readUrl(options: ReadUrlOptions): Promise<Result<string>> {
    const metric = metrics.start('web-reader');

    try {
      // Validate URL
      if (!options.url || typeof options.url !== 'string') {
        throw new McpError(
          this.toolName,
          'Invalid URL',
          'URL must be a non-empty string'
        );
      }

      if (!isValidUrl(options.url)) {
        throw new McpError(
          this.toolName,
          'Invalid URL format',
          `URL "${options.url}" is not valid`
        );
      }

      // Check cache first (unless explicitly disabled)
      if (options.useCache !== false) {
        const cacheKey = generateCacheKey('web-reader', options);
        const cached = this.cache.get(cacheKey);

        if (cached !== undefined) {
          console.log(`✅ Cache hit for ${options.url}`);
          metrics.end(metric, true, true, cached.length);
          return { success: true, data: cached };
        }
      }

      // Prepare arguments for MCP tool
      const args: Record<string, any> = {
        url: options.url.trim(),
        ...(options.timeout !== undefined && { timeout: options.timeout }),
        ...(options.retainImages !== undefined && { retain_images: options.retainImages }),
        ...(options.withImagesSummary !== undefined && { with_images_summary: options.withImagesSummary }),
        ...(options.withLinksSummary !== undefined && { with_links_summary: options.withLinksSummary }),
        ...(options.useCache !== undefined && { no_cache: !options.useCache }),
        ...(options.returnFormat && { return_format: options.returnFormat }),
        ...(options.noGfm !== undefined && { no_gfm: options.noGfm }),
        ...(options.keepImgDataUrl !== undefined && { keep_img_data_url: options.keepImgDataUrl }),
      };

      // Execute read with retry
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis.mcp__web_reader__webReader(args);
      }, this.toolName, this.retryConfig);

      // Extract content from response
      const content = this.extractContent(result);

      // Cache the result (unless explicitly disabled)
      if (options.useCache !== false) {
        const cacheKey = generateCacheKey('web-reader', options);
        this.cache.set(cacheKey, content);
      }

      metrics.end(metric, true, false, content.length);
      return { success: true, data: content };
    } catch (error) {
      metrics.end(metric, false);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read multiple URLs in parallel
   *
   * @param urls - Array of URLs to read
   * @param options - Optional reading options (applied to all URLs)
   * @returns Promise<Map<string, string>> - Map of URL to content
   */
  async readMultiple(
    urls: string[],
    options?: Partial<ReadUrlOptions>
  ): Promise<Result<Map<string, string>>> {
    try {
      const results = new Map<string, string>();
      const errors: Array<{ url: string; error: Error }> = [];

      // Process URLs in parallel batches of 5
      const batchSize = 5;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const promises = batch.map(async (url) => {
          const result = await this.readUrl({ url, ...options });
          return { url, result };
        });

        const batchResults = await Promise.all(promises);

        for (const { url, result } of batchResults) {
          if (result.success) {
            results.set(url, result.data);
          } else {
            errors.push({ url, error: result.error });
          }
        }
      }

      // If all failed, return error
      if (results.size === 0 && errors.length > 0) {
        throw new McpError(
          this.toolName,
          'All URLs failed',
          errors.map(e => `${e.url}: ${e.error.message}`).join('; ')
        );
      }

      // Log partial failures if any
      if (errors.length > 0) {
        console.warn(
          `⚠️  Failed to read ${errors.length} URL(s): ${errors.map(e => e.url).join(', ')}`
        );
      }

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read URL with enhanced metadata
   *
   * @param options - URL reading options
   * @returns Promise<WebReaderResponse> - Content with metadata
   */
  async readUrlWithMetadata(
    options: ReadUrlOptions
  ): Promise<Result<WebReaderResponse>> {
    try {
      // Enable image and link summaries for metadata
      const enhancedOptions: ReadUrlOptions = {
        ...options,
        withImagesSummary: true,
        withLinksSummary: true,
      };

      const result = await this.readUrl(enhancedOptions);

      if (!result.success) {
        return result as Result<WebReaderResponse>;
      }

      // Extract metadata from content
      const response: WebReaderResponse = {
        content: result.data,
        images: this.extractImages(result.data),
        links: this.extractLinks(result.data),
      };

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Extract plain text content from MCP response
   */
  private extractContent(raw: unknown): string {
    const response = raw as any;

    // Handle different response formats
    if (typeof response === 'string') {
      return response;
    }

    if (response.content) {
      return response.content;
    }

    if (response.data) {
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }

    throw new McpError(
      this.toolName,
      'Invalid response format',
      'Could not extract content from response'
    );
  }

  /**
   * Extract image URLs from markdown content
   */
  private extractImages(content: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      if (match[1]) {
        images.push(match[1]);
      }
    }

    return images;
  }

  /**
   * Extract link URLs from markdown content
   */
  private extractLinks(content: string): string[] {
    const linkRegex = /\[.*?\]\((.*?)\)/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match[1] && !match[1].startsWith('data:')) {
        links.push(match[1]);
      }
    }

    return links;
  }
}

/**
 * Convenience function for quick URL reading
 */
export async function readUrl(
  url: string,
  options?: Partial<ReadUrlOptions>
): Promise<Result<string>> {
  const client = new WebReaderClient();
  return client.readUrl({ url, ...options });
}

/**
 * Convenience function for reading multiple URLs
 */
export async function readMultipleUrls(
  urls: string[],
  options?: Partial<ReadUrlOptions>
): Promise<Result<Map<string, string>>> {
  const client = new WebReaderClient();
  return client.readMultiple(urls, options);
}
