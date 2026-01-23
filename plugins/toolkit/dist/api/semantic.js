"use strict";
/**
 * Semantic Analysis API
 *
 * APIs for deep semantic analysis including similarity scoring,
 * clustering, and pattern recognition using transformer models.
 *
 * @module api/semantic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticAnalysisAPI = void 0;
exports.createSemanticAnalysis = createSemanticAnalysis;
const transformers_1 = require("@xenova/transformers");
const keywords_1 = require("../core/rag/keywords");
/**
 * Semantic Analysis API class
 */
class SemanticAnalysisAPI {
    constructor(options) {
        this.embeddingModel = null;
        this.cache = new Map();
        this.defaultOptions = {
            useEmbeddings: false,
            modelName: 'Xenova/all-MiniLM-L6-v2',
            similarityThreshold: 0.7,
            maxClusters: 10,
            useCache: true,
            ...options,
        };
    }
    /**
     * Analyze semantics of code/text
     */
    async analyzeSemantics(content, options) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        // Extract keywords
        const keywords = (0, keywords_1.extractKeywords)(content, { minLength: 4 });
        // Calculate complexity
        const complexity = this.calculateComplexity(content);
        // Generate summary
        const summary = this.generateSummary(content, keywords);
        // Generate embedding if requested
        let embedding;
        if (mergedOptions.useEmbeddings) {
            embedding = await this.getEmbedding(content);
        }
        return {
            embedding,
            keywords,
            complexity,
            summary,
        };
    }
    /**
     * Calculate similarity between two items
     */
    async calculateSimilarity(item1, item2, options) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        let similarity = 0;
        if (mergedOptions.useEmbeddings) {
            // Use embedding-based similarity
            const embedding1 = await this.getEmbedding(item1);
            const embedding2 = await this.getEmbedding(item2);
            similarity = this.cosineSimilarity(embedding1, embedding2);
        }
        else {
            // Use keyword-based similarity
            similarity = this.keywordSimilarity(item1, item2);
        }
        const confidence = this.getConfidenceLevel(similarity);
        return {
            item1: item1.slice(0, 50) + '...',
            item2: item2.slice(0, 50) + '...',
            similarity,
            confidence,
        };
    }
    /**
     * Cluster results by similarity
     */
    async clusterResults(items, options) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        // Calculate similarities between all pairs
        const similarities = new Map();
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const result = await this.calculateSimilarity(items[i], items[j], mergedOptions);
                similarities.set(`${i}-${j}`, result.similarity);
            }
        }
        // Simple clustering: group by high similarity
        const clusters = new Map();
        const visited = new Set();
        for (let i = 0; i < items.length; i++) {
            if (visited.has(i))
                continue;
            const cluster = new Set([i]);
            visited.add(i);
            // Find similar items
            for (let j = 0; j < items.length; j++) {
                if (i === j || visited.has(j))
                    continue;
                const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                const sim = similarities.get(key) || 0;
                if (sim >= mergedOptions.similarityThreshold) {
                    cluster.add(j);
                    visited.add(j);
                }
            }
            const clusterId = `cluster-${clusters.size + 1}`;
            clusters.set(clusterId, cluster);
        }
        // Convert to result format
        const results = [];
        for (const [id, cluster] of clusters.entries()) {
            const clusterIndices = Array.from(cluster);
            const clusterItems = clusterIndices.map(i => items[i]);
            // Calculate centroid (average similarity within cluster)
            let totalSim = 0;
            let count = 0;
            for (let i = 0; i < clusterIndices.length; i++) {
                for (let j = i + 1; j < clusterIndices.length; j++) {
                    const key = clusterIndices[i] < clusterIndices[j]
                        ? `${clusterIndices[i]}-${clusterIndices[j]}`
                        : `${clusterIndices[j]}-${clusterIndices[i]}`;
                    totalSim += similarities.get(key) || 0;
                    count++;
                }
            }
            const centroid = count > 0 ? totalSim / count : 0;
            // Quality is based on cluster density
            const quality = centroid * (clusterItems.length / items.length);
            results.push({
                id,
                items: clusterItems,
                centroid,
                quality,
            });
        }
        // Sort by quality descending
        return results.sort((a, b) => b.quality - a.quality);
    }
    /**
     * Detect patterns in code/text
     */
    async detectPatterns(content, options) {
        const patterns = [];
        // Detect function patterns
        const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
        const functionMatches = content.match(functionPattern);
        if (functionMatches) {
            patterns.push({
                type: 'function',
                description: 'Function definitions',
                matches: functionMatches.map(m => ({
                    content: m,
                    location: 'code',
                    confidence: 0.9,
                })),
                frequency: functionMatches.length,
            });
        }
        // Detect class patterns
        const classPattern = /class\s+(\w+)/g;
        const classMatches = content.match(classPattern);
        if (classMatches) {
            patterns.push({
                type: 'class',
                description: 'Class definitions',
                matches: classMatches.map(m => ({
                    content: m,
                    location: 'code',
                    confidence: 0.95,
                })),
                frequency: classMatches.length,
            });
        }
        // Detect import patterns
        const importPattern = /import\s+.*from\s+['"](.+)['"]/g;
        const importMatches = content.match(importPattern);
        if (importMatches) {
            patterns.push({
                type: 'import',
                description: 'Import statements',
                matches: importMatches.map(m => ({
                    content: m,
                    location: 'code',
                    confidence: 1.0,
                })),
                frequency: importMatches.length,
            });
        }
        return patterns;
    }
    /**
     * Get embedding for text
     */
    async getEmbedding(text) {
        if (this.cache.has(text)) {
            return this.cache.get(text);
        }
        if (!this.embeddingModel) {
            // Lazy load the model
            this.embeddingModel = await (0, transformers_1.pipeline)('feature-extraction', this.defaultOptions.modelName);
        }
        const output = await this.embeddingModel(text, {
            pooling: 'mean',
            normalize: true,
        });
        // Extract tensor data and convert to number array
        // The output structure varies by version, so we check multiple paths
        const rawData = output.data ?? output.tensor ?? output.outputs ?? output;
        const sourceData = Array.isArray(rawData)
            ? rawData
            : rawData.data
                ? rawData.data
                : rawData;
        const embedding = Array.from(sourceData).map((v) => {
            if (typeof v === 'number')
                return v;
            return 0; // Fallback for non-numeric values
        });
        this.cache.set(text, embedding);
        return embedding;
    }
    /**
     * Calculate complexity of text
     */
    calculateComplexity(text) {
        // Simple complexity metrics
        const lines = text.split('\n').length;
        const words = text.split(/\s+/).length;
        const avgLineLength = words / lines;
        // Complexity score (0-1)
        return Math.min((avgLineLength / 50) * (lines / 100), 1);
    }
    /**
     * Generate summary from keywords
     */
    generateSummary(text, keywords) {
        const firstLine = text.split('\n')[0];
        const preview = firstLine.slice(0, 100);
        return `${preview}${firstLine.length > 100 ? '...' : ''}\n\nKeywords: ${keywords.slice(0, 5).join(', ')}`;
    }
    /**
     * Calculate cosine similarity between embeddings
     */
    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
        const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
        const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
        return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
    }
    /**
     * Calculate keyword-based similarity
     */
    keywordSimilarity(text1, text2) {
        return (0, keywords_1.jaccardSimilarity)(text1, text2, { minLength: 4 });
    }
    /**
     * Get confidence level from score
     */
    getConfidenceLevel(score) {
        if (score >= 0.8)
            return 'high';
        if (score >= 0.5)
            return 'medium';
        return 'low';
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}
exports.SemanticAnalysisAPI = SemanticAnalysisAPI;
/**
 * Factory function
 */
function createSemanticAnalysis(options) {
    return new SemanticAnalysisAPI(options);
}
//# sourceMappingURL=semantic.js.map