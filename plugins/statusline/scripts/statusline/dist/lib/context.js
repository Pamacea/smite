import { readFile } from "node:fs/promises";
/**
 * Calculate context tokens from transcript file
 */
export async function getContextData(options) {
    const { transcriptPath, maxContextTokens, autocompactBufferTokens, useUsableContextOnly, overheadTokens, } = options;
    try {
        const content = await readFile(transcriptPath, "utf-8");
        const transcript = JSON.parse(content);
        let totalTokens = 0;
        // Count tokens from transcript entries
        for (const entry of transcript) {
            if (entry.usage) {
                totalTokens += entry.usage.input_tokens || 0;
                totalTokens += entry.usage.output_tokens || 0;
                totalTokens += entry.usage.cache_creation_input_tokens || 0;
                totalTokens += entry.usage.cache_read_input_tokens || 0;
            }
        }
        // Add overhead tokens
        totalTokens += overheadTokens;
        // Calculate usable context
        let usableTokens = totalTokens;
        if (useUsableContextOnly) {
            usableTokens = Math.max(0, totalTokens - autocompactBufferTokens);
        }
        // Calculate percentage
        const percentage = Math.min(100, Math.round((usableTokens / maxContextTokens) * 100));
        // Get last output tokens from the most recent assistant message
        let lastOutputTokens = null;
        for (let i = transcript.length - 1; i >= 0; i--) {
            const entry = transcript[i];
            if (entry.type === 'assistant' && entry.usage?.output_tokens) {
                lastOutputTokens = entry.usage.output_tokens;
                break;
            }
        }
        return {
            tokens: usableTokens,
            percentage,
            lastOutputTokens,
        };
    }
    catch {
        // Transcript not available or parse error
        return {
            tokens: null,
            percentage: null,
            lastOutputTokens: null,
        };
    }
}
