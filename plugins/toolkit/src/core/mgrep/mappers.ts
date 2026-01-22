/**
 * Mgrep Result Mappers
 *
 * Provides mapping functions to convert mgrep search results
 * to unified search result format.
 *
 * @module core/mgrep/mappers
 */

import { MgrepSearchResult } from './client.js';
import type { SearchResult } from '../unified/types.js';

/**
 * Maps mgrep search result to unified search result format
 *
 * @param mgrepResult - Raw mgrep result
 * @returns Unified search result
 */
export function mapMgrepResultToSearchResult(
  mgrepResult: MgrepSearchResult
): SearchResult {
  return {
    filePath: mgrepResult.file,
    lineNumber: mgrepResult.startLine || 0,
    content: mgrepResult.snippet || '',
    score: mgrepResult.score,
  };
}

/**
 * Maps multiple mgrep results to unified format
 *
 * @param mgrepResults - Array of raw mgrep results
 * @returns Array of unified search results
 */
export function mapMgrepResults(
  mgrepResults: MgrepSearchResult[]
): SearchResult[] {
  return mgrepResults.map(mapMgrepResultToSearchResult);
}
