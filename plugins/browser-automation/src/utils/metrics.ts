/**
 * Metrics Tracking - Performance monitoring for MCP calls
 *
 * Provides:
 * - MCP call counting and timing
 * - Cache performance metrics
 * - Batch operation tracking
 * - Performance improvement calculation
 *
 * @module @smite/browser-automation/utils/metrics
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Individual operation metric
 */
export interface OperationMetric {
  /**
   * Operation name (e.g., 'web-reader', 'web-search')
   */
  operation: string;

  /**
   * Timestamp when operation started
   */
  startTime: number;

  /**
   * Duration in milliseconds
   */
  duration: number;

  /**
   * Whether operation was successful
   */
  success: boolean;

  /**
   * Whether result came from cache
   */
  cached?: boolean;

  /**
   * Size of response (bytes or characters)
   */
  size?: number;
}

/**
 * Aggregated metrics for an operation type
 */
export interface AggregatedMetric {
  /**
   * Operation name
   */
  operation: string;

  /**
   * Total number of calls
   */
  totalCalls: number;

  /**
   * Number of successful calls
   */
  successfulCalls: number;

  /**
   * Number of failed calls
   */
  failedCalls: number;

  /**
   * Number of cache hits
   */
  cacheHits: number;

  /**
   * Number of cache misses
   */
  cacheMisses: number;

  /**
   * Total duration in milliseconds
   */
  totalDuration: number;

  /**
   * Average duration in milliseconds
   */
  avgDuration: number;

  /**
   * Minimum duration in milliseconds
   */
  minDuration: number;

  /**
   * Maximum duration in milliseconds
   */
  maxDuration: number;
}

/**
 * Performance comparison result
 */
export interface PerformanceComparison {
  /**
   * Percentage improvement
   */
  improvementPercent: number;

  /**
   * Time saved in milliseconds
   */
  timeSavedMs: number;

  /**
   * Operations saved (via cache)
   */
  operationsSaved: number;

  /**
   * Comparison description
   */
  description: string;
}

// ============================================================================
// Metrics Tracker Implementation
// ============================================================================

/**
 * Metrics tracker for MCP operations
 *
 * @example
 * ```typescript
 * const tracker = new MetricsTracker();
 *
 * // Track an operation
 * const metric = tracker.start('web-reader');
 * const result = await readUrl(url);
 * tracker.end(metric, result.success, result.data.length);
 *
 * // Get aggregated metrics
 * const stats = tracker.getStats('web-reader');
 * console.log(`Average duration: ${stats.avgDuration}ms`);
 * ```
 */
export class MetricsTracker {
  private metrics: Map<string, OperationMetric[]> = new Map();
  private activeOperations: Map<string, OperationMetric> = new Map();

  // ========================================================================
  // Operation Tracking
  // ========================================================================

  /**
   * Start tracking an operation
   *
   * @param operation - Operation name
   * @returns Operation metric object (pass to end())
   *
   * @example
   * ```typescript
   * const metric = tracker.start('web-reader');
   * try {
   *   const result = await operation();
   *   tracker.end(metric, true);
   *   return result;
   * } catch (error) {
   *   tracker.end(metric, false);
   *   throw error;
   * }
   * ```
   */
  start(operation: string): OperationMetric {
    const metric: OperationMetric = {
      operation,
      startTime: Date.now(),
      duration: 0,
      success: false,
    };

    const id = `${operation}-${Date.now()}-${Math.random()}`;
    this.activeOperations.set(id, metric);

    return metric;
  }

  /**
   * End tracking an operation
   *
   * @param metric - Metric object from start()
   * @param success - Whether operation was successful
   * @param cached - Whether result came from cache
   * @param size - Response size (optional)
   */
  end(
    metric: OperationMetric,
    success: boolean,
    cached?: boolean,
    size?: number
  ): void {
    metric.duration = Date.now() - metric.startTime;
    metric.success = success;
    metric.cached = cached;
    metric.size = size;

    // Store metric
    const operations = this.metrics.get(metric.operation) || [];
    operations.push(metric);
    this.metrics.set(metric.operation, operations);

    // Remove from active operations
    for (const [id, activeMetric] of this.activeOperations.entries()) {
      if (activeMetric === metric) {
        this.activeOperations.delete(id);
        break;
      }
    }
  }

