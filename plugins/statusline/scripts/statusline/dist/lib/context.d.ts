export interface ContextData {
    tokens: number | null;
    percentage: number | null;
    lastOutputTokens: number | null;
}
export interface ContextOptions {
    transcriptPath: string;
    maxContextTokens: number;
    autocompactBufferTokens: number;
    useUsableContextOnly: boolean;
    overheadTokens: number;
}
/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export declare function getContextData(options: ContextOptions): Promise<ContextData>;
