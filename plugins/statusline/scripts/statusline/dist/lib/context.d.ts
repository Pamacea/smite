export interface ContextData {
    tokens: number | null;
    percentage: number | null;
    lastOutputTokens: number | null;
    baseContext?: number;
    transcriptContext?: number;
}
export interface ContextOptions {
    transcriptPath: string;
    maxContextTokens: number;
    autocompactBufferTokens: number;
    useUsableContextOnly: boolean;
    overheadTokens: number;
    includeBaseContext?: boolean;
    baseContextPath?: string;
    workspaceDir?: string;
}
/**
 * Read and tokenize all base context files
 * Caches results for performance
 */
export declare function getBaseContextTokens(baseContextPath: string, workspaceDir?: string): Promise<number>;
/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export declare function getContextData(options: ContextOptions): Promise<ContextData>;
