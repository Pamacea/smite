/**
 * MCP Client Wrapper Types
 * Layer 1: Low-level MCP abstraction layer
 */

/**
 * Result wrapper for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Base MCP client interface
 */
export interface IMcpClient {
  /**
   * Invoke an MCP tool with typed arguments
   */
  invoke<T>(tool: string, args: unknown): Promise<Result<T>>;

  /**
   * Check if the MCP server is available
   */
  isAvailable(): boolean;
}

/**
 * Retry configuration for MCP calls
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// ============================================================================
// Web Search Types (mcp__web-search-prime__webSearchPrime)
// ============================================================================

/**
 * Search result metadata from web-search-prime
 */
export interface WebSearchResult {
  title: string;
  url: string;
  summary: string;
  siteName: string;
  favicon?: string;
  publishedDate?: string;
}

/**
 * Web search options
 */
export interface WebSearchOptions {
  query: string;
  domainFilter?: string;
  timeRange?: 'oneDay' | 'oneWeek' | 'oneMonth' | 'oneYear' | 'noLimit';
  location?: 'cn' | 'us';
  contentSize?: 'medium' | 'high';
}

// ============================================================================
// Web Reader Types (mcp__web-reader__webReader)
// ============================================================================

/**
 * URL reading options
 */
export interface ReadUrlOptions {
  url: string;
  timeout?: number;
  retainImages?: boolean;
  withImagesSummary?: boolean;
  withLinksSummary?: boolean;
  useCache?: boolean;
  returnFormat?: 'markdown' | 'text';
  noGfm?: boolean;
  keepImgDataUrl?: boolean;
}

/**
 * Web reader response
 */
export interface WebReaderResponse {
  content: string;
  images?: string[];
  links?: string[];
}

// ============================================================================
// Vision/Analysis Types (mcp__zai-mcp-server__*)
// ============================================================================

/**
 * Image analysis options (general-purpose)
 */
export interface AnalyzeImageOptions {
  imagePath: string;
  prompt: string;
}

/**
 * UI to artifact conversion options
 */
export interface UiToArtifactOptions {
  imagePath: string;
  outputType: 'code' | 'prompt' | 'spec' | 'description';
  prompt?: string;
}

/**
 * Text extraction (OCR) options
 */
export interface ExtractTextOptions {
  imagePath: string;
  prompt?: string;
  programmingLanguage?: string;
}

/**
 * Error diagnosis options
 */
export interface DiagnoseErrorOptions {
  imagePath: string;
  prompt: string;
  context?: string;
}

/**
 * Data visualization analysis options
 */
export interface AnalyzeDataVizOptions {
  imagePath: string;
  prompt: string;
  analysisFocus?: string;
}

/**
 * UI comparison options
 */
export interface UiDiffCheckOptions {
  expectedImagePath: string;
  actualImagePath: string;
  prompt: string;
}

/**
 * Technical diagram understanding options
 */
export interface UnderstandDiagramOptions {
  imagePath: string;
  prompt: string;
  diagramType?: string;
}

/**
 * Video analysis options
 */
export interface AnalyzeVideoOptions {
  videoPath: string;
  prompt: string;
}

// ============================================================================
// GitHub Repository Types (mcp__zread__*)
// ============================================================================

/**
 * Repository structure options
 */
export interface GetRepoStructureOptions {
  repoName: string;
  dirPath?: string;
}

/**
 * Repository file reading options
 */
export interface ReadRepoFileOptions {
  repoName: string;
  filePath: string;
}

/**
 * Repository documentation search options
 */
export interface SearchRepoDocOptions {
  repoName: string;
  query: string;
  language?: 'zh' | 'en';
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base MCP error
 */
export class McpError extends Error {
  constructor(
    public readonly tool: string,
    public readonly cause: unknown,
    message: string
  ) {
    super(message);
    this.name = 'McpError';
  }
}

/**
 * MCP timeout error
 */
export class McpTimeoutError extends McpError {
  constructor(tool: string, public readonly timeout: number) {
    super(
      tool,
      null,
      `Tool ${tool} timed out after ${timeout}ms`
    );
    this.name = 'McpTimeoutError';
  }
}

/**
 * MCP retry error (all attempts exhausted)
 */
export class McpRetryError extends McpError {
  constructor(
    tool: string,
    public readonly attempts: number,
    cause: unknown
  ) {
    super(
      tool,
      cause,
      `Tool ${tool} failed after ${attempts} attempts`
    );
    this.name = 'McpRetryError';
  }
}

/**
 * MCP validation error (input/output validation failed)
 */
export class McpValidationError extends McpError {
  constructor(tool: string, public readonly validationErrors: string[]) {
    super(
      tool,
      validationErrors,
      `Tool ${tool} validation failed: ${validationErrors.join(', ')}`
    );
    this.name = 'McpValidationError';
  }
}
