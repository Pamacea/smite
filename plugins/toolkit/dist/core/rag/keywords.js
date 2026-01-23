"use strict";
/**
 * Keyword Extraction Utility
 *
 * Shared utilities for extracting keywords from text,
 * used across semantic analysis and caching modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = extractKeywords;
exports.extractKeywordSet = extractKeywordSet;
exports.jaccardSimilarity = jaccardSimilarity;
exports.cosineKeywordSimilarity = cosineKeywordSimilarity;
/**
 * Default stop words list
 * Common words that should be excluded from keyword extraction
 */
const DEFAULT_STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once',
]);
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
function extractKeywords(text, options = {}) {
    const { minLength = 2, maxKeywords = 10, stopWords = DEFAULT_STOP_WORDS, } = options;
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength && !stopWords.has(word));
    // Count frequency
    const frequency = new Map();
    for (const word of words) {
        frequency.set(word, (frequency.get(word) || 0) + 1);
    }
    // Return top keywords by frequency
    return Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(e => e[0]);
}
/**
 * Create a set of keywords from text (for Jaccard similarity)
 *
 * @param text - The text to extract keywords from
 * @param options - Extraction options
 * @returns Set of unique keywords
 */
function extractKeywordSet(text, options) {
    return new Set(extractKeywords(text, options));
}
/**
 * Calculate Jaccard similarity between two texts based on keywords
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @param options - Keyword extraction options
 * @returns Similarity score between 0 and 1
 */
function jaccardSimilarity(text1, text2, options) {
    const keywords1 = extractKeywordSet(text1, options);
    const keywords2 = extractKeywordSet(text2, options);
    if (keywords1.size === 0 || keywords2.size === 0)
        return 0;
    // Calculate intersection
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    // Calculate union
    const union = new Set([...keywords1, ...keywords2]);
    return intersection.size / union.size;
}
/**
 * Calculate cosine similarity using keyword frequency
 *
 * @param text1 - First text
 * @param text2 - Second text
 * @param options - Keyword extraction options
 * @returns Similarity score between 0 and 1
 */
function cosineKeywordSimilarity(text1, text2, options) {
    const { minLength = 2, stopWords = DEFAULT_STOP_WORDS, } = options ?? {};
    const words1 = new Set(text1
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength && !stopWords.has(word)));
    const words2 = new Set(text2
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength && !stopWords.has(word)));
    if (words1.size === 0 || words2.size === 0)
        return 0;
    // Calculate intersection
    let intersection = 0;
    words1.forEach(word => {
        if (words2.has(word)) {
            intersection++;
        }
    });
    // Cosine similarity: intersection / (sqrt(|A|) * sqrt(|B|))
    const denominator = Math.sqrt(words1.size) * Math.sqrt(words2.size);
    return denominator > 0 ? intersection / denominator : 0;
}
//# sourceMappingURL=keywords.js.map