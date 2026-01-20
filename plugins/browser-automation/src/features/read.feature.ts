/**
 * Read Feature Module - Layer 2
 * High-level web content reading and extraction features
 *
 * This module provides convenient, domain-specific functions for reading web content
 * built on top of the MCP web-reader client.
 *
 * @module @smite/browser-automation/features/read
 */

import type {
  Result,
  ReadUrlOptions,
  WebReaderResponse,
} from '../mcp/types.js';
import {
  WebReaderClient,
  isSuccess,
  isFailure,
} from '../mcp/index.js';

// ============================================================================
// Feature-Specific Types
// ============================================================================

/**
 * Structured data extraction schema
 * Defines what data to extract from web content
 */
export interface ExtractionSchema {
  /**
   * Field names and their selectors/patterns
   */
  fields: Record<string, {
    /**
     * CSS selector (for DOM-based extraction) or regex pattern (for markdown-based)
     */
    selector?: string;
    pattern?: RegExp;
    /**
     * Attribute to extract (e.g., 'href', 'text')
     */
    attribute?: string;
    /**
     * Multiple values flag
     */
    multiple?: boolean;
  }>;
}

/**
 * Extracted structured data
 */
export type ExtractedData = Record<string, string | string[]>;

/**
 * Batch read results
 */
export interface BatchReadResults {
  /**
   * Map of URL to content (successful reads)
   */
  contents: Map<string, string>;
  /**
   * Map of URL to error (failed reads)
   */
  errors: Map<string, Error>;
  /**
   * Success rate (0-1)
   */
  successRate: number;
  /**
   * Total time in milliseconds
   */
  totalTime: number;
}

/**
 * Read feature options (extends MCP options)
 */
export interface ReadFeatureOptions extends Partial<ReadUrlOptions> {
  /**
   * Include metadata (images, links)
   */
  includeMetadata?: boolean;
  /**
   * Extract structured data
   */
  schema?: ExtractionSchema;
  /**
   * Custom timeout for batch operations
   */
  batchTimeout?: number;
}

// ============================================================================
// Read Feature Class
// ============================================================================

/**
 * Read Feature Module
 * Provides high-level web content reading functionality
 */
export class ReadFeature {
  private readonly client: WebReaderClient;

  constructor(client?: WebReaderClient) {
    this.client = client || new WebReaderClient();
  }

  // ========================================================================
  // Core Reading Functions
  // ========================================================================

