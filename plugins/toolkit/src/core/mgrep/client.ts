/**
 * mgrep Client - CLI wrapper for mgrep semantic search
 *
 * Provides interface to mgrep CLI for semantic code search with:
 * - Command execution (search, watch, mcp)
 * - JSON output parsing
 * - Error handling and availability checking
 * - Result normalization
 */

import { spawn } from 'child_process';
import chalk from 'chalk';

/**
 * mgrep command types
 */
export enum MgrepCommand {
  SEARCH = 'search',
  WATCH = 'watch',
  MCP = 'mcp',
}

/**
 * mgrep search options
 */
export interface MgrepSearchOptions {
  /** Case-insensitive search */
  caseInsensitive?: boolean;
  /** Recursive search */
  recursive?: boolean;
  /** Maximum number of results (default: 10) */
  maxCount?: number;
  /** Show content of results */
  content?: boolean;
  /** Generate answer based on results */
  answer?: boolean;
  /** Sync local files before searching */
  sync?: boolean;
  /** Dry run (no actual syncing) */
  dryRun?: boolean;
  /** Disable reranking */
  noRerank?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum file count */
  maxFileCount?: number;
  /** Include web search results */
  web?: boolean;
}

/**
 * mgrep search result item
 */
export interface MgrepSearchResult {
  /** File path */
  file: string;
  /** Relevance score (0-1) */
  score: number;
  /** Matching code snippet */
  snippet?: string;
  /** Start line number */
  startLine?: number;
  /** End line number */
  endLine?: number;
  /** Generated answer (if --answer enabled) */
  answer?: string;
}

/**
 * mgrep execution result
 */
export interface MgrepResult {
  /** Success status */
  success: boolean;
  /** Search results */
  results?: MgrepSearchResult[];
  /** Error message if failed */
  error?: string;
  /** Raw output */
  rawOutput?: string;
}

/**
 * mgrep client configuration
 */
export interface MgrepClientConfig {
  /** Path to mgrep executable (default: 'mgrep') */
  executable?: string;
  /** Default max results */
  defaultMaxCount?: number;
  /** Default rerank setting */
  defaultRerank?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Default configuration
 */
export const DEFAULT_MGREP_CLIENT_CONFIG: MgrepClientConfig = {
  executable: 'mgrep',
  defaultMaxCount: 20,
  defaultRerank: true,
  timeout: 30000, // 30 seconds
};

/**
 * mgrep Client class
 */
export class MgrepClient {
  private config: MgrepClientConfig;
  private available: boolean | null = null;

  constructor(config: Partial<MgrepClientConfig> = {}) {
    this.config = { ...DEFAULT_MGREP_CLIENT_CONFIG, ...config };
  }

  /**
   * Check if mgrep is available
   */
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) {
      return this.available;
    }

    return new Promise((resolve) => {
      const proc = spawn(this.config.executable!, ['--version']);

      proc.on('error', () => {
        this.available = false;
        resolve(false);
      });

      proc.on('close', (code) => {
        this.available = code === 0;
        resolve(this.available);
      });

      setTimeout(() => {
        proc.kill();
        this.available = false;
        resolve(false);
      }, this.config.timeout);
    });
  }

  /**
   * Execute mgrep command
   */
  private async executeCommand(
    args: string[],
    timeout?: number
  ): Promise<MgrepResult> {
    const actualTimeout = timeout ?? this.config.timeout;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const proc = spawn(this.config.executable!, args);

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (error) => {
        resolve({
          success: false,
          error: `mgrep execution failed: ${error.message}`,
        });
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            results: this.parseResults(stdout),
            rawOutput: stdout,
          });
        } else {
          resolve({
            success: false,
            error: stderr || `mgrep exited with code ${code}`,
            rawOutput: stdout,
          });
        }
      });

      setTimeout(() => {
        proc.kill();
        resolve({
          success: false,
          error: `mgrep timeout after ${actualTimeout}ms`,
        });
      }, actualTimeout);
    });
  }

  /**
   * Parse mgrep output
   * Note: mgrep doesn't currently support JSON output, so we parse text format
   */
  private parseResults(output: string): MgrepSearchResult[] {
    const results: MgrepSearchResult[] = [];
    const lines = output.split('\n').filter((line) => line.trim());

    // Parse output format:
    // file:line:line:score:snippet
    // or
    // file:score
    for (const line of lines) {
      // Skip non-result lines
      if (!line.includes(':') || line.startsWith('◆') || line.startsWith('│')) {
        continue;
      }

      const parts = line.split(':');
      if (parts.length < 2) continue;

      const file = parts[0];
      const score = parseFloat(parts[parts.length - 2] || parts[1]);

      if (isNaN(score)) continue;

      results.push({
        file,
        score: Math.min(1, Math.max(0, score)), // Normalize to 0-1
        snippet: parts.length > 3 ? parts.slice(2, -1).join(':') : undefined,
        startLine: parts.length > 3 ? parseInt(parts[1]) : undefined,
        endLine: parts.length > 4 ? parseInt(parts[2]) : undefined,
      });
    }

    return results;
  }

  /**
   * Build mgrep search arguments
   */
  private buildSearchArgs(
    query: string,
    path?: string,
    options: MgrepSearchOptions = {}
  ): string[] {
    const args: string[] = ['search'];

    if (options.caseInsensitive) args.push('-i');
    if (options.recursive) args.push('-r');
    if (options.content) args.push('-c');
    if (options.answer) args.push('-a');
    if (options.sync) args.push('-s');
    if (options.dryRun) args.push('-d');
    if (options.noRerank) args.push('--no-rerank');
    if (options.web) args.push('-w');

    if (options.maxCount !== undefined) {
      args.push('--max-count', options.maxCount.toString());
    }
    if (options.maxFileSize !== undefined) {
      args.push('--max-file-size', options.maxFileSize.toString());
    }
    if (options.maxFileCount !== undefined) {
      args.push('--max-file-count', options.maxFileCount.toString());
    }

    args.push(query);

    if (path) {
      args.push(path);
    }

    return args;
  }

  /**
   * Execute semantic search
   */
  async search(
    query: string,
    path?: string,
    options: MgrepSearchOptions = {}
  ): Promise<MgrepResult> {
    if (!(await this.isAvailable())) {
      return {
        success: false,
        error: 'mgrep is not available or not installed',
      };
    }

    // Apply defaults
    const searchOptions: MgrepSearchOptions = {
      maxCount: this.config.defaultMaxCount,
      noRerank: !this.config.defaultRerank,
      recursive: true,
      ...options,
    };

    const args = this.buildSearchArgs(query, path, searchOptions);
    return this.executeCommand(args);
  }

  /**
   * Start watch mode
   */
  async watch(
    query: string,
    path?: string,
    options: MgrepSearchOptions = {}
  ): Promise<MgrepResult> {
    if (!(await this.isAvailable())) {
      return {
        success: false,
        error: 'mgrep is not available or not installed',
      };
    }

    const args = ['watch', query];
    if (path) args.push(path);

    return this.executeCommand(args);
  }

  /**
   * Start MCP server
   */
  async startMcp(): Promise<MgrepResult> {
    if (!(await this.isAvailable())) {
      return {
        success: false,
        error: 'mgrep is not available or not installed',
      };
    }

    const args = ['mcp'];
    return this.executeCommand(args, 0); // No timeout for server
  }

  /**
   * Get mgrep version
   */
  async getVersion(): Promise<string | null> {
    const result = await this.executeCommand(['--version']);
    if (result.success && result.rawOutput) {
      return result.rawOutput.trim();
    }
    return null;
  }
}
