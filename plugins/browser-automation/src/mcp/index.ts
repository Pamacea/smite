/**
 * MCP Client Wrapper - Layer 1
 * Low-level abstraction over z.ai MCP servers
 *
 * This module provides type-safe, validated wrappers around all available MCP servers:
 * - web-search-prime: Web search with structured results
 * - web-reader: URL to markdown conversion
 * - zai-mcp-server: Multi-modal AI vision analysis
 * - zread: GitHub repository analysis
 *
 * @module @smite/browser-automation/mcp
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core types
  Result,
  IMcpClient,
  RetryConfig,

  // Web search types
  WebSearchOptions,
  WebSearchResult,

  // Web reader types
  ReadUrlOptions,
  WebReaderResponse,

  // Vision/analysis types
  AnalyzeImageOptions,
  UiToArtifactOptions,
  ExtractTextOptions,
  DiagnoseErrorOptions,
  AnalyzeDataVizOptions,
  UiDiffCheckOptions,
  UnderstandDiagramOptions,
  AnalyzeVideoOptions,

  // Repository types
  GetRepoStructureOptions,
  ReadRepoFileOptions,
  SearchRepoDocOptions,
} from './types.js';

// Import types for use in utility functions
import type { Result as TResult, RetryConfig as TRetryConfig } from './types.js';

// ============================================================================
// Error Class Exports
// ============================================================================

export {
  McpError,
  McpTimeoutError,
  McpRetryError,
  McpValidationError,
  DEFAULT_RETRY_CONFIG,
} from './types.js';

// ============================================================================
// Client Class Imports (for internal use in aggregators)
// ============================================================================

import { WebSearchClient } from './web-search-client.js';
import { WebReaderClient } from './web-reader-client.js';
import { VisionClient } from './vision-client.js';
import { RepoClient } from './repo-client.js';

// ============================================================================
// Client Class Exports
// ============================================================================

export { WebSearchClient, webSearch } from './web-search-client.js';
export { WebReaderClient, readUrl, readMultipleUrls } from './web-reader-client.js';
export {
  VisionClient,
  analyzeImage,
  extractTextFromScreenshot,
  uiToCode,
  diagnoseErrorScreenshot,
} from './vision-client.js';
export {
  RepoClient,
  getRepoStructure,
  readRepoFile,
  searchRepoDocs,
  analyzeGitHubRepo,
  type RepositoryAnalysis,
} from './repo-client.js';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if an MCP operation was successful
 *
 * @param result - Result object to check
 * @returns boolean - True if operation succeeded
 *
 * @example
 * ```typescript
 * const result = await webSearch('Browser MCP');
 * if (isSuccess(result)) {
 *   console.log(result.data);
 * }
 * ```
 */
