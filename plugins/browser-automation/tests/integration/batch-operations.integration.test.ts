/**
 * Batch Operations Integration Tests
 *
 * Tests batch operations and parallel processing:
 * - Multiple URL reads in parallel
 * - Multiple repo file reads
 * - Performance and error handling
 * Uses REAL MCP calls to validate batch processing capabilities
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchFeature } from '../../dist/features/research.feature.js';
import { RepositoryFeature } from '../../dist/features/repository.feature.js';

describe('Batch Operations Integration', { timeout: 30000 }, () => {
  const research = new ResearchFeature();
  const repoFeature = new RepositoryFeature();

  it('should read multiple URLs in parallel efficiently', async () => {
    const startTime = Date.now();

    // Search for documentation URLs
    const searchResult = await research.searchWeb('TypeScript official documentation');

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(searchResult.data.length >= 3, 'Should have at least 3 results');

    // Take top 5 URLs
    const urls = searchResult.data.slice(0, 5).map((r) => r.url);

    console.log(`Reading ${urls.length} URLs in parallel...\n`);

    // Read all URLs in parallel
    const readPromises = urls.map((url) => research.readUrl(url));
    const readResults = await Promise.all(readPromises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    const successfulReads = readResults.filter((r) => r.success);
    const failedReads = readResults.filter((r) => !r.success);

    console.log('✓ Parallel read complete:');
    console.log(`  Total URLs: ${urls.length}`);
    console.log(`  Successful: ${successfulReads.length}`);
    console.log(`  Failed: ${failedReads.length}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Average per URL: ${Math.round(duration / urls.length)}ms`);

    // Performance check: parallel should be faster than sequential
    // Assuming sequential would be ~2s per URL, parallel should be < ~5s total
    assert.ok(duration < 10000, 'Parallel reads should complete in < 10s');
    assert.ok(successfulReads.length >= urls.length / 2, 'At least half should succeed');

    // Validate content
    successfulReads.forEach((result, i) => {
      assert.ok(result.data.content.length > 100, `URL ${i} should have content`);
    });
  });

  it('should handle batch URL reads with error resilience', async () => {
    // Mix of valid and invalid URLs
    const urls = [
      'https://www.typescriptlang.org/docs/',  // Valid
      'https://this-domain-does-not-exist-12345.com',  // Invalid
      'https://nodejs.org/docs',  // May or may not work
      'https://github.com/microsoft/TypeScript',  // Valid
      'https://invalid-url-that-will-fail.com',  // Invalid
    ];

    console.log(`Reading ${urls.length} URLs (with expected failures)...\n`);

    // Read all with individual error handling
    const readResults = await Promise.all(
      urls.map(async (url) => {
        try {
          const result = await research.readUrl(url);
          return { url, success: result.success, error: result.error?.message };
        } catch (error) {
          return { url, success: false, error: (error as Error).message };
        }
      })
    );

    const successful = readResults.filter((r) => r.success);
    const failed = readResults.filter((r) => !r.success);

    console.log('✓ Batch read with error handling:');
    console.log(`  Successful: ${successful.length}`);
    console.log(`  Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\n  Failed URLs:');
      failed.forEach((f) => {
        console.log(`    - ${f.url.slice(0, 50)}...`);
      });
    }

    // Should handle errors without crashing
    assert.ok(readResults.length === urls.length, 'Should have result for each URL');
    assert.ok(successful.length > 0, 'At least one should succeed');

    // No errors should be thrown (all handled gracefully)
    const hasThrownErrors = readResults.some((r) => r.success === undefined);
    assert.ok(!hasThrownErrors, 'All errors should be handled gracefully');
  });

  it('should batch read repository files efficiently', async () => {
    const owner = 'facebook';
    const repo = 'react';

    // List of files to read
    const filePaths = [
      '/README.md',
      '/package.json',
      '/LICENSE',
      '/CONTRIBUTING.md',
      '/.gitignore',
      '/CODE_OF_CONDUCT.md',
    ];

    console.log(`Reading ${filePaths.length} repo files in batch...\n`);

    const startTime = Date.now();

    // Use batch read
    const batchResult = await repoFeature.batchReadFiles(
      owner,
      repo,
      filePaths,
      true,  // continue on error
      3     // concurrency
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    assert.ok(batchResult.success, 'Batch read should succeed');
    assert.ok(batchResult.data.length === filePaths.length, 'Should return results for all files');

    const files = batchResult.data;
    const successfulReads = files.filter((f) => f.success);
    const failedReads = files.filter((f) => !f.success);

    console.log('✓ Batch file read complete:');
    console.log(`  Total files: ${files.length}`);
    console.log(`  Successful: ${successfulReads.length}`);
    console.log(`  Failed: ${failedReads.length}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Average per file: ${Math.round(duration / files.length)}ms`);

    // Show file sizes
    console.log('\n  File sizes:');
    successfulReads.forEach((file) => {
      const size = file.size || file.content?.length || 0;
      console.log(`    ${file.path}: ${size} chars`);
    });

    assert.ok(successfulReads.length >= 3, 'At least 3 files should be read successfully');
  });

  it('should batch read with concurrency control', async () => {
    const owner = 'vitejs';
    const repo = 'vite';

    const filePaths = [
      '/package.json',
      '/README.md',
      '/LICENSE',
      '/tsconfig.json',
      '/vite.config.ts',
      '/.eslintrc.js',
    ];

    const concurrencyLevels = [1, 3, 6];
    const results: Array<{ concurrency: number; duration: number }> = [];

    console.log('Testing different concurrency levels...\n');

    for (const concurrency of concurrencyLevels) {
      const startTime = Date.now();

      const batchResult = await repoFeature.batchReadFiles(
        owner,
        repo,
        filePaths,
        true,
        concurrency
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      results.push({ concurrency, duration });

      if (batchResult.success) {
        const successful = batchResult.data.filter((f) => f.success).length;
        console.log(`✓ Concurrency ${concurrency}: ${duration}ms (${successful} successful)`);
      }
    }

    // Higher concurrency should generally be faster (or similar)
    // This is a soft assertion as network conditions vary
    const time1 = results.find((r) => r.concurrency === 1)?.duration || 0;
    const time3 = results.find((r) => r.concurrency === 3)?.duration || 0;

    console.log(`\nPerformance comparison:`);
    console.log(`  Concurrency 1: ${time1}ms`);
    console.log(`  Concurrency 3: ${time3}ms`);
    console.log(`  Speedup: ${Math.round((time1 / time3) * 100) / 100}x`);

    // Just verify the test completed
    assert.ok(results.length === 3, 'Should test all concurrency levels');
  });

  it('should perform batch repository searches', async () => {
    const repos = [
      { owner: 'vitejs', repo: 'vite' },
      { owner: 'facebook', repo: 'react' },
      { owner: 'vercel', repo: 'next.js' },
    ];

    const query = 'getting started';

    console.log(`Searching ${repos.length} repos for "${query}"...\n`);

    const searchResults = await Promise.all(
      repos.map(async ({ owner, repo }) => {
        const result = await repoFeature.searchRepoDocs(owner, repo, query, 'en');
        return { repo: `${owner}/${repo}`, result };
      })
    );

    console.log('✓ Batch repository search complete:');
    searchResults.forEach(({ repo, result }) => {
      if (result.success) {
        console.log(`  ${repo}: ${result.data.length} results`);
      } else {
        console.log(`  ${repo}: Failed`);
      }
    });

    // At least some searches should succeed
    const successful = searchResults.filter((r) => r.result.success);
    assert.ok(successful.length > 0, 'At least one search should succeed');
  });

  it('should process multiple research queries in parallel', async () => {
    const queries = [
      'React hooks tutorial',
      'TypeScript generics',
      'Next.js routing',
      'Vite configuration',
    ];

    console.log(`Processing ${queries.length} research queries in parallel...\n`);

    const startTime = Date.now();

    // Execute all searches in parallel
    const searchResults = await Promise.all(
      queries.map((query) => research.searchWeb(query))
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✓ Parallel search complete:');
    console.log(`  Total queries: ${queries.length}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Average per query: ${Math.round(duration / queries.length)}ms`);

    searchResults.forEach((result, i) => {
      if (result.success) {
        console.log(`  Query "${queries[i]}": ${result.data.length} results`);
      } else {
        console.log(`  Query "${queries[i]}": Failed`);
      }
    });

    // All should succeed
    const successful = searchResults.filter((r) => r.success);
    assert.ok(successful.length === queries.length, 'All searches should succeed');

    // Performance: parallel should be reasonably fast
    assert.ok(duration < 15000, 'Parallel searches should complete in < 15s');
  });

  it('should batch read and aggregate content from multiple sources', async () => {
    const topic = 'state management in React';
    const searchResult = await research.searchWeb(topic);

    assert.ok(searchResult.success, 'Search should succeed');

    // Take top 4 results
    const topResults = searchResult.data.slice(0, 4);
    const urls = topResults.map((r) => r.url);

    console.log(`Reading ${urls.length} sources on "${topic}"...\n`);

    // Read all in parallel
    const readResults = await Promise.all(
      urls.map((url) => research.readUrl(url))
    );

    const successfulReads = readResults.filter((r) => r.success);

    console.log(`✓ Read ${successfulReads.length} sources successfully`);

    // Aggregate content
    const aggregated = {
      totalChars: 0,
      totalWords: 0,
      sources: successfulReads.map((result, i) => ({
        url: urls[i],
        title: topResults[i].title,
        chars: result.data.content.length,
        words: result.data.content.split(/\s+/).length,
      })),
    };

    aggregated.totalChars = aggregated.sources.reduce((sum, s) => sum + s.chars, 0);
    aggregated.totalWords = aggregated.sources.reduce((sum, s) => sum + s.words, 0);

    console.log('\nAggregated content:');
    console.log(`  Total characters: ${aggregated.totalChars}`);
    console.log(`  Total words: ${aggregated.totalWords}`);
    console.log(`  Average chars per source: ${Math.round(aggregated.totalChars / aggregated.sources.length)}`);
    console.log(`  Average words per source: ${Math.round(aggregated.totalWords / aggregated.sources.length)}`);

    assert.ok(successfulReads.length >= 2, 'Should read at least 2 sources');
    assert.ok(aggregated.totalChars > 1000, 'Should have substantial aggregated content');
  });

  it('should handle batch operations with rate limiting awareness', async () => {
    const urls = [
      'https://example.com',
      'https://example.org',
      'https://example.net',
    ];

    console.log('Testing rate-limited batch operations...\n');

    // Sequential processing with delay
    const sequentialResults = [];
    for (const url of urls) {
      const result = await research.readUrl(url);
      sequentialResults.push(result);

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`✓ Sequential processing complete: ${sequentialResults.length} URLs`);

    // Compare with parallel (without delay)
    const parallelResults = await Promise.all(
      urls.map((url) => research.readUrl(url))
    );

    console.log(`✓ Parallel processing complete: ${parallelResults.length} URLs`);

    // Both should have same number of results
    assert.ok(sequentialResults.length === parallelResults.length, 'Should have same result count');
    assert.ok(sequentialResults.length === urls.length, 'Should process all URLs');
  });

  it('should batch read with content filtering', async () => {
    const owner = 'nodejs';
    const repo = 'node';

    const filePaths = [
      '/README.md',
      '/package.json',
      '/LICENSE',
    ];

    console.log('Reading files with content filtering...\n');

    const batchResult = await repoFeature.batchReadFiles(
      owner,
      repo,
      filePaths,
      true,
      3
    );

    assert.ok(batchResult.success, 'Batch read should succeed');

    const files = batchResult.data;

    // Filter files by content size
    const largeFiles = files.filter((f) => f.success && (f.size || 0) > 1000);
    const smallFiles = files.filter((f) => f.success && (f.size || 0) <= 1000);

    console.log('✓ Content filtering:');
    console.log(`  Large files (> 1000 chars): ${largeFiles.length}`);
    console.log(`  Small files (≤ 1000 chars): ${smallFiles.length}`);

    largeFiles.forEach((file) => {
      console.log(`    - ${file.path}: ${file.size} chars`);
    });

    // Filter files by content type
    const jsonFiles = files.filter((f) => f.path.endsWith('.json'));
    const markdownFiles = files.filter((f) => f.path.endsWith('.md'));

    console.log(`\n  JSON files: ${jsonFiles.length}`);
    console.log(`  Markdown files: ${markdownFiles.length}`);

    assert.ok(files.length === filePaths.length, 'Should have all files');
  });

  it('should measure batch operation performance metrics', async () => {
    const owner = 'facebook';
    const repo = 'react';

    const filePaths = [
      '/package.json',
      '/README.md',
      '/LICENSE',
      '/CONTRIBUTING.md',
    ];

    const concurrencyLevels = [2, 4];
    const metrics: Array<{
      concurrency: number;
      duration: number;
      successful: number;
      failed: number;
      avgTimePerFile: number;
    }> = [];

    console.log('Measuring performance metrics...\n');

    for (const concurrency of concurrencyLevels) {
      const startTime = Date.now();

      const batchResult = await repoFeature.batchReadFiles(
        owner,
        repo,
        filePaths,
        true,
        concurrency
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (batchResult.success) {
        const successful = batchResult.data.filter((f) => f.success).length;
        const failed = batchResult.data.filter((f) => !f.success).length;

        metrics.push({
          concurrency,
          duration,
          successful,
          failed,
          avgTimePerFile: Math.round(duration / filePaths.length),
        });
      }
    }

    console.log('\nPerformance Metrics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    metrics.forEach((m) => {
      console.log(`Concurrency: ${m.concurrency}`);
      console.log(`  Duration: ${m.duration}ms`);
      console.log(`  Successful: ${m.successful}`);
      console.log(`  Failed: ${m.failed}`);
      console.log(`  Avg time per file: ${m.avgTimePerFile}ms`);
      console.log('');
    });

    // Validate metrics
    assert.ok(metrics.length > 0, 'Should collect metrics');
    metrics.forEach((m) => {
      assert.ok(m.duration > 0, 'Duration should be positive');
      assert.ok(m.successful + m.failed === filePaths.length, 'Total files should match');
    });
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Batch Operations Integration Tests...\n');
}
