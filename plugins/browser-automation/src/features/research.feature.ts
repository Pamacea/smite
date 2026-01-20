/**
 * Research Feature Module - Layer 2
 * High-level research functionality combining search and read
 *
 * This module provides a convenient wrapper combining search and read operations
 * for research workflows. It's mainly used by integration tests.
 *
 * @module @smite/browser-automation/features/research
 */

import { SearchFeature } from './search.feature.js';
import { ReadFeature } from './read.feature.js';
import type {
  Result,
  WebSearchResult,
} from '../mcp/types.js';

// ============================================================================
// Research Feature Class
// ============================================================================

/**
 * Research feature combining search and read capabilities
 */
export class ResearchFeature {
  private searchFeature: SearchFeature;
  private readFeature: ReadFeature;

  constructor() {
    this.searchFeature = new SearchFeature();
    this.readFeature = new ReadFeature();
  }

  /**
   * Search the web
   */
  async searchWeb(
    query: string,
    timeRange?: 'oneDay' | 'oneWeek' | 'oneMonth' | 'oneYear' | 'noLimit',
    domainFilter?: string[]
  ): Promise<Result<WebSearchResult[]>> {
    return this.searchFeature.searchWeb(query, {
      timeRange,
      domainFilter,
    });
  }

  /**
   * Read a web page
   */
  async readUrl(
    url: string,
    options?: { timeout?: number }
  ): Promise<Result<{ content: string }>> {
    const result = await this.readFeature.readWebPage(url, options);

    if (!result.success) {
      return result;
    }

    // Wrap string content in object for compatibility with tests
    return {
      success: true,
      data: {
        content: result.data,
      },
    };
  }
}