  /**
   * Track an operation with automatic success/error handling
   *
   * @param operation - Operation name
   * @param fn - Async function to execute
   * @returns Result of the function
   *
   * @example
   * ```typescript
   * const result = await tracker.track('web-reader', async () => {
   *   return await readUrl(url);
   * });
   * ```
   */
  async track<T>(
    operation: string,
    fn: () => Promise<{ success: boolean; data?: T; size?: number }>
  ): Promise<{ success: boolean; data?: T }> {
    const metric = this.start(operation);

    try {
      const result = await fn();
      this.end(metric, result.success, false, result.size);
      return result;
    } catch (error) {
      this.end(metric, false);
      throw error;
    }
  }

  // ========================================================================
  // Statistics and Aggregation
  // ========================================================================

  /**
   * Get aggregated statistics for an operation
   *
   * @param operation - Operation name
   * @returns Aggregated metrics
   */
  getStats(operation: string): AggregatedMetric | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const totalCalls = metrics.length;
    const successfulCalls = metrics.filter(m => m.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const cacheHits = metrics.filter(m => m.cached).length;
    const cacheMisses = totalCalls - cacheHits;

    const durations = metrics.map(m => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / totalCalls;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      operation,
      totalCalls,
      successfulCalls,
      failedCalls,
      cacheHits,
      cacheMisses,
      totalDuration,
      avgDuration,
      minDuration,
      maxDuration,
    };
  }

  /**
   * Get all aggregated statistics
   *
   * @returns Map of operation name to aggregated metrics
   */
  getAllStats(): Map<string, AggregatedMetric> {
    const allStats = new Map<string, AggregatedMetric>();

    for (const operation of this.metrics.keys()) {
      const stats = this.getStats(operation);
      if (stats) {
        allStats.set(operation, stats);
      }
    }

    return allStats;
  }

  /**
   * Calculate performance improvement with caching
   *
   * @param operation - Operation name
   * @returns Performance comparison
   */
  calculateImprovement(operation: string): PerformanceComparison | null {
    const stats = this.getStats(operation);
    if (!stats || stats.cacheHits === 0) {
      return null;
    }

    // Calculate average duration of non-cached calls
    const nonCachedMetrics = (this.metrics.get(operation) || []).filter(m => !m.cached);
    if (nonCachedMetrics.length === 0) {
      return null;
    }

    const avgNonCachedDuration =
      nonCachedMetrics.reduce((sum, m) => sum + m.duration, 0) / nonCachedMetrics.length;

    // Time saved = cache hits * (average non-cached duration)
    const timeSavedMs = stats.cacheHits * avgNonCachedDuration;
    const totalTimeWithCache = stats.totalDuration;
    const totalTimeWithoutCache = totalTimeWithCache + timeSavedMs;

    const improvementPercent =
      ((totalTimeWithoutCache - totalTimeWithCache) / totalTimeWithoutCache) * 100;

    return {
      improvementPercent,
      timeSavedMs,
      operationsSaved: stats.cacheHits,
      description: `${operation}: ${improvementPercent.toFixed(1)}% faster (${timeSavedMs}ms saved via ${stats.cacheHits} cache hits)`,
    };
  }

  /**
   * Get total number of tracked operations
   */
  getTotalOperations(): number {
    let total = 0;
    for (const metrics of this.metrics.values()) {
      total += metrics.length;
    }
    return total;
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeOperations.clear();
  }

  /**
   * Clear metrics for a specific operation
   *
   * @param operation - Operation name
   */
  clearOperation(operation: string): void {
    this.metrics.delete(operation);
  }