export function isSuccess<T>(result: TResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Check if an MCP operation failed
 *
 * @param result - Result object to check
 * @returns boolean - True if operation failed
 *
 * @example
 * ```typescript
 * const result = await webSearch('Browser MCP');
 * if (isFailure(result)) {
 *   console.error(result.error);
 * }
 * ```
 */
export function isFailure<T>(result: TResult<T>): result is { success: false; error: Error } {
  return result.success === false;
}

/**
 * Extract data from a successful result, or throw if failed
 *
 * @param result - Result object
 * @returns T - The data if successful
 * @throws Error - If the operation failed
 *
 * @example
 * ```typescript
 * const result = await webSearch('Browser MCP');
 * const data = unwrap(result); // Throws if failed
 * ```
 */
export function unwrap<T>(result: TResult<T>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Extract data from a successful result, or return default if failed
 *
 * @param result - Result object
 * @param defaultValue - Default value to return if failed
 * @returns T - The data if successful, otherwise default value
 *
 * @example
 * ```typescript
 * const result = await webSearch('Browser MCP');
 * const data = unwrapOr(result, []);
 * ```
 */
export function unwrapOr<T>(result: TResult<T>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Map over successful result data
 *
 * @param result - Result object
 * @param fn - Transformation function
 * @returns Result<U> - Transformed result or same error
 *
 * @example
 * ```typescript
 * const result = await webSearch('Browser MCP');
 * const urls = map(result, (results) => results.map(r => r.url));
 * ```
 */
export function map<T, U>(
  result: TResult<T>,
  fn: (data: T) => U
): TResult<U> {
  if (result.success) {
    try {
      return { success: true, data: fn(result.data) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
  return result as unknown as TResult<U>;
}

/**
 * Chain multiple operations that return Results
 *
 * @param result - Initial result
 * @param fn - Function that returns a new Result
 * @returns Result<U> - Chained result or error
 *
 * @example
 * ```typescript
 * const searchResult = await webSearch('Browser MCP');
 * const urlsResult = andThen(searchResult, (results) => {
 *   return readMultipleUrls(results.map(r => r.url));
 * });
 * ```
 */
export function andThen<T, U>(
  result: TResult<T>,
  fn: (data: T) => Promise<TResult<U>>
): Promise<TResult<U>> {
  if (result.success) {
    return fn(result.data);
  }
  return Promise.resolve(result as unknown as TResult<U>);
}

/**
 * Retry an operation with custom retry logic
 *
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param delayMs - Delay between attempts in ms (default: 1000)
 * @returns Promise<T> - Result of successful attempt
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => webSearch('Browser MCP'),
 *   5,
 *   2000
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<TResult<T>>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<TResult<T>> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fn();

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't wait after the last attempt
    if (attempt < maxAttempts - 1) {
      await sleep(delayMs * (attempt + 1)); // Exponential backoff
    }
  }

  return { success: false, error: lastError || new Error('All retry attempts failed') };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute multiple operations in parallel
 *
 * @param fns - Array of functions to execute
 * @returns Promise<Result<T[]>> - Combined results or first error
 *
 * @example
 * ```typescript
 * const results = await all([
 *   () => webSearch('query1'),
 *   () => webSearch('query2'),
 *   () => webSearch('query3')
 * ]);
 * ```
 */
export async function all<T>(
  fns: Array<() => Promise<TResult<T>>>
): Promise<TResult<T[]>> {
  try {
    const results = await Promise.all(fns.map(fn => fn()));

    // Check if any failed
    const failures = results.filter(isFailure);
    if (failures.length > 0) {
      return {
        success: false,
        error: new Error(`${failures.length} operation(s) failed: ${failures[0].error?.message}`),
      };
    }

    // Extract data from successful results
    const data = results.map(result => unwrap(result));
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Execute operations in parallel and settle all (ignore failures)
 *
 * @param fns - Array of functions to execute
 * @returns Promise<Array<Result<T>>> - All results, successful or failed
 *
 * @example
 * ```typescript
 * const results = await allSettled([
 *   () => webSearch('query1'),
 *   () => webSearch('query2'),
 *   () => webSearch('query3')
 * ]);
 * const successful = results.filter(isSuccess);
 * ```
 */
export async function allSettled<T>(
  fns: Array<() => Promise<TResult<T>>>
): Promise<Array<TResult<T>>> {
  return Promise.all(fns.map(fn => fn()));
}

// ============================================================================
// Convenience Aggregators
// ============================================================================

/**
 * MCP Client Bundle
 * All clients in one object for easy access
 */
export class McpClients {
  public readonly webSearch = new WebSearchClient();
  public readonly webReader = new WebReaderClient();
  public readonly vision = new VisionClient();
  public readonly repo = new RepoClient();

  constructor(
    config?: {
      webSearch?: Partial<TRetryConfig>;
      webReader?: Partial<TRetryConfig>;
      vision?: Partial<TRetryConfig>;
      repo?: Partial<TRetryConfig>;
    }
  ) {
    if (config?.webSearch) {
      this.webSearch = new WebSearchClient({ ..._DEFAULT_RETRY_CONFIG, ...config.webSearch });
    }
    if (config?.webReader) {
      this.webReader = new WebReaderClient({ ..._DEFAULT_RETRY_CONFIG, ...config.webReader });
    }
    if (config?.vision) {
      this.vision = new VisionClient({ ..._DEFAULT_RETRY_CONFIG, ...config.vision });
    }
    if (config?.repo) {
      this.repo = new RepoClient({ ..._DEFAULT_RETRY_CONFIG, ...config.repo });
    }
  }
}

/**
 * Create a new MCP clients bundle
 *
 * @param config - Optional retry configuration for each client
 * @returns McpClients - Bundle of all MCP clients
 *
 * @example
 * ```typescript
 * const mcp = createMcpClients({
 *   webSearch: { maxAttempts: 5 },
 *   vision: { maxAttempts: 2 }
 * });
 *
 * const searchResults = await mcp.webSearch.search({ query: 'test' });
 * ```
 */
export function createMpClients(
  config?: {
    webSearch?: Partial<TRetryConfig>;
    webReader?: Partial<TRetryConfig>;
    vision?: Partial<TRetryConfig>;
    repo?: Partial<TRetryConfig>;
  }
): McpClients {
  return new McpClients(config);
}

// Import default retry config for use in createMcpClients
import { DEFAULT_RETRY_CONFIG as _DEFAULT_RETRY_CONFIG } from './types.js';
const DEFAULT_RETRY_CONFIG = _DEFAULT_RETRY_CONFIG;

// ============================================================================
// Utility Functions Export
// ============================================================================

export {
  researchWorkflow,
  competitorAnalysis,
  processUrls,
  extractLinksFromUrls,
  aggregateSearches,
  searchAndRead,
  safeExecute,
  withTimeout,
} from './utils.js';
