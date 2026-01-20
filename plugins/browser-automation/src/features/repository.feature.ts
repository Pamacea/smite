/**
 * Repository Feature Module - Layer 2
 * High-level repository analysis features built on MCP client
 *
 * This module provides a rich API for GitHub repository analysis,
 * including file reading, structure exploration, search, and
 * comprehensive analysis workflows.
 *
 * @module @smite/browser-automation/features/repository
 */

import type {
  Result,
  GetRepoStructureOptions,
  ReadRepoFileOptions,
  SearchRepoDocOptions,
} from '../mcp/types.js';
import {
  RepoClient,
  type RepositoryAnalysis,
} from '../mcp/repo-client.js';

/**
 * Repository validation error
 */
export class RepositoryValidationError extends Error {
  constructor(
    public field: string,
    public value: string,
    message: string
  ) {
    super(message);
    this.name = 'RepositoryValidationError';
  }
}

/**
 * Repository analysis options
 */
export interface AnalyzeRepositoryOptions {
  owner: string;
  repo: string;
  includeReadme?: boolean;
  includePackageJson?: boolean;
  searchQuery?: string;
  maxFiles?: number;
}

/**
 * Batch read options
 */
export interface BatchReadOptions {
  owner: string;
  repo: string;
  filePaths: string[];
  continueOnError?: boolean;
  maxConcurrent?: number;
}

/**
 * File read result
 */
export interface FileReadResult {
  path: string;
  content: string;
  size: number;
  success: boolean;
  error?: string;
}

/**
 * Repository insight
 */
export interface RepositoryInsight {
  repoName: string;
  language?: string;
  mainFiles: Array<{ path: string; purpose: string }>;
  dependencies?: string[];
  keyTopics: string[];
  description?: string;
}

/**
 * Repository Feature Class
 * Provides high-level repository analysis operations
 */
export class RepositoryFeature {
  constructor(private mcp: RepoClient = new RepoClient()) {}

  /**
   * Parse owner/repo string
   *
   * @param repoName - Repository name in "owner/repo" format
   * @returns Object with owner and repo
   * @throws RepositoryValidationError if format is invalid
   *
   * @example
   * ```typescript
   * const { owner, repo } = feature.parseRepoName('vitejs/vite');
   * // { owner: 'vitejs', repo: 'vite' }
   * ```
   */
  parseRepoName(repoName: string): { owner: string; repo: string } {
    const parts = repoName.split('/');

    if (parts.length !== 2) {
      throw new RepositoryValidationError(
        'repoName',
        repoName,
        `Invalid repository name format: "${repoName}". Expected "owner/repo".`
      );
    }

    const [owner, repo] = parts;

    if (!owner || !repo) {
      throw new RepositoryValidationError(
        'repoName',
        repoName,
        `Owner and repo cannot be empty in "${repoName}"`
      );
    }

    // Validate characters (alphanumeric, hyphens, underscores, dots)
    const validPattern = /^[a-zA-Z0-9_.-]+$/;

    if (!validPattern.test(owner)) {
      throw new RepositoryValidationError(
        'owner',
        owner,
        `Invalid owner name: "${owner}". Contains invalid characters.`
      );
    }

    if (!validPattern.test(repo)) {
      throw new RepositoryValidationError(
        'repo',
        repo,
        `Invalid repository name: "${repo}". Contains invalid characters.`
      );
    }

    return { owner, repo };
  }

  /**
   * Read a file from a repository
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param filePath - Path to file (e.g., '/README.md')
   * @returns Promise<Result<string>> - File content
   *
   * @example
   * ```typescript
   * const result = await feature.readRepoFile('vitejs', 'vite', '/README.md');
   * if (result.success) {
   *   console.log(result.data);
   * }
   * ```
   */
  async readRepoFile(
    owner: string,
    repo: string,
    filePath: string
  ): Promise<Result<string>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);

      if (!filePath || typeof filePath !== 'string') {
        throw new RepositoryValidationError(
          'filePath',
          filePath,
          'File path must be a non-empty string'
        );
      }

      // Normalize file path
      const normalizedPath = filePath.startsWith('/')
        ? filePath
        : `/${filePath}`;

      // Call MCP client
      const result = await this.mcp.readFile({
        repoName: `${parsed.owner}/${parsed.repo}`,
        filePath: normalizedPath,
      });

      return result;
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
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param dir - Optional directory path (e.g., '/src')
   * @returns Promise<Result<string>> - Directory tree as string
   *
   * @example
   * ```typescript
   * const result = await feature.getRepoStructure('vitejs', 'vite', '/src');
   * if (result.success) {
   *   console.log(result.data); // Tree structure
   * }
   * ```
   */
  async getRepoStructure(
    owner: string,
    repo: string,
    dir?: string
  ): Promise<Result<string>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);

      // Call MCP client
      const result = await this.mcp.getRepoStructure({
        repoName: `${parsed.owner}/${parsed.repo}`,
        dirPath: dir,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Search repository documentation, issues, and commits
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param query - Search query
   * @param language - Optional language hint ('zh' or 'en')
   * @returns Promise<Result<string>> - Search results
   *
   * @example
   * ```typescript
   * const result = await feature.searchRepoDocs(
   *   'vitejs',
   *   'vite',
   *   'How to configure plugins',
   *   'en'
   * );
   * if (result.success) {
   *   console.log(result.data);
   * }
   * ```
   */
  async searchRepoDocs(
    owner: string,
    repo: string,
    query: string,
    language?: 'zh' | 'en'
  ): Promise<Result<string>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new RepositoryValidationError(
          'query',
          query,
          'Query must be a non-empty string'
        );
      }

      // Call MCP client
      const result = await this.mcp.searchDoc({
        repoName: `${parsed.owner}/${parsed.repo}`,
        query: query.trim(),
        language,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Analyze a repository comprehensively
   *
   * Combines structure, readme, and optional search to provide
   * a complete repository overview.
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param options - Analysis options
   * @returns Promise<Result<RepositoryAnalysis>> - Comprehensive analysis
   *
   * @example
   * ```typescript
   * const result = await feature.analyzeRepo('vitejs', 'vite', {
   *   includeReadme: true,
   *   includePackageJson: true,
   *   searchQuery: 'configuration'
   * });
   * ```
   */
  async analyzeRepo(
    owner: string,
    repo: string,
    options: Partial<AnalyzeRepositoryOptions> = {}
  ): Promise<Result<RepositoryAnalysis>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);

      const repoName = `${parsed.owner}/${parsed.repo}`;
      const {
        includeReadme = true,
        includePackageJson = false,
        searchQuery,
      } = options;

      // Get structure
      const structureResult = await this.mcp.getRepoStructure({
        repoName,
      });

      if (!structureResult.success) {
        throw structureResult.error;
      }

      const analysis: RepositoryAnalysis = {
        repoName,
        structure: structureResult.data,
      };

      // Read README if requested
      if (includeReadme) {
        const readmeResult = await this.mcp.readFile({
          repoName,
          filePath: '/README.md',
        });

        if (readmeResult.success) {
          analysis.readme = readmeResult.data;
        }
      }

      // Read package.json if requested (for Node.js projects)
      if (includePackageJson) {
        const pkgResult = await this.mcp.readFile({
          repoName,
          filePath: '/package.json',
        });

        if (pkgResult.success) {
          analysis.packageJson = pkgResult.data as any;
        }
      }

      // Search if query provided
      if (searchQuery) {
        const searchResult = await this.mcp.searchDoc({
          repoName,
          query: searchQuery,
          language: 'en',
        });

        if (searchResult.success) {
          analysis.searchResults = searchResult.data;
        }
      }

      return { success: true, data: analysis };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Batch read multiple files from a repository
   *
   * Reads multiple files in parallel batches to optimize performance.
   * Useful for analyzing multiple related files at once.
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param filePaths - Array of file paths to read
   * @param continueOnError - Continue reading other files if one fails (default: true)
   * @param maxConcurrent - Maximum concurrent requests (default: 3)
   * @returns Promise<Result<FileReadResult[]>> - Array of file read results
   *
   * @example
   * ```typescript
   * const result = await feature.batchReadFiles(
   *   'vitejs',
   *   'vite',
   *   ['/README.md', '/package.json', '/LICENSE'],
   *   true,
   *   3
   * );
   * ```
   */
  async batchReadFiles(
    owner: string,
    repo: string,
    filePaths: string[],
    continueOnError: boolean = true,
    maxConcurrent: number = 3
  ): Promise<Result<FileReadResult[]>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);

      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        throw new RepositoryValidationError(
          'filePaths',
          JSON.stringify(filePaths),
          'File paths must be a non-empty array'
        );
      }

      const repoName = `${parsed.owner}/${parsed.repo}`;
      const results: FileReadResult[] = [];
      const errors: Error[] = [];

      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < filePaths.length; i += maxConcurrent) {
        const batch = filePaths.slice(i, i + maxConcurrent);

        const batchPromises = batch.map(async (filePath) => {
          const normalizedPath = filePath.startsWith('/')
            ? filePath
            : `/${filePath}`;

          const result = await this.mcp.readFile({
            repoName,
            filePath: normalizedPath,
          });

          return {
            path: filePath,
            content: result.success ? result.data : '',
            size: result.success ? result.data.length : 0,
            success: result.success,
            error: result.success ? undefined : result.error?.message,
          };
        });

        const batchResults = await Promise.all(batchPromises);

        for (const result of batchResults) {
          results.push(result);

          if (!result.success && !continueOnError) {
            errors.push(new Error(result.error || `Failed to read ${result.path}`));
          }
        }

        // If not continuing on error and we have errors, stop
        if (!continueOnError && errors.length > 0) {
          throw errors[0];
        }
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
   * Get repository insights
   *
   * Analyzes repository to extract key insights like language,
   * main files, dependencies, and topics.
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Promise<Result<RepositoryInsight>> - Repository insights
   *
   * @example
   * ```typescript
   * const result = await feature.getRepositoryInsights('vitejs', 'vite');
   * if (result.success) {
   *   console.log('Language:', result.data.language);
   *   console.log('Dependencies:', result.data.dependencies);
   * }
   * ```
   */
  async getRepositoryInsights(
    owner: string,
    repo: string
  ): Promise<Result<RepositoryInsight>> {
    try {
      // Validate inputs
      const parsed = this.parseRepoName(`${owner}/${repo}`);
      const repoName = `${parsed.owner}/${parsed.repo}`;

      const insight: RepositoryInsight = {
        repoName,
        keyTopics: [],
        mainFiles: [],
      };

      // Try to read README for description
      const readmeResult = await this.mcp.readFile({
        repoName,
        filePath: '/README.md',
      });

      if (readmeResult.success) {
        // Extract first paragraph as description
        const firstParagraph = readmeResult.data
          .split('\n\n')[0]
          .replace(/[#*`]/g, '')
          .trim();
        insight.description = firstParagraph.substring(0, 200);

        // Extract common topics (keywords in headings)
        const headings = readmeResult.data.match(/^#+\s+(.*)$/gm) || [];
        insight.keyTopics = headings
          .map(h => h.replace(/^#+\s+/, '').toLowerCase())
          .filter(h => h.length > 3 && h.length < 30)
          .slice(0, 5);
      }

      // Try to read package.json for Node.js projects
      const pkgResult = await this.mcp.readFile({
        repoName,
        filePath: '/package.json',
      });

      if (pkgResult.success) {
        try {
          const pkg = JSON.parse(pkgResult.data);

          // Get language from package.json
          insight.language = 'TypeScript/JavaScript';

          // Get dependencies
          const deps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
          };
          insight.dependencies = Object.keys(deps).slice(0, 10);

          // Identify main files
          if (pkg.main) {
            insight.mainFiles.push({ path: pkg.main, purpose: 'entry point' });
          }
          if (pkg.bin) {
            const binPath = typeof pkg.bin === 'string' ? pkg.bin : Object.keys(pkg.bin)[0];
            insight.mainFiles.push({ path: binPath, purpose: 'CLI executable' });
          }
        } catch {
          // Invalid JSON, skip
        }
      }

      // Try to detect language from structure
      if (!insight.language) {
        const structureResult = await this.mcp.getRepoStructure({ repoName });

        if (structureResult.success) {
          const structure = structureResult.data.toLowerCase();

          if (structure.includes('.py')) {
            insight.language = 'Python';
          } else if (structure.includes('.go')) {
            insight.language = 'Go';
          } else if (structure.includes('.rs')) {
            insight.language = 'Rust';
          } else if (structure.includes('.java')) {
            insight.language = 'Java';
          } else if (structure.includes('.ts') || structure.includes('.tsx')) {
            insight.language = 'TypeScript';
          } else if (structure.includes('.js') || structure.includes('.jsx')) {
            insight.language = 'JavaScript';
          }
        }
      }

      return { success: true, data: insight };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

/**
 * Create a repository feature instance
 *
 * @param mcp - Optional MCP client (defaults to new RepoClient)
 * @returns RepositoryFeature instance
 *
 * @example
 * ```typescript
 * const feature = createRepositoryFeature();
 * const result = await feature.readRepoFile('vitejs', 'vite', '/README.md');
 * ```
 */
export function createRepositoryFeature(
  mcp?: RepoClient
): RepositoryFeature {
  return new RepositoryFeature(mcp);
}

// Default export
export default RepositoryFeature;
