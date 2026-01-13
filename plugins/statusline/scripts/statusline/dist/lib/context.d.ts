export interface ContextData {
    tokens: number | null;
    percentage: number | null;
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
 */
export declare function getContextData(options: ContextOptions): Promise<ContextData>;