  /**
   * Print statistics to console
   *
   * @param operation - Operation name (optional, prints all if not provided)
   */
  printStats(operation?: string): void {
    if (operation) {
      const stats = this.getStats(operation);
      if (!stats) {
        console.log(`No metrics found for operation "${operation}"`);
        return;
      }
      this.printAggregatedMetric(stats);
    } else {
      const allStats = this.getAllStats();
      if (allStats.size === 0) {
        console.log('No metrics found');
        return;
      }

      console.log('📊 Performance Metrics:');
      console.log('');
      for (const stats of allStats.values()) {
        this.printAggregatedMetric(stats);
        console.log('');
      }
    }
  }

  /**
   * Print performance summary with improvements
   */
  printSummary(): void {
    const allStats = this.getAllStats();
    if (allStats.size === 0) {
      console.log('No metrics to summarize');
      return;
    }

    console.log('📈 Performance Summary:');
    console.log('');

    let totalCalls = 0;
    let totalCacheHits = 0;
    let totalTimeSaved = 0;

    for (const [operation, stats] of allStats.entries()) {
      totalCalls += stats.totalCalls;
      totalCacheHits += stats.cacheHits;

      const improvement = this.calculateImprovement(operation);
      if (improvement) {
        totalTimeSaved += improvement.timeSavedMs;
        console.log(`✨ ${improvement.description}`);
      }
    }

    const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls) * 100 : 0;
    const overallImprovement = totalCalls > 0 ? (totalTimeSaved / (totalTimeSaved + this.getTotalDuration())) * 100 : 0;

    console.log('');
    console.log(`🎯 Overall:`);
    console.log(`   Total operations: ${totalCalls}`);
    console.log(`   Cache hit rate: ${cacheHitRate.toFixed(1)}%`);
    console.log(`   Total time saved: ${totalTimeSaved}ms`);
    console.log(`   Overall improvement: ${overallImprovement.toFixed(1)}%`);
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private printAggregatedMetric(stats: AggregatedMetric): void {
    const successRate = (stats.successfulCalls / stats.totalCalls) * 100;
    const cacheHitRate = (stats.cacheHits / stats.totalCalls) * 100;

    console.log(`📊 ${stats.operation}:`);
    console.log(`   Calls: ${stats.totalCalls} (success: ${successRate.toFixed(1)}%)`);
    console.log(`   Cache: ${cacheHitRate.toFixed(1)}% hit rate (${stats.cacheHits}/${stats.totalCalls})`);
    console.log(`   Duration: avg=${stats.avgDuration.toFixed(0)}ms min=${stats.minDuration}ms max=${stats.maxDuration}ms`);
    console.log(`   Total time: ${stats.totalDuration}ms`);
  }

  private getTotalDuration(): number {
    let total = 0;
    for (const stats of this.getAllStats().values()) {
      total += stats.totalDuration;
    }
    return total;
  }
}

// ============================================================================
// Global Metrics Tracker
// ============================================================================

/**
 * Global metrics tracker instance
 */
export const metrics = new MetricsTracker();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a timed operation wrapper
 *
 * @param operation - Operation name
 * @param fn - Function to time
 * @returns Result with timing metadata
 *
 * @example
 * ```typescript
 * const result = await timedOperation('web-reader', async () => {
 *   return await readUrl(url);
 * });
 * console.log(`Duration: ${result.duration}ms`);
 * ```
 */
export async function timedOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ data: T; duration: number; success: boolean }> {
  const metric = metrics.start(operation);
  const startTime = Date.now();

  try {
    const data = await fn();
    const duration = Date.now() - startTime;
    metrics.end(metric, true);

    return { data, duration, success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.end(metric, false);

    return { data: null as unknown as T, duration, success: false };
  }
}

/**
 * Calculate and log performance improvement
 *
 * @param operation - Operation name
 */
export function logImprovement(operation: string): void {
  const improvement = metrics.calculateImprovement(operation);

  if (improvement) {
    console.log(`✨ ${improvement.description}`);
  } else {
    console.log(`No performance data available for "${operation}"`);
  }
}

/**
 * Reset all metrics
 */
export function resetMetrics(): void {
  metrics.clear();
  console.log('🧹 Metrics cleared');
}
