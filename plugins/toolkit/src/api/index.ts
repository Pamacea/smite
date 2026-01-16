/**
 * API Module
 *
 * Main user-facing APIs for the SMITE Toolkit.
 *
 * @module api
 */

// Search API exports
export {
  CodeSearchAPI,
  createCodeSearch,
  OutputFormat,
  type CodeSearchOptions,
  type CodeSearchResult,
  type CodeSearchResponse,
  type SearchFilters,
} from './search.js';
