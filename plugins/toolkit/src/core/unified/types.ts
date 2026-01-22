/**
 * Unified Search Router - Type Definitions
 *
 * Defines the core types and interfaces for the unified search system
 * that integrates RAG, mgrep, semantic search, and hybrid strategies.
 *
 * @module core/unified/types
 */

/**
 * Search strategy types supported by the unified router
 */
export enum SearchStrategy {
  /** Automatic strategy selection based on query analysis */
  AUTO = 'auto',

  /** Semantic search using embeddings and similarity matching */
  SEMANTIC = 'semantic',

  /** Literal text search using grep/mgrep */
  LITERAL = 'literal',

  /** Hybrid approach combining semantic and literal search */
  HYBRID = 'hybrid',
}

/**
 * Query type detected by the analyzer
 */
export enum QueryType {
  /** Natural language query requiring semantic understanding */
  NATURAL_LANGUAGE = 'natural_language',

  /** Code snippet or literal pattern matching */
  CODE_PATTERN = 'code_pattern',

  /** Function/class name lookup */
  SYMBOL_LOOKUP = 'symbol_lookup',

  /** File path or pattern */
  FILE_PATH = 'file_path',

  /** Mixed query combining multiple types */
  HYBRID = 'hybrid',
}

/**
 * Search result from a single strategy
 */
export interface StrategyResult {
  /** The strategy that produced this result */
  strategy: SearchStrategy;

  /** Relevance score (0-1) */
  score: number;

  /** Matched results */
  results: SearchResult[];

  /** Execution time in milliseconds */
  executionTime: number;

  /** Any metadata about the search execution */
  metadata?: Record<string, unknown>;
}

/**
 * Individual search result
 */
export interface SearchResult {
  /** File path where the match was found */
  filePath: string;

  /** Line number of the match */
  lineNumber: number;

  /** Column number (if available) */
  columnNumber?: number;

  /** Matched content or snippet */
  content: string;

  /** Surrounding context lines */
  context?: {
    before: string[];
    after: string[];
  };

  /** Relevance score for this specific result */
  score?: number;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Unified search options
 */
export interface UnifiedSearchOptions {
  /** Search strategy to use (default: AUTO) */
  strategy?: SearchStrategy;

  /** Maximum number of results to return */
  maxResults?: number;

  /** File pattern filters (glob patterns) */
  filePatterns?: string[];

  /** Language filters */
  languages?: string[];

  /** Whether to include context */
  includeContext?: boolean;

  /** Number of context lines */
  contextLines?: number;

  /** Minimum relevance score threshold */
  minScore?: number;

  /** Whether to cache results */
  useCache?: boolean;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Additional options */
  [key: string]: unknown;
}

/**
 * Query analysis result
 */
export interface QueryAnalysis {
  /** Detected query type */
  type: QueryType;

  /** Confidence level (0-1) */
  confidence: number;

  /** Recommended search strategy */
  recommendedStrategy: SearchStrategy;

  /** Alternative strategies to try */
  alternativeStrategies: SearchStrategy[];

  /** Extracted search terms/patterns */
  searchTerms: string[];

  /** Any metadata about the query */
  metadata?: Record<string, unknown>;
}

/**
 * Unified search result
 */
export interface UnifiedSearchResult {
  /** All results from the search */
  results: SearchResult[];

  /** The strategy that was used */
  strategy: SearchStrategy;

  /** Query analysis that led to strategy selection */
  queryAnalysis: QueryAnalysis;

  /** Individual strategy results (if multiple were tried) */
  strategyResults?: StrategyResult[];

  /** Total execution time in milliseconds */
  totalExecutionTime: number;

  /** Number of results returned */
  resultCount: number;

  /** Whether results were retrieved from cache */
  fromCache: boolean;
}

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Default maximum results */
  defaultMaxResults: number;

  /** Default timeout in milliseconds */
  defaultTimeout: number;

  /** Whether caching is enabled by default */
  cacheEnabled: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL: number;

  /** Maximum cache size */
  maxCacheSize: number;

  /** Confidence threshold for automatic strategy selection */
  confidenceThreshold: number;

  /** Whether to try fallback strategies on failure */
  enableFallback: boolean;

  /** Maximum number of fallback strategies to try */
  maxFallbacks: number;
}

/**
 * Default router configuration
 */
export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  defaultMaxResults: 50,
  defaultTimeout: 30000,
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  maxCacheSize: 100,
  confidenceThreshold: 0.6,
  enableFallback: true,
  maxFallbacks: 2,
} as const;
