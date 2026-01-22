/**
 * Mgrep Mappers Tests
 *
 * Tests for mgrep result mapping functions
 */

import { describe, it, expect } from '@jest/globals';
import { mapMgrepResultToSearchResult, mapMgrepResults } from './mappers.js';
import type { MgrepSearchResult } from './client.js';

describe('Mgrep Mappers', () => {
  describe('mapMgrepResultToSearchResult', () => {
    it('should map a complete mgrep result correctly', () => {
      const input: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0.95,
        snippet: 'const foo = "bar";',
        startLine: 42,
        endLine: 45,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result).toEqual({
        filePath: '/path/to/file.ts',
        lineNumber: 42,
        content: 'const foo = "bar";',
        score: 0.95,
      });
    });

    it('should handle missing optional fields', () => {
      const input: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0.5,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result.filePath).toBe('/path/to/file.ts');
      expect(result.lineNumber).toBe(0); // fallback for missing startLine
      expect(result.content).toBe(''); // fallback for missing snippet
      expect(result.score).toBe(0.5);
    });

    it('should handle empty snippet', () => {
      const input: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0.8,
        snippet: '',
        startLine: 10,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result.content).toBe('');
    });

    it('should handle zero startLine', () => {
      const input: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0.7,
        startLine: 0,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result.lineNumber).toBe(0);
    });

    it('should handle special characters in snippet', () => {
      const input: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0.9,
        snippet: 'const regex = /\\d+/g;',
        startLine: 15,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result.content).toBe('const regex = /\\d+/g;');
    });

    it('should handle very long file paths', () => {
      const longPath = '/very/long/path/to/deeply/nested/directory/structure/file.ts';
      const input: MgrepSearchResult = {
        file: longPath,
        score: 0.6,
        snippet: 'code',
        startLine: 1,
      };

      const result = mapMgrepResultToSearchResult(input);

      expect(result.filePath).toBe(longPath);
    });

    it('should handle edge case scores (0 and 1)', () => {
      const inputZero: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 0,
        snippet: 'low relevance',
        startLine: 1,
      };

      const inputOne: MgrepSearchResult = {
        file: '/path/to/file.ts',
        score: 1,
        snippet: 'high relevance',
        startLine: 2,
      };

      const resultZero = mapMgrepResultToSearchResult(inputZero);
      const resultOne = mapMgrepResultToSearchResult(inputOne);

      expect(resultZero.score).toBe(0);
      expect(resultOne.score).toBe(1);
    });
  });

  describe('mapMgrepResults', () => {
    it('should map an empty array', () => {
      const results = mapMgrepResults([]);

      expect(results).toEqual([]);
    });

    it('should map a single result', () => {
      const inputs: MgrepSearchResult[] = [
        {
          file: 'a.ts',
          score: 0.9,
          snippet: 'code1',
          startLine: 1,
        },
      ];

      const results = mapMgrepResults(inputs);

      expect(results).toHaveLength(1);
      expect(results[0].filePath).toBe('a.ts');
      expect(results[0].content).toBe('code1');
    });

    it('should map multiple results', () => {
      const inputs: MgrepSearchResult[] = [
        { file: 'a.ts', score: 0.9, snippet: 'code1', startLine: 1 },
        { file: 'b.ts', score: 0.8, snippet: 'code2', startLine: 2 },
        { file: 'c.ts', score: 0.7, snippet: 'code3', startLine: 3 },
      ];

      const results = mapMgrepResults(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].filePath).toBe('a.ts');
      expect(results[1].filePath).toBe('b.ts');
      expect(results[2].filePath).toBe('c.ts');
    });

    it('should preserve order of results', () => {
      const inputs: MgrepSearchResult[] = [
        { file: 'first.ts', score: 0.5, snippet: 'first', startLine: 1 },
        { file: 'second.ts', score: 0.6, snippet: 'second', startLine: 2 },
        { file: 'third.ts', score: 0.7, snippet: 'third', startLine: 3 },
      ];

      const results = mapMgrepResults(inputs);

      expect(results[0].filePath).toBe('first.ts');
      expect(results[1].filePath).toBe('second.ts');
      expect(results[2].filePath).toBe('third.ts');
    });

    it('should handle mixed complete and incomplete results', () => {
      const inputs: MgrepSearchResult[] = [
        { file: 'complete.ts', score: 0.9, snippet: 'full code', startLine: 10 },
        { file: 'minimal.ts', score: 0.5 },
        { file: 'partial.ts', score: 0.7, startLine: 5 },
      ];

      const results = mapMgrepResults(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].lineNumber).toBe(10);
      expect(results[0].content).toBe('full code');
      expect(results[1].lineNumber).toBe(0); // fallback
      expect(results[1].content).toBe(''); // fallback
      expect(results[2].lineNumber).toBe(5);
      expect(results[2].content).toBe('');
    });
  });
});