  /**
   * Read a web page and convert to markdown
   *
   * @param url - URL to read
   * @param options - Reading options
   * @returns Promise<Result<string>> - Page content as markdown
   *
   * @example
   * ```typescript
   * const feature = new ReadFeature();
   * const result = await feature.readWebPage('https://example.com', {
   *   format: 'markdown',
   *   retainImages: true
   * });
   * ```
   */
  async readWebPage(
    url: string,
    options?: ReadFeatureOptions
  ): Promise<Result<string>> {
    const startTime = Date.now();

    try {
      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error('URL must be a non-empty string');
      }

      // Prepare MCP options
      const mcpOptions: ReadUrlOptions = {
        url,
        ...(options?.timeout !== undefined && { timeout: options.timeout }),
        ...(options?.retainImages !== undefined && { retainImages: options.retainImages }),
        ...(options?.withImagesSummary !== undefined && { withImagesSummary: options.withImagesSummary }),
        ...(options?.withLinksSummary !== undefined && { withLinksSummary: options.withLinksSummary }),
        ...(options?.useCache !== undefined && { useCache: options.useCache }),
        ...(options?.returnFormat && { returnFormat: options.returnFormat }),
        ...(options?.noGfm !== undefined && { noGfm: options.noGfm }),
        ...(options?.keepImgDataUrl !== undefined && { keepImgDataUrl: options.keepImgDataUrl }),
      };

      // Enable metadata if requested
      if (options?.includeMetadata) {
        mcpOptions.withImagesSummary = true;
        mcpOptions.withLinksSummary = true;
      }

      // Read URL
      const result = await this.client.readUrl(mcpOptions);

      if (isFailure(result)) {
        return result;
      }

      const elapsed = Date.now() - startTime;
      console.log(`✅ Read ${url} in ${elapsed}ms (${result.data.length} chars)`);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read a web page with enhanced metadata
   *
   * @param url - URL to read
   * @param options - Reading options
   * @returns Promise<Result<WebReaderResponse>> - Content with metadata
   *
   * @example
   * ```typescript
   * const feature = new ReadFeature();
   * const result = await feature.readWebPageWithMetadata('https://example.com');
   * if (result.success) {
   *   console.log('Content:', result.data.content);
   *   console.log('Images:', result.data.images);
   *   console.log('Links:', result.data.links);
   * }
   * ```
   */
  async readWebPageWithMetadata(
    url: string,
    options?: ReadFeatureOptions
  ): Promise<Result<WebReaderResponse>> {
    try {
      // Enable metadata extraction
      const enhancedOptions: ReadFeatureOptions = {
        ...options,
        includeMetadata: true,
        withImagesSummary: true,
        withLinksSummary: true,
      };

      const result = await this.readWebPage(url, enhancedOptions);

      if (isFailure(result)) {
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

  // ========================================================================
  // Structured Data Extraction
  // ========================================================================

  /**
   * Extract structured data from a web page
   *
   * @param url - URL to read
   * @param schema - Extraction schema defining what to extract
   * @param options - Reading options
   * @returns Promise<Result<ExtractedData>> - Structured data
   *
   * @example
   * ```typescript
   * const feature = new ReadFeature();
   * const result = await feature.extractStructuredData(
   *   'https://example.com',
   *   {
   *     fields: {
   *       title: { pattern: /^#\s+(.*)$/m },
   *       links: { selector: 'a[href]', attribute: 'href', multiple: true }
   *     }
   *   }
   * );
   * ```
   */
  async extractStructuredData(
    url: string,
    schema: ExtractionSchema,
    options?: ReadFeatureOptions
  ): Promise<Result<ExtractedData>> {
    try {
      // Read page content
      const pageResult = await this.readWebPage(url, options);

      if (isFailure(pageResult)) {
        return pageResult as Result<ExtractedData>;
      }

      const content = pageResult.data;
      const extracted: ExtractedData = {};

      // Extract each field based on schema
      for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
        try {
          if (fieldConfig.pattern) {
            // Regex-based extraction
            const matches = content.match(fieldConfig.pattern);
            if (matches) {
              extracted[fieldName] = fieldConfig.multiple ? matches : matches[1] || matches[0];
            }
          } else if (fieldConfig.selector) {
            // Selector-based extraction (from markdown)
            const values = this.extractBySelector(content, fieldConfig.selector, fieldConfig.attribute);
            extracted[fieldName] = fieldConfig.multiple ? values : values[0] || '';
          }
        } catch (error) {
          console.warn(`⚠️  Failed to extract field "${fieldName}":`, error);
        }
      }

      return { success: true, data: extracted };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Batch Processing
  // ========================================================================

  /**
   * Read multiple URLs in parallel with batching
   *
   * @param urls - Array of URLs to read
   * @param options - Reading options (applied to all URLs)
   * @returns Promise<BatchReadResults> - Batch processing results
   *
   * @example
   * ```typescript
   * const feature = new ReadFeature();
   * const results = await feature.batchRead([
   *   'https://example.com/page1',
   *   'https://example.com/page2',
   *   'https://example.com/page3'
   * ], {
   *   format: 'markdown',
   *   retainImages: false
   * });
   *
   * console.log(`Success rate: ${results.successRate * 100}%`);
   * for (const [url, content] of results.contents) {
   *   console.log(`${url}: ${content.length} chars`);
   * }
   * ```
   */
  async batchRead(
    urls: string[],
    options?: ReadFeatureOptions
  ): Promise<BatchReadResults> {
    const startTime = Date.now();
    const contents = new Map<string, string>();
    const errors = new Map<string, Error>();

    // Process URLs in parallel batches (concurrency limit: 5)
    const batchSize = 5;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      // Process batch in parallel
      const promises = batch.map(async (url) => {
        const result = await this.readWebPage(url, options);
        return { url, result };
      });

      const batchResults = await Promise.all(promises);

      // Collect results
      for (const { url, result } of batchResults) {
        if (isSuccess(result)) {
          contents.set(url, result.data);
        } else {
          errors.set(url, result.error);
        }
      }

      // Log progress
      const processed = Math.min(i + batchSize, urls.length);
      console.log(`📊 Progress: ${processed}/${urls.length} URLs processed`);
    }

    const totalTime = Date.now() - startTime;
    const successRate = urls.length > 0 ? contents.size / urls.length : 0;

    console.log(
      `✅ Batch complete: ${contents.size} successful, ${errors.size} failed ` +
      `(${(successRate * 100).toFixed(1)}% success rate in ${totalTime}ms)`
    );

    return {
      contents,
      errors,
      successRate,
      totalTime,
    };
  }

  /**
   * Read multiple URLs and return metadata for each
   *
   * @param urls - Array of URLs to read
   * @param options - Reading options
   * @returns Promise<Map<string, WebReaderResponse>> - URL to metadata mapping
   *
   * @example
   * ```typescript
   * const feature = new ReadFeature();
   * const results = await feature.batchReadWithMetadata([
   *   'https://example.com/page1',
   *   'https://example.com/page2'
   * ]);
   *
   * for (const [url, response] of results) {
   *   console.log(`${url}: ${response.images?.length || 0} images`);
   * }
   * ```
   */
  async batchReadWithMetadata(
    urls: string[],
    options?: ReadFeatureOptions
  ): Promise<Map<string, WebReaderResponse>> {
    const results = new Map<string, WebReaderResponse>();

    // Read in batches
    const batchResults = await this.batchRead(urls, {
      ...options,
      includeMetadata: true,
    });

    // Convert basic results to metadata results
    for (const [url, content] of batchResults.contents) {
      const response: WebReaderResponse = {
        content,
        images: this.extractImages(content),
        links: this.extractLinks(content),
      };
      results.set(url, response);
    }

    return results;
  }

  // ========================================================================
  // Content Analysis Utilities
  // ========================================================================

  /**
   * Extract all image URLs from markdown content
   *
   * @param content - Markdown content
   * @returns Array of image URLs
   */
  extractImages(content: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      if (match[1] && !match[1].startsWith('data:')) {
        images.push(match[1]);
      }
    }

    return images;
  }

  /**
   * Extract all link URLs from markdown content
   *
   * @param content - Markdown content
   * @returns Array of link URLs
   */
  extractLinks(content: string): string[] {
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

  /**
   * Extract text by selector from markdown content
   * (Simplified implementation for markdown)
   *
   * @param content - Markdown content
   * @param selector - CSS selector or pattern
   * @param attribute - Attribute to extract
   * @returns Array of extracted values
   */
  private extractBySelector(
    content: string,
    selector: string,
    attribute?: string
  ): string[] {
    // Simplified markdown-based extraction
    const values: string[] = [];

    // Extract links
    if (selector.includes('a') || selector.includes('href')) {
      const links = this.extractLinks(content);
      values.push(...links);
    }

    // Extract images
    if (selector.includes('img') || selector.includes('src')) {
      const images = this.extractImages(content);
      values.push(...images);
    }

    // Extract headings
    if (selector.includes('h1') || selector.includes('h2') || selector.includes('h3')) {
      const headingRegex = /^#{1,3}\s+(.*)$/gm;
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        values.push(match[1]);
      }
    }

    return values;
  }

  /**
   * Summarize page content (extract key sections)
   *
   * @param content - Page content
   * @returns Object with summary sections
   */
  summarizeContent(content: string): {
    title?: string;
    headings: string[];
    wordCount: number;
    imageCount: number;
    linkCount: number;
  } {
    // Extract title (first heading)
    const titleMatch = content.match(/^#\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1] : undefined;

    // Extract all headings
    const headingRegex = /^#{1,6}\s+(.*)$/gm;
    const headings: string[] = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1]);
    }

    // Count words
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    // Count images and links
    const imageCount = this.extractImages(content).length;
    const linkCount = this.extractLinks(content).length;

    return {
      title,
      headings,
      wordCount,
      imageCount,
      linkCount,
    };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Read a web page (convenience function)
 *
 * @param url - URL to read
 * @param options - Reading options
 * @returns Promise<Result<string>> - Page content
 */
export async function readWebPage(
  url: string,
  options?: ReadFeatureOptions
): Promise<Result<string>> {
  const feature = new ReadFeature();
  return feature.readWebPage(url, options);
}

/**
 * Read multiple URLs in batch (convenience function)
 *
 * @param urls - Array of URLs
 * @param options - Reading options
 * @returns Promise<BatchReadResults> - Batch results
 */
export async function batchRead(
  urls: string[],
  options?: ReadFeatureOptions
): Promise<BatchReadResults> {
  const feature = new ReadFeature();
  return feature.batchRead(urls, options);
}

/**
 * Extract structured data from a URL (convenience function)
 *
 * @param url - URL to read
 * @param schema - Extraction schema
 * @param options - Reading options
 * @returns Promise<Result<ExtractedData>> - Extracted data
 */
export async function extractStructuredData(
  url: string,
  schema: ExtractionSchema,
  options?: ReadFeatureOptions
): Promise<Result<ExtractedData>> {
  const feature = new ReadFeature();
  return feature.extractStructuredData(url, schema, options);
}
