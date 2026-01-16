/**
 * Code Search API
 *
 * Main user-facing API for searching codebases using the unified search router.
 * Provides multiple search modes, filters, and output formats.
 *
 * @module api/search
 */

import { SearchRouter, SearchStrategy } from '../core/unified/index.js';

/**
 * Output format types
 */
export enum OutputFormat {
  /** JSON format for programmatic access */
  JSON = 'json',

  /** Table format for terminal display */
  TABLE = 'table',

  /** Diff format showing code changes */
  DIFF = 'diff',

  /** Summary format with key insights */
  SUMMARY = 'summary',
}

/**
 * Search filters
 */
export interface SearchFilters {
  /** File pattern filters (glob patterns) */
  filePatterns?: string[];

  /** Language filters (e.g., 'typescript', 'python') */
  languages?: string[];

  /** Date range filter (ISO 8601 dates) */
  dateRange?: {
    start?: string;
    end?: string;
  };

  /** Minimum file size in bytes */
  minFileSize?: number;

  /** Maximum file size in bytes */
  maxFileSize?: number;
}

/**
 * Code search options
 */
export interface CodeSearchOptions {
  /** Search strategy to use */
  strategy?: SearchStrategy;

  /** Maximum number of results to return */
  maxResults?: number;

  /** Output format */
  outputFormat?: OutputFormat;

  /** Search filters */
  filters?: SearchFilters;

  /** Whether to include context */
  includeContext?: boolean;

  /** Number of context lines */
  contextLines?: number;

  /** Minimum relevance score threshold (0-1) */
  minScore?: number;

  /** Whether to cache results */
  useCache?: boolean;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Whether to show progress */
  verbose?: boolean;
}

/**
 * Code search result with metadata
 */
export interface CodeSearchResult {
  /** File path */
  filePath: string;

  /** Line number */
  lineNumber: number;

  /** Matched content */
  content: string;

  /** Relevance score (0-1) */
  score: number;

  /** Context lines */
  context?: {
    before: string[];
    after: string[];
  };

  /** File metadata */
  metadata?: {
    language?: string;
    size?: number;
    lastModified?: string;
  };
}

/**
 * Code search response
 */
export interface CodeSearchResponse {
  /** Search results */
  results: CodeSearchResult[];

  /** Number of results */
  resultCount: number;

  /** Strategy used */
  strategy: SearchStrategy;

  /** Query analysis */
  queryAnalysis: {
    type: string;
    confidence: number;
    recommendedStrategy: string;
  };

  /** Execution time in milliseconds */
  executionTime: number;

  /** Whether results were from cache */
  fromCache: boolean;

  /** Formatted output (if requested) */
  formatted?: string;
}

/**
 * Code Search API class
 */
export class CodeSearchAPI {
  private router: SearchRouter;
  private defaultOptions: CodeSearchOptions;

  constructor(config?: { maxCacheSize?: number; cacheTTL?: number }) {
    this.router = new SearchRouter({
      cacheEnabled: true,
      maxCacheSize: config?.maxCacheSize || 100,
      cacheTTL: config?.cacheTTL || 300000,
    });

    this.defaultOptions = {
      strategy: SearchStrategy.AUTO,
      maxResults: 50,
      outputFormat: OutputFormat.JSON,
      includeContext: true,
      contextLines: 3,
      minScore: 0.3,
      useCache: true,
      timeout: 30000,
      verbose: false,
    };
  }

  /**
   * Search code with unified interface
   */
  async search(query: string, options?: CodeSearchOptions): Promise<CodeSearchResponse> {
    const startTime = Date.now();

    // Merge options with defaults
    const mergedOptions: CodeSearchOptions = {
      ...this.defaultOptions,
      ...options,
    };

    // Execute search through router
    const searchResult = await this.router.search(query, {
      strategy: mergedOptions.strategy,
      maxResults: mergedOptions.maxResults,
      filePatterns: mergedOptions.filters?.filePatterns,
      languages: mergedOptions.filters?.languages,
      includeContext: mergedOptions.includeContext,
      contextLines: mergedOptions.contextLines,
      minScore: mergedOptions.minScore,
      useCache: mergedOptions.useCache,
      timeout: mergedOptions.timeout,
    });

    // Transform results to CodeSearchResult format
    const results: CodeSearchResult[] = searchResult.results.map(r => ({
      filePath: r.filePath,
      lineNumber: r.lineNumber,
      content: r.content,
      score: r.score || 0,
      context: r.context,
      metadata: {
        // TODO: Add file metadata extraction
      },
    }));

    // Apply additional filters
    const filteredResults = this.applyFilters(results, mergedOptions.filters);

    // Format output if requested
    let formatted: string | undefined;
    if (mergedOptions.outputFormat !== OutputFormat.JSON) {
      formatted = this.formatOutput(filteredResults, mergedOptions.outputFormat!);
    }

    return {
      results: filteredResults,
      resultCount: filteredResults.length,
      strategy: searchResult.strategy,
      queryAnalysis: {
        type: searchResult.queryAnalysis.type,
        confidence: searchResult.queryAnalysis.confidence,
        recommendedStrategy: searchResult.queryAnalysis.recommendedStrategy,
      },
      executionTime: Date.now() - startTime,
      fromCache: searchResult.fromCache,
      formatted,
    };
  }

