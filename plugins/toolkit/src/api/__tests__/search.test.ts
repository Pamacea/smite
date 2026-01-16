/**
 * Code Search API Tests
 */

import { CodeSearchAPI, SearchStrategy, OutputFormat } from '../search.js';

describe('CodeSearchAPI', () => {
  let api: CodeSearchAPI;

  beforeEach(() => {
    api = new CodeSearchAPI();
  });

  test('should initialize successfully', () => {
    expect(api).toBeInstanceOf(CodeSearchAPI);
  });

  test('should search with default options', async () => {
    const result = await api.search('function test');

    expect(result).toHaveProperty('results');
    expect(result).toHaveProperty('resultCount');
    expect(result).toHaveProperty('strategy');
    expect(result).toHaveProperty('queryAnalysis');
    expect(result).toHaveProperty('executionTime');
    expect(Array.isArray(result.results)).toBe(true);
  });

  test('should search with custom strategy', async () => {
    const result = await api.search('test', {
      strategy: SearchStrategy.SEMANTIC,
      maxResults: 10,
    });

    expect(result.strategy).toBe(SearchStrategy.SEMANTIC);
    expect(result.results.length).toBeLessThanOrEqual(10);
  });

  test('should format output as table', async () => {
    const result = await api.search('test', {
      outputFormat: OutputFormat.TABLE,
    });

    expect(result.formatted).toBeDefined();
    expect(typeof result.formatted).toBe('string');
  });

  test('should format output as summary', async () => {
    const result = await api.search('test', {
      outputFormat: OutputFormat.SUMMARY,
    });

    expect(result.formatted).toBeDefined();
    expect(typeof result.formatted).toBe('string');
  });

  test('should clear cache', () => {
    expect(() => api.clearCache()).not.toThrow();
  });

  test('should get cache stats', () => {
    const stats = api.getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
  });
});
