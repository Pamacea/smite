/**
 * Plan C: Get token count from /context command output cache.
 *
 * Usage:
 * 1. User runs /context (creates a cache file with current context info)
 * 2. Statusline reads this cache file to get REAL token counts
 * 3. Fallback to simple estimation if cache doesn't exist
 */
declare const CACHE_DIR: string;
declare const CACHE_FILE: string;
export interface ContextFromCache {
    tokens: number;
    percentage: number;
    maxTokens: number;
    timestamp: number;
    source: "cache" | "estimate";
}
/**
 * Get context tokens with Plan C approach.
 * 1. Try to read from /context cache (most accurate)
 * 2. Fallback to simple transcript estimation
 */
export declare function getContextFromCache(transcriptPath: string, maxTokens?: number): Promise<ContextFromCache>;
export { CACHE_DIR, CACHE_FILE };