  /**
   * Apply filters to results
   */
  private applyFilters(results: CodeSearchResult[], filters?: SearchFilters): CodeSearchResult[] {
    if (!filters) return results;

    let filtered = results;

    // File pattern filters
    if (filters.filePatterns && filters.filePatterns.length > 0) {
      // TODO: Implement glob pattern matching
      // For now, just return all results
    }

    // Language filters
    if (filters.languages && filters.languages.length > 0) {
      // TODO: Implement language detection and filtering
      // For now, just return all results
    }

    // Date range filters
    if (filters.dateRange) {
      // TODO: Implement date range filtering
      // For now, just return all results
    }

    // File size filters
    if (filters.minFileSize || filters.maxFileSize) {
      // TODO: Implement file size filtering
      // For now, just return all results
    }

    return filtered;
  }

  /**
   * Format output according to specified format
   */
  private formatOutput(results: CodeSearchResult[], format: OutputFormat): string {
    switch (format) {
      case OutputFormat.TABLE:
        return this.formatAsTable(results);

      case OutputFormat.DIFF:
        return this.formatAsDiff(results);

      case OutputFormat.SUMMARY:
        return this.formatAsSummary(results);

      default:
        return JSON.stringify(results, null, 2);
    }
  }

  /**
   * Format results as table
   */
  private formatAsTable(results: CodeSearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    const lines: string[] = [];

    // Header
    lines.push('─'.repeat(120));
    lines.push(
      `${'File'.padEnd(40)} ${'Line'.padEnd(6)} ${'Score'.padEnd(6)} Content`
    );
    lines.push('─'.repeat(120));

    // Results
    for (const result of results) {
      const filePath = result.filePath.slice(-40).padEnd(40);
      const line = String(result.lineNumber).padEnd(6);
      const score = (result.score * 100).toFixed(0).padEnd(6) + '%';
      const content = result.content.slice(0, 60);

      lines.push(`${filePath} ${line} ${score} ${content}`);
    }

    lines.push('─'.repeat(120));
    lines.push(`Total: ${results.length} result(s)`);

    return lines.join('\n');
  }

  /**
   * Format results as diff
   */
  private formatAsDiff(results: CodeSearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    const lines: string[] = [];

    for (const result of results) {
      lines.push(`--- a/${result.filePath}`);
      lines.push(`+++ b/${result.filePath}`);
      lines.push(`@@ -${result.lineNumber},0 +${result.lineNumber},1 @@`);
      lines.push(`+${result.content}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format results as summary
   */
  private formatAsSummary(results: CodeSearchResult[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    const lines: string[] = [];

    lines.push(`Found ${results.length} result(s):\n`);

    // Group by file
    const byFile = new Map<string, CodeSearchResult[]>();
    for (const result of results) {
      const fileResults = byFile.get(result.filePath) || [];
      fileResults.push(result);
      byFile.set(result.filePath, fileResults);
    }

    // Summarize by file
    for (const [filePath, fileResults] of byFile.entries()) {
      lines.push(`📄 ${filePath}`);
      lines.push(`   Matches: ${fileResults.length}`);
      lines.push(
        `   Lines: ${fileResults.map(r => r.lineNumber).join(', ')}`
      );
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Clear the search cache
   */
  clearCache(): void {
    this.router.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.router.getCacheStats();
  }
}

/**
 * Quick access factory for creating code search API
 */
export function createCodeSearch(config?: {
  maxCacheSize?: number;
  cacheTTL?: number;
}): CodeSearchAPI {
  return new CodeSearchAPI(config);
}
