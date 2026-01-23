/**
 * Semantic Analysis API
 *
 * APIs for deep semantic analysis including similarity scoring,
 * clustering, and pattern recognition using transformer models.
 *
 * @module api/semantic
 */
/**
 * Semantic similarity result
 */
export interface SimilarityResult {
    /** First item being compared */
    item1: string;
    /** Second item being compared */
    item2: string;
    /** Similarity score (0-1) */
    similarity: number;
    /** Confidence level */
    confidence: 'high' | 'medium' | 'low';
}
/**
 * Cluster result
 */
export interface ClusterResult {
    /** Cluster ID */
    id: string;
    /** Items in the cluster */
    items: string[];
    /** Cluster centroid (average similarity) */
    centroid: number;
    /** Cluster quality score */
    quality: number;
}
/**
 * Pattern detection result
 */
export interface PatternResult {
    /** Pattern type */
    type: string;
    /** Pattern description */
    description: string;
    /** Matches found */
    matches: Array<{
        content: string;
        location: string;
        confidence: number;
    }>;
    /** Frequency */
    frequency: number;
}
/**
 * Semantic analysis options
 */
export interface SemanticAnalysisOptions {
    /** Whether to use embeddings (requires transformer models) */
    useEmbeddings?: boolean;
    /** Model name for embeddings */
    modelName?: string;
    /** Similarity threshold (0-1) */
    similarityThreshold?: number;
    /** Maximum number of clusters */
    maxClusters?: number;
    /** Whether to enable caching */
    useCache?: boolean;
}
/**
 * Semantic Analysis API class
 */
export declare class SemanticAnalysisAPI {
    private embeddingModel;
    private cache;
    private defaultOptions;
    constructor(options?: SemanticAnalysisOptions);
    /**
     * Analyze semantics of code/text
     */
    analyzeSemantics(content: string, options?: SemanticAnalysisOptions): Promise<{
        embedding?: number[];
        keywords: string[];
        complexity: number;
        summary: string;
    }>;
    /**
     * Calculate similarity between two items
     */
    calculateSimilarity(item1: string, item2: string, options?: SemanticAnalysisOptions): Promise<SimilarityResult>;
    /**
     * Cluster results by similarity
     */
    clusterResults(items: string[], options?: SemanticAnalysisOptions): Promise<ClusterResult[]>;
    /**
     * Detect patterns in code/text
     */
    detectPatterns(content: string, options?: SemanticAnalysisOptions): Promise<PatternResult[]>;
    /**
     * Get embedding for text
     */
    private getEmbedding;
    /**
     * Calculate complexity of text
     */
    private calculateComplexity;
    /**
     * Generate summary from keywords
     */
    private generateSummary;
    /**
     * Calculate cosine similarity between embeddings
     */
    private cosineSimilarity;
    /**
     * Calculate keyword-based similarity
     */
    private keywordSimilarity;
    /**
     * Get confidence level from score
     */
    private getConfidenceLevel;
    /**
     * Clear cache
     */
    clearCache(): void;
}
/**
 * Factory function
 */
export declare function createSemanticAnalysis(options?: SemanticAnalysisOptions): SemanticAnalysisAPI;
//# sourceMappingURL=semantic.d.ts.map