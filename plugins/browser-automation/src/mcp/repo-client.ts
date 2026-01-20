/**
 * GitHub Repository MCP Client Wrapper
 * Wraps mcp__zread__* tools
 */

import type {
  IMcpClient,
  Result,
  RetryConfig,
  GetRepoStructureOptions,
  ReadRepoFileOptions,
  SearchRepoDocOptions,
} from './types.js';
import {
  DEFAULT_RETRY_CONFIG,
  McpError,
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

      // Don't retry validation errors
      if (error instanceof McpError) {
        const isRetryable = !error.message.includes('validation') &&
                          !error.message.includes('invalid') &&
                          !error.message.includes('not found') &&
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
 * Validate GitHub repository name format
 */
function isValidRepoName(repoName: string): boolean {
  // Should be in format "owner/repo"
  const pattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
  return pattern.test(repoName);
}

/**
 * Repository structure entry
 */
export interface RepoStructureEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

/**
 * Repository Client
 * Wrapper for mcp__zread__ tools
 */
export class RepoClient implements IMcpClient {
  private available: boolean = true;

  constructor(private readonly retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  /**
   * Check if the MCP server is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Generic invoke method
   */
  async invoke<T>(tool: string, args: unknown): Promise<Result<T>> {
    try {
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis[`mcp__zread__${tool}`](args);
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
   * Get repository structure (directory tree)
   *
   * @param options - Repository structure options
   * @returns Promise<string> - Directory tree as string
   *
   * @example
   * ```typescript
   * const client = new RepoClient();
   * const result = await client.getRepoStructure({
   *   repoName: 'vitejs/vite',
   *   dirPath: '/src'
   * });
   * ```
   */
  async getRepoStructure(
    options: GetRepoStructureOptions
  ): Promise<Result<string>> {
    try {
      if (!options.repoName || typeof options.repoName !== 'string') {
        throw new McpError(
          'get_repo_structure',
          'Invalid repository name',
          'Repository name must be a non-empty string in format "owner/repo"'
        );
      }

      if (!isValidRepoName(options.repoName)) {
        throw new McpError(
          'get_repo_structure',
          'Invalid repository name format',
          'Repository name must be in format "owner/repo"'
        );
      }

      const args: Record<string, string> = {
        repo_name: options.repoName,
      };

      if (options.dirPath) {
        args.dir_path = options.dirPath;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zread__get_repo_structure(args);
      }, 'get_repo_structure', this.retryConfig);

      // Convert result to string representation
      const structure = this.formatStructure(result);

      return { success: true, data: structure };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read a file from a repository
   *
   * @param options - File reading options
   * @returns Promise<string> - File content
   *
   * @example
   * ```typescript
   * const client = new RepoClient();
   * const result = await client.readFile({
   *   repoName: 'vitejs/vite',
   *   filePath: '/README.md'
   * });
   * ```
   */
  async readFile(options: ReadRepoFileOptions): Promise<Result<string>> {
    try {
      if (!options.repoName || typeof options.repoName !== 'string') {
        throw new McpError(
          'read_file',
          'Invalid repository name',
          'Repository name must be a non-empty string in format "owner/repo"'
        );
      }

      if (!isValidRepoName(options.repoName)) {
        throw new McpError(
          'read_file',
          'Invalid repository name format',
          'Repository name must be in format "owner/repo"'
        );
      }

      if (!options.filePath || typeof options.filePath !== 'string') {
        throw new McpError(
          'read_file',
          'Invalid file path',
          'File path must be a non-empty string'
        );
      }

      const args = {
        repo_name: options.repoName,
        file_path: options.filePath,
      };

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zread__read_file(args);
      }, 'read_file', this.retryConfig);

      // Extract file content from response
      const content = this.extractFileContent(result);

      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Read multiple files from a repository
   *
   * @param repoName - Repository name
   * @param filePaths - Array of file paths to read
   * @returns Promise<Map<string, string>> - Map of file path to content
   */
  async readMultipleFiles(
    repoName: string,
    filePaths: string[]
  ): Promise<Result<Map<string, string>>> {
    try {
      const results = new Map<string, string>();
      const errors: Array<{ path: string; error: Error }> = [];

      // Process files in parallel batches of 3
      const batchSize = 3;
      for (let i = 0; i < filePaths.length; i += batchSize) {
        const batch = filePaths.slice(i, i + batchSize);
        const promises = batch.map(async (filePath) => {
          const result = await this.readFile({ repoName, filePath });
          return { filePath, result };
        });

        const batchResults = await Promise.all(promises);

        for (const { filePath, result } of batchResults) {
          if (result.success) {
            results.set(filePath, result.data);
          } else {
            errors.push({ path: filePath, error: result.error });
          }
        }
      }

      // If all failed, return error
      if (results.size === 0 && errors.length > 0) {
        throw new McpError(
          'read_multiple_files',
          'All files failed to read',
          errors.map(e => `${e.path}: ${e.error.message}`).join('; ')
        );
      }

      // Log partial failures if any
      if (errors.length > 0) {
        console.warn(
          `⚠️  Failed to read ${errors.length} file(s): ${errors.map(e => e.path).join(', ')}`
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
   * Search repository documentation
   *
   * @param options - Search options
   * @returns Promise<string> - Search results
   *
   * @example
   * ```typescript
   * const client = new RepoClient();
   * const result = await client.searchDoc({
   *   repoName: 'vitejs/vite',
   *   query: 'How to configure plugins',
   *   language: 'en'
   * });
   * ```
   */
  async searchDoc(options: SearchRepoDocOptions): Promise<Result<string>> {
    try {
      if (!options.repoName || typeof options.repoName !== 'string') {
        throw new McpError(
          'search_doc',
          'Invalid repository name',
          'Repository name must be a non-empty string in format "owner/repo"'
        );
      }

      if (!isValidRepoName(options.repoName)) {
        throw new McpError(
          'search_doc',
          'Invalid repository name format',
          'Repository name must be in format "owner/repo"'
        );
      }

      if (!options.query || typeof options.query !== 'string') {
        throw new McpError(
          'search_doc',
          'Invalid query',
          'Query must be a non-empty string'
        );
      }

      const args: Record<string, string> = {
        repo_name: options.repoName,
        query: options.query,
      };

      if (options.language) {
        args.language = options.language;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zread__search_doc(args);
      }, 'search_doc', this.retryConfig);

      // Format search results
      const formatted = this.formatSearchResults(result);

      return { success: true, data: formatted };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Analyze a repository (combination of structure, file reading, and search)
   *
   * @param repoName - Repository name
   * @param query - Optional query to search
   * @returns Promise<RepositoryAnalysis> - Comprehensive repository analysis
   */
  async analyzeRepository(
    repoName: string,
    query?: string
  ): Promise<Result<RepositoryAnalysis>> {
    try {
      if (!repoName || !isValidRepoName(repoName)) {
        throw new McpError(
          'analyze_repository',
          'Invalid repository name',
          'Repository name must be in format "owner/repo"'
        );
      }

      // Get structure
      const structureResult = await this.getRepoStructure({ repoName });
      if (!structureResult.success) {
        throw structureResult.error;
      }

      // Read README if exists
      let readmeContent: string | undefined;
      const readmeResult = await this.readFile({
        repoName,
        filePath: '/README.md',
      });
      if (readmeResult.success) {
        readmeContent = readmeResult.data;
      }

      // Search documentation if query provided
      let searchResults: string | undefined;
      if (query) {
        const searchResult = await this.searchDoc({
          repoName,
          query,
          language: 'en',
        });
        if (searchResult.success) {
          searchResults = searchResult.data;
        }
      }

      const analysis: RepositoryAnalysis = {
        repoName,
        structure: structureResult.data,
        readme: readmeContent,
        searchResults,
      };

      return { success: true, data: analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Format repository structure as readable tree
   */
  private formatStructure(raw: unknown): string {
    const response = raw as any;

    // The response should be a tree structure
    if (typeof response === 'string') {
      return response;
    }

    if (response.structure) {
      return response.structure;
    }

    // Try to format as tree
    if (Array.isArray(response)) {
      return response
        .map((entry: any) => {
          const prefix = entry.type === 'directory' ? '📁 ' : '📄 ';
          return `${prefix}${entry.name}`;
        })
        .join('\n');
    }

    return JSON.stringify(response, null, 2);
  }

  /**
   * Extract file content from response
   */
  private extractFileContent(raw: unknown): string {
    const response = raw as any;

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
      'read_file',
      'Invalid response format',
      'Could not extract file content from response'
    );
  }

  /**
   * Format search results
   */
  private formatSearchResults(raw: unknown): string {
    const response = raw as any;

    if (typeof response === 'string') {
      return response;
    }

    if (response.results) {
      return response.results;
    }

    if (Array.isArray(response)) {
      return response
        .map((result: any, index: number) => {
          return [
            `${index + 1}. ${result.title || 'Result'}`,
            result.url || result.path || '',
            result.summary || result.description || '',
          ]
            .filter(Boolean)
            .join('\n   ');
        })
        .join('\n\n');
    }

    return JSON.stringify(response, null, 2);
  }
}

/**
 * Repository analysis result
 */
export interface RepositoryAnalysis {
  repoName: string;
  structure: string;
  readme?: string;
  packageJson?: Record<string, unknown>;
  searchResults?: string;
}

/**
 * Convenience functions for quick repository operations
 */
export async function getRepoStructure(
  repoName: string,
  dirPath?: string
): Promise<Result<string>> {
  const client = new RepoClient();
  return client.getRepoStructure({ repoName, dirPath });
}

export async function readRepoFile(
  repoName: string,
  filePath: string
): Promise<Result<string>> {
  const client = new RepoClient();
  return client.readFile({ repoName, filePath });
}

export async function searchRepoDocs(
  repoName: string,
  query: string,
  language?: 'zh' | 'en'
): Promise<Result<string>> {
  const client = new RepoClient();
  return client.searchDoc({ repoName, query, language });
}

export async function analyzeGitHubRepo(
  repoName: string,
  query?: string
): Promise<Result<RepositoryAnalysis>> {
  const client = new RepoClient();
  return client.analyzeRepository(repoName, query);
}
