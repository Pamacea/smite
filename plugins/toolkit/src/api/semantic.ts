/**
 * Semantic Analysis API
 *
 * APIs for deep semantic analysis including similarity scoring,
 * clustering, and pattern recognition using transformer models.
 *
 * @module api/semantic
 */

import { pipeline } from '@xenova/transformers';
import { extractKeywords, jaccardSimilarity } from '../core/rag/keywords';

/**
 * Pipeline callable type from @xenova/transformers
 * The pipeline function returns a callable that processes inputs
 */
interface PipelineCallable {
  (text: string | string[], options?: Record<string, unknown>): Promise<EmbeddingOutput>;
}

/**
 * Embedding output structure
 * The output from transformers is a tensor-like object with numeric data
 */
interface EmbeddingOutput {
  /** Raw tensor data (Float32Array or number array) */
  data: Float32Array | number[] | { [key: string]: unknown };
  /** Dimensions of the output tensor */
  dims?: number[];
  /** The actual output values (may be nested) */
  outputs?: number[][];
  /** Alias for data in some versions */
  tensor?: Float32Array | number[];
}

/** Type alias for the embedding model pipeline */
type Pipeline = PipelineCallable;

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
export class SemanticAnalysisAPI {
  private embeddingModel: Pipeline | null = null;
  private cache = new Map<string, unknown>();
  private defaultOptions: SemanticAnalysisOptions;

  constructor(options?: SemanticAnalysisOptions) {
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
  async analyzeSemantics(
    content: string,
    options?: SemanticAnalysisOptions
  ): Promise<{
    embedding?: number[];
    keywords: string[];
    complexity: number;
    summary: string;
  }> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Extract keywords
    const keywords = extractKeywords(content, { minLength: 4 });

    // Calculate complexity
    const complexity = this.calculateComplexity(content);

    // Generate summary
    const summary = this.generateSummary(content, keywords);

    // Generate embedding if requested
    let embedding: number[] | undefined;
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
  async calculateSimilarity(
    item1: string,
    item2: string,
    options?: SemanticAnalysisOptions
  ): Promise<SimilarityResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    let similarity = 0;

    if (mergedOptions.useEmbeddings) {
      // Use embedding-based similarity
      const embedding1 = await this.getEmbedding(item1);
      const embedding2 = await this.getEmbedding(item2);

      similarity = this.cosineSimilarity(embedding1, embedding2);
    } else {
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
  async clusterResults(
    items: string[],
    options?: SemanticAnalysisOptions
  ): Promise<ClusterResult[]> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Calculate similarities between all pairs
    const similarities: Map<string, number> = new Map();
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const result = await this.calculateSimilarity(items[i], items[j], mergedOptions);
        similarities.set(`${i}-${j}`, result.similarity);
      }
    }

    // Simple clustering: group by high similarity
    const clusters: Map<string, Set<number>> = new Map();
    const visited = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (visited.has(i)) continue;

      const cluster = new Set<number>([i]);
      visited.add(i);

      // Find similar items
      for (let j = 0; j < items.length; j++) {
        if (i === j || visited.has(j)) continue;

        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        const sim = similarities.get(key) || 0;

        if (sim >= mergedOptions.similarityThreshold!) {
          cluster.add(j);
          visited.add(j);
        }
      }

      const clusterId = `cluster-${clusters.size + 1}`;
      clusters.set(clusterId, cluster);
    }

    // Convert to result format
    const results: ClusterResult[] = [];
    for (const [id, cluster] of clusters.entries()) {
      const clusterIndices = Array.from(cluster);
      const clusterItems = clusterIndices.map(i => items[i]);

      // Calculate centroid (average similarity within cluster)
      let totalSim = 0;
      let count = 0;
      for (let i = 0; i < clusterIndices.length; i++) {
        for (let j = i + 1; j < clusterIndices.length; j++) {
          const key =
            clusterIndices[i] < clusterIndices[j]
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
  async detectPatterns(
    content: string,
    options?: SemanticAnalysisOptions
  ): Promise<PatternResult[]> {
    const patterns: PatternResult[] = [];

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
  private async getEmbedding(text: string): Promise<number[]> {
    if (this.cache.has(text)) {
      return this.cache.get(text) as number[];
    }

    if (!this.embeddingModel) {
      // Lazy load the model
      this.embeddingModel = await pipeline(
        'feature-extraction',
        this.defaultOptions.modelName
      ) as Pipeline;
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
      : (rawData as { [key: string]: unknown }).data
        ? (rawData as { data: unknown }).data
        : rawData;

    const embedding = Array.from(sourceData as Float32Array | number[]).map((v: unknown) => {
      if (typeof v === 'number') return v;
      return 0; // Fallback for non-numeric values
    }) as number[];

    this.cache.set(text, embedding);

    return embedding;
  }

  /**
   * Calculate complexity of text
   */
  private calculateComplexity(text: string): number {
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
  private generateSummary(text: string, keywords: string[]): string {
    const firstLine = text.split('\n')[0];
    const preview = firstLine.slice(0, 100);

    return `${preview}${firstLine.length > 100 ? '...' : ''}\n\nKeywords: ${keywords.slice(0, 5).join(', ')}`;
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  }

  /**
   * Calculate keyword-based similarity
   */
  private keywordSimilarity(text1: string, text2: string): number {
    return jaccardSimilarity(text1, text2, { minLength: 4 });
  }

  /**
   * Get confidence level from score
   */
  private getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Factory function
 */
export function createSemanticAnalysis(
  options?: SemanticAnalysisOptions
): SemanticAnalysisAPI {
  return new SemanticAnalysisAPI(options);
}
