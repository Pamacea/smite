/**
 * Keyword Extraction Utility
 *
 * Shared utilities for extracting keywords from text,
 * used across semantic analysis and caching modules.
 */
/**
 * Keyword extraction options
 */
export interface KeywordExtractionOptions {
    /** Minimum word length to include */
    minLength?: number;
    /** Maximum number of keywords to return */
    maxKeywords?: number;
    /** Custom stop words to exclude (merged with defaults) */
    stopWords?: Set<string>;
}
/**
 * Extract keywords from text
 *
 * @param text - The text to extract keywords from
 * @param options - Extraction options
 * @returns Array of extracted keywords, sorted by frequency
 *
 * @example
 * ```ts
 * extractKeywords("function calculateTotal(items) { return items.length; }")
 * // Returns: ["function", "calculateTotal", "items", "return", "length"]
 * ```
 */
export declare function extractKeywords(text: string, options?: KeywordExtractionOptions): string[];
/**
 * Create a set of keywords from text (for Jaccard similarity)
 *
 * @param text - The text to extract keywords from
 * @param options - Extraction options
 * @returns Set of unique keywords
 */
export declare function extractKeywordSet(text: string, options?: KeywordExtractionOptions): Set<string>;
/**
 * Calculate Jaccard similarity between two texts based on keywords
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @param options - Keyword extraction options
 * @returns Similarity score between 0 and 1
 */
export declare function jaccardSimilarity(text1: string, text2: string, options?: KeywordExtractionOptions): number;
/**
 * Calculate cosine similarity using keyword frequency
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @param options - Keyword extraction options
 * @returns Similarity score between 0 and 1
 */
export declare function cosineKeywordSimilarity(text1: string, text2: string, options?: KeywordExtractionOptions): number;
//# sourceMappingURL=keywords.d.ts.map