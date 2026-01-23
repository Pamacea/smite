export interface ContextData {
    tokens: number | null;
    percentage: number | null;
    lastOutputTokens: number | null;
    baseContext?: number;
    transcriptContext?: number;
    userTokens?: number;
}
export interface ContextOptions {
    transcriptPath: string;
    maxContextTokens: number;
    autocompactBufferTokens: number;
    useUsableContextOnly: boolean;
    overheadTokens: number;
    includeBaseContext?: boolean;
    baseContextPath?: string;
}
/**
 * Read last N lines from a file efficiently using streaming
 */
export declare function readLastLines(filePath: string, maxLines: number): Promise<string[]>;
/**
 * Read first N lines from a file (for detecting session start events)
 */
export declare function readFirstLines(filePath: string, maxLines: number): Promise<string[]>;
/**
 * Read and tokenize all base context files
 * Caches results for performance
 * Counts: CLAUDE.md, rules, plugins config/README (not full source code)
 */
export declare function getBaseContextTokens(baseContextPath: string): Promise<number>;
/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export declare function getContextData(options: ContextOptions): Promise<ContextData>;
