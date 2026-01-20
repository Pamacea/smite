/**
 * Batch Optimization - Parallel execution and deduplication
 *
 * Provides:
 * - Batched parallel execution with concurrency control
 * - Request deduplication across batches
 * - Progress tracking for long-running batches
 * - Error aggregation and reporting
 *
 * @module @smite/browser-automation/utils/batch
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Batch execution result
 */
export interface BatchResult<T> {
  /**
   * Successful results
   */
  successful: Array<{ index: number; data: T }>;

  /**
   * Failed results
   */
  failed: Array<{ index: number; error: Error }>;

  /**
   * Total execution time in milliseconds
   */
  duration: number;

  /**
   * Success rate (0-1)
   */
  successRate: number;
}

/**
 * Batch execution options
 */
export interface BatchOptions {
  /**
   * Maximum concurrent operations (default: 5)
   */
  concurrency?: number;

  /**
   * Delay between batches in milliseconds (default: 0)
   */
  batchDelay?: number;

  /**
   * Enable progress logging (default: true)
   */
  logProgress?: boolean;

  /**
   * Abort signal for cancellation
   */
  signal?: AbortSignal;
}

/**
 * Progress callback
 */
export type ProgressCallback = (completed: number, total: number) => void;

// ============================================================================
// Batch Processing Implementation
// ============================================================================

/**
 * Execute operations in batches with controlled concurrency
 *
 * @param operations - Array of async operations to execute
 * @param options - Batch execution options
 * @returns Promise resolving to batch results
 *
 * @example
 * ```typescript
 * const urls = ['url1', 'url2', 'url3', ...];
 *
 * const results = await batchExecute(
 *   urls.map(url => () => readUrl(url)),
 *   { concurrency: 5, logProgress: true }
 * );
 *
 * console.log(`Success rate: ${results.successRate * 100}%`);
 * ```
 */
export async function batchExecute<T>(
  operations: Array<() => Promise<T>>,
  options: BatchOptions = {}
): Promise<BatchResult<T>> {
  const startTime = Date.now();

  const concurrency = options.concurrency ?? 5;
  const batchDelay = options.batchDelay ?? 0;
  const logProgress = options.logProgress ?? true;

  const successful: Array<{ index: number; data: T }> = [];
  const failed: Array<{ index: number; error: Error }> = [];

  let completed = 0;
  const total = operations.length;

  // Process in batches
  for (let i = 0; i < operations.length; i += concurrency) {
    // Check for abort signal
    if (options.signal?.aborted) {
      throw new Error('Batch execution aborted');
    }

    const batch = operations.slice(i, i + concurrency);
    const batchStartIndex = i;

    // Execute batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(async (operation, batchIndex) => {
        const globalIndex = batchStartIndex + batchIndex;
        const result = await operation();
        completed++;

        // Log progress
        if (logProgress && completed % 10 === 0 || completed === total) {
          console.log(`📊 Progress: ${completed}/${total} operations completed (${((completed / total) * 100).toFixed(1)}%)`);
        }

        return { index: globalIndex, data: result };
      })
    );

    // Aggregate results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          index: result.status === 'rejected' ? batch.indexOf(result.reason) : -1,
          error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
        });
      }
    }

    // Delay between batches if configured
    if (batchDelay > 0 && i + concurrency < operations.length) {
      await sleep(batchDelay);
    }
  }

  const duration = Date.now() - startTime;
  const successRate = total > 0 ? successful.length / total : 0;

  console.log(`✅ Batch complete: ${successful.length}/${total} successful (${(successRate * 100).toFixed(1)}%) in ${duration}ms`);

  return { successful, failed, duration, successRate };
}

/**
 * Execute operations with deduplication
 *
 * Identical operations (based on key) will only be executed once,
 * with results shared across all requests.
 *
 * @param operations - Array of operations with keys
 * @param options - Batch execution options
 * @returns Promise resolving to batch results
 *
 * @example
 * ```typescript
 * const results = await batchExecuteDeduplicated(
 *   [
 *     { key: 'url1', fn: () => readUrl('url1') },
 *     { key: 'url2', fn: () => readUrl('url2') },
 *     { key: 'url1', fn: () => readUrl('url1') }, // Duplicate!
 *   ],
 *   { concurrency: 5 }
 * );
 * // Only url1 and url2 will be executed (2 calls, not 3)
 * ```
 */
export async function batchExecuteDeduplicated<T>(
  operations: Array<{ key: string; fn: () => Promise<T> }>,
  options: BatchOptions = {}
): Promise<BatchResult<T>> {
  // Deduplicate operations by key
  const uniqueOps = new Map<string, { index: number; fn: () => Promise<T> }>();
  const keyToIndices = new Map<string, number[]>();

  operations.forEach((op, index) => {
    if (!keyToIndices.has(op.key)) {
      uniqueOps.set(op.key, { index, fn: op.fn });
      keyToIndices.set(op.key, []);
    }
    keyToIndices.get(op.key)!.push(index);
  });

  console.log(`🔄 Deduplication: ${operations.length} requests → ${uniqueOps.size} unique operations`);

  // Execute unique operations
  const uniqueResults = await batchExecute(
    Array.from(uniqueOps.values()).map(op => op.fn),
    options
  );

  // Map results back to original indices
  const successful: Array<{ index: number; data: T }> = [];
  const failed: Array<{ index: number; error: Error }> = [];

  for (const [key, indices] of keyToIndices.entries()) {
    const uniqueOp = uniqueOps.get(key)!;
    const result = uniqueResults.successful.find(r => r.index === uniqueOp.index);

    if (result) {
      // Duplicate successful result for all indices
      indices.forEach(index => {
        successful.push({ index, data: result.data });
      });
    } else {
      // Duplicate failed result for all indices
      const error = uniqueResults.failed.find(f => f.index === uniqueOp.index)?.error ||
                    new Error('Operation failed');
      indices.forEach(index => {
        failed.push({ index, error });
      });
    }
  }

  return {
    successful,
    failed,
    duration: uniqueResults.duration,
    successRate: uniqueResults.successRate,
  };
}

