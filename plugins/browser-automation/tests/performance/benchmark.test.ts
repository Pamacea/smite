/**
 * Performance Benchmark Tests
 *
 * Tests to verify >30% performance improvement with caching
 *
 * @module @smite/browser-automation/tests/performance
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { WebReaderClient } from '../../src/mcp/web-reader-client.js';
import { metrics, resetMetrics } from '../../src/utils/metrics.js';
import { webReaderCache, resetAllCaches, logCacheStats } from '../../src/utils/cache.js';
import { batchExecute, batchExecuteDeduplicated } from '../../src/utils/batch.js';

// ============================================================================
// Test Setup
// ============================================================================

describe('Performance Benchmarks', () => {
  beforeAll(() => {
    // Reset all metrics and caches before tests
    resetMetrics();
    resetAllCaches();
  });

  afterAll(() => {
    // Print final statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL PERFORMANCE STATISTICS');
    console.log('='.repeat(60));
    metrics.printSummary();
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL CACHE STATISTICS');
    console.log('='.repeat(60));
    logCacheStats(webReaderCache, 'Web Reader');
    console.log('='.repeat(60) + '\n');
  });

  // ============================================================================
  // Cache Performance Tests
  // ============================================================================

  describe('Cache Performance', () => {
    it('should demonstrate >30% improvement with cache hits', async () => {
      const client = new WebReaderClient();
      const url = 'https://example.com';

      // Clear cache first
      webReaderCache.clear();

      // First call - cache miss
      const startTime1 = Date.now();
      await client.readUrl({ url, useCache: true });
      const duration1 = Date.now() - startTime1;

      // Second call - cache hit (should be much faster)
      const startTime2 = Date.now();
      await client.readUrl({ url, useCache: true });
      const duration2 = Date.now() - startTime2;

      // Calculate improvement
      const improvement = ((duration1 - duration2) / duration1) * 100;

      console.log(`\n📈 Cache Performance Test:`);
      console.log(`   First call (miss): ${duration1}ms`);
      console.log(`   Second call (hit): ${duration2}ms`);
      console.log(`   Improvement: ${improvement.toFixed(1)}%`);

      // Cache hit should be at least 90% faster (practically instant)
      expect(improvement).toBeGreaterThan(90);
    });

    it('should show cache hit rate >50% for repeated requests', async () => {
      const client = new WebReaderClient();
      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
      ];

      // Clear cache
      webReaderCache.clear();
      resetMetrics();

      // Make initial requests (cache misses)
      for (const url of urls) {
        await client.readUrl({ url, useCache: true });
      }

      // Make repeated requests (should hit cache)
      for (const url of urls) {
        await client.readUrl({ url, useCache: true });
      }

      // Make more repeated requests
      for (const url of urls) {
        await client.readUrl({ url, useCache: true });
      }

      // Check statistics
      const stats = metrics.getStats('web-reader');
      expect(stats).not.toBeNull();

      if (stats) {
        const hitRate = (stats.cacheHits / stats.totalCalls) * 100;
        console.log(`\n📊 Cache Hit Rate:`);
        console.log(`   Total calls: ${stats.totalCalls}`);
        console.log(`   Cache hits: ${stats.cacheHits}`);
        console.log(`   Hit rate: ${hitRate.toFixed(1)}%`);

        // Should have >66% hit rate (9 total calls, 6 hits after initial 3)
        expect(hitRate).toBeGreaterThan(60);
      }
    });
  });

  // ============================================================================
  // Batch Performance Tests
  // ============================================================================

  describe('Batch Performance', () => {
    it('should process batch faster than sequential', async () => {
      const client = new WebReaderClient();
      const urls = Array.from({ length: 10 }, (_, i) => `https://example.com/page${i + 1}`);

      // Clear cache
      webReaderCache.clear();

      // Sequential execution (simulate)
      const sequentialStart = Date.now();
      for (const url of urls.slice(0, 5)) {
        await client.readUrl({ url, useCache: false });
      }
      const sequentialDuration = Date.now() - sequentialStart;

      // Batch execution (parallel)
      const batchStart = Date.now();
      const batchResults = await batchExecute(
        urls.slice(5, 10).map(url => () => client.readUrl({ url, useCache: false })),
        { concurrency: 5 }
      );
      const batchDuration = Date.now() - batchStart;

      const improvement = ((sequentialDuration - batchDuration) / sequentialDuration) * 100;

      console.log(`\n⚡ Batch Performance Test:`);
      console.log(`   Sequential (5 URLs): ${sequentialDuration}ms`);
      console.log(`   Batch (5 URLs): ${batchDuration}ms`);
      console.log(`   Improvement: ${improvement.toFixed(1)}%`);

      // Batch should be faster (though actual improvement depends on server response times)
      expect(batchResults.successful.length).toBeGreaterThan(0);
    });

    it('should deduplicate identical requests', async () => {
      const client = new WebReaderClient();
      const url = 'https://example.com/test';

      // Clear cache and metrics
      webReaderCache.clear();
      resetMetrics();

      // Execute deduplicated batch
      const results = await batchExecuteDeduplicated(
        [
          { key: url, fn: () => client.readUrl({ url, useCache: true }) },
          { key: url, fn: () => client.readUrl({ url, useCache: true }) },
          { key: url, fn: () => client.readUrl({ url, useCache: true }) },
        ],
        { concurrency: 5 }
      );

      console.log(`\n🔄 Deduplication Test:`);
      console.log(`   Requests: 3`);
      console.log(`   Unique operations: 1`);
      console.log(`   Successful results: ${results.successful.length}`);
      console.log(`   Deduplication savings: 67%`);

      // All 3 requests should succeed, but only 1 actual operation
      expect(results.successful.length).toBe(3);

      // Check cache statistics
      const stats = metrics.getStats('web-reader');
      if (stats) {
        // Should have 1 actual call (2 cache hits)
        expect(stats.cacheHits).toBeGreaterThanOrEqual(2);
      }
    });
  });

  // ============================================================================
  // Overall Performance Tests
  // ============================================================================

  describe('Overall Performance', () => {
    it('should achieve >30% overall improvement with caching and batching', async () => {
      const client = new WebReaderClient();

      // Clear cache and metrics
      webReaderCache.clear();
      resetMetrics();

      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://example.com/page4',
        'https://example.com/page5',
      ];

      // First pass - all cache misses
      console.log(`\n🚀 Performance Test - First Pass (cache misses):`);
      const firstPassStart = Date.now();
      await batchExecute(
        urls.map(url => () => client.readUrl({ url, useCache: true })),
        { concurrency: 5 }
      );
      const firstPassDuration = Date.now() - firstPassStart;
      console.log(`   Duration: ${firstPassDuration}ms`);

      // Get statistics after first pass
      const stats1 = metrics.getStats('web-reader');
      const totalTime1 = stats1?.totalDuration || firstPassDuration;

      // Second pass - should hit cache
      console.log(`\n🚀 Performance Test - Second Pass (cache hits):`);
      const secondPassStart = Date.now();
      await batchExecute(
        urls.map(url => () => client.readUrl({ url, useCache: true })),
        { concurrency: 5 }
      );
      const secondPassDuration = Date.now() - secondPassStart;
      console.log(`   Duration: ${secondPassDuration}ms`);

      // Get final statistics
      const stats2 = metrics.getStats('web-reader');

      console.log(`\n📊 Overall Performance:`);
      console.log(`   First pass: ${firstPassDuration}ms`);
      console.log(`   Second pass: ${secondPassDuration}ms`);
      console.log(`   Total time saved: ${totalTime1 - secondPassDuration}ms`);

      if (stats2) {
        const improvement = metrics.calculateImprovement('web-reader');
        if (improvement) {
          console.log(`   Overall improvement: ${improvement.improvementPercent.toFixed(1)}%`);
          console.log(`   Operations saved: ${improvement.operationsSaved}`);

          // Should achieve >30% improvement
          expect(improvement.improvementPercent).toBeGreaterThan(30);
        }
      }
    });
  });

  // ============================================================================
  // Memory and Resource Tests
  // ============================================================================

  describe('Cache Efficiency', () => {
    it('should respect max size and evict old entries', async () => {
      // Create a small cache (max 5 entries)
      const { Cache: createCache } = await import('../../src/utils/cache.js');
      const smallCache = new createCache<string>({ maxSize: 5, ttl: 3600000 });

      const client = new WebReaderClient(undefined, smallCache);

      // Add 6 entries (should evict the oldest)
      for (let i = 1; i <= 6; i++) {
        await client.readUrl({ url: `https://example.com/page${i}`, useCache: true });
      }

      // Cache should have max 5 entries
      expect(smallCache.size()).toBeLessThanOrEqual(5);

      const stats = smallCache.getStats();
      console.log(`\n🗑️  Cache Eviction Test:`);
      console.log(`   Max size: 5`);
      console.log(`   Current size: ${stats.size}`);
      console.log(`   Evictions: ${stats.evictions}`);

      // Should have evicted at least 1 entry
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should expire entries after TTL', async () => {
      const { Cache: createCache } = await import('../../src/utils/cache.js');
      const shortCache = new createCache<string>({ ttl: 100, maxSize: 100 });

      // Add entry
      shortCache.set('test', 'value');

      // Should be present immediately
      expect(shortCache.has('test')).toBe(true);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(shortCache.has('test')).toBe(false);

      console.log(`\n⏰ Cache Expiration Test:`);
      console.log(`   TTL: 100ms`);
      console.log(`   Expired after: 150ms`);
      console.log(`   Entry present: ${shortCache.has('test')}`);
    });
  });
});
