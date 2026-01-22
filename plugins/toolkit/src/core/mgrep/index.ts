/**
 * mgrep (Semantic Search) Module
 *
 * Provides semantic code search capabilities using mgrep CLI:
 * - CLI client wrapper
 * - High-level search API
 * - Optional MCP server integration
 *
 * @module core/mgrep
 */

// Client exports
export {
  MgrepClient,
  MgrepCommand,
  type MgrepSearchOptions,
  type MgrepSearchResult,
  type MgrepResult,
  type MgrepClientConfig,
  DEFAULT_MGREP_CLIENT_CONFIG,
} from './client.js';

// Search exports
export {
  SemanticSearch,
  createSearch,
  type SearchResult,
  type SearchConfig,
  type SearchStats,
  type SearchResponse,
  DEFAULT_SEARCH_CONFIG,
} from './search.js';

// Mapper exports
export {
  mapMgrepResultToSearchResult,
  mapMgrepResults,
} from './mappers.js';

// MCP exports
export {
  McpIntegration,
  createMcp,
  initMcp,
  McpConnectionStatus,
  type McpQueryOptions,
  type McpQueryResult,
  type McpClientConfig,
  DEFAULT_MCP_CONFIG,
} from './mcp.js';

/**
 * Quick access factory for creating mgrep client
 */
export function createClient(config?: Partial<import('./client.js').MgrepClientConfig>) {
  const { MgrepClient: Client } = require('./client.js');
  return new Client(config);
}

/**
 * Quick access factory for creating semantic search
 */
export function createSemanticSearch(config?: Partial<import('./search.js').SearchConfig>) {
  const { SemanticSearch: Search } = require('./search.js');
  return new Search(config);
}

/**
 * Quick access factory for creating MCP integration
 */
export function createMcpIntegration(config?: Partial<import('./mcp.js').McpClientConfig>) {
  const { McpIntegration: Mcp } = require('./mcp.js');
  return new Mcp(config);
}