/**
 * Execute operations with retry and fallback
 *
 * Failed operations can be retried individually with different strategies.
 *
 * @param operations - Array of operations to execute
 * @param options - Batch options with retry configuration
 * @returns Promise resolving to batch results
 *
 * @example
 * ```typescript
 * const results = await batchExecuteWithRetry(
 *   urls.map(url => () => readUrl(url)),
 *   {
 *     concurrency: 5,
 *     retryFailed: true,
 *     maxRetries: 2
 *   }
 * );
 * ```
 */
export async function batchExecuteWithRetry<T>(
  operations: Array<() => Promise<T>>,
  options: BatchOptions & {
    retryFailed?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<BatchResult<T>> {
  let results = await batchExecute(operations, options);

  // Retry failed operations if configured
  if (options.retryFailed && results.failed.length > 0) {
    console.log(`🔄 Retrying ${results.failed.length} failed operations...`);

    const failedIndices = results.failed.map(f => f.index);
    const retryOperations = failedIndices.map(index => operations[index]);

    const retryResults = await batchExecute(retryOperations, {
      ...options,
      logProgress: false,
    });

    // Merge results
    results.successful.push(...retryResults.successful);
    results.failed = retryResults.failed;

    // Update success rate
    results.successRate = operations.length > 0 ? results.successful.length / operations.length : 0;

    console.log(`🔄 Retry complete: ${retryResults.successful.length}/${failedIndices.length} recovered`);
  }

  return results;
}

/**
 * Process a large array in chunks with progress callbacks
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param options - Processing options
 * @returns Promise resolving to processed results
 *
 * @example
 * ```typescript
 * const results = await processInChunks(
 *   largeArray,
 *   async (item) => {
 *     return await processData(item);
 *   },
 *   {
 *     chunkSize: 100,
 *     onProgress: (completed, total) => {
 *       console.log(`Processed ${completed}/${total}`);
 *     }
 *   }
 * );
 * ```
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    chunkSize?: number;
    onProgress?: ProgressCallback;
    concurrency?: number;
  } = {}
): Promise<Array<{ index: number; data: R }>> {
  const chunkSize = options.chunkSize ?? 100;
  const concurrency = options.concurrency ?? 5;

  const results: Array<{ index: number; data: R }> = [];
  let completed = 0;

  // Process in chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // Process chunk with concurrency control
    const chunkResults = await batchExecute(
      chunk.map((item, chunkIndex) => async () => {
        const data = await processor(item);
        return data;
      }),
      { concurrency, logProgress: false }
    );

    // Aggregate results
    chunkResults.successful.forEach((result) => {
      const globalIndex = i + result.index;
      results.push({ index: globalIndex, data: result.data });
      completed++;

      // Call progress callback
      if (options.onProgress) {
        options.onProgress(completed, items.length);
      }
    });
  }

  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Group operations by key for batch optimization
 *
 * @param operations - Operations to group
 * @param keyFn - Function to extract grouping key
 * @returns Map of key to operations
 *
 * @example
 * ```typescript
 * const operations = [
 *   { url: 'https://example.com', priority: 'high' },
 *   { url: 'https://example.org', priority: 'low' },
 *   { url: 'https://example.net', priority: 'high' },
 * ];
 *
 * const grouped = groupBy(operations, op => op.priority);
 * // Map: 'high' -> [op1, op3], 'low' -> [op2]
 * ```
 */
export function groupBy<T>(
  operations: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const op of operations) {
    const key = keyFn(op);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(op);
  }

  return grouped;
}

/**
 * Create a batch progress reporter
 *
 * @param total - Total number of operations
 * @param interval - Reporting interval in milliseconds
 * @returns Progress reporter function
 *
 * @example
 * ```typescript
 * const report = createProgressReporter(100, 1000);
 *
 * await batchExecute(operations, {
 *   onProgress: (completed, total) => {
 *     report(completed);
 *   }
 * });
 * ```
 */
export function createProgressReporter(
  total: number,
  interval: number = 1000
): (completed: number) => void {
  let lastReport = 0;

  return (completed: number) => {
    const now = Date.now();
    if (now - lastReport >= interval || completed === total) {
      const percent = ((completed / total) * 100).toFixed(1);
      const eta = completed > 0 ? ((total - completed) * (now - lastReport) / completed) : 0;
      console.log(`📊 Progress: ${completed}/${total} (${percent}%) - ETA: ${Math.round(eta / 1000)}s`);
      lastReport = now;
    }
  };
}
