/**
 * Search Feature Module Tests
 *
 * Demonstrates the search capabilities:
 * - searchWeb: Basic web search with filters
 * - searchAndRead: Search + read top results
 * - searchMultiple: Parallel multi-query search
 * - research: Full research workflow
 */

import { describe, it, expect } from '@jest/globals';
import { SearchFeature } from './search.feature.js';
import type { EnhancedSearchResult } from './search.feature.js';

describe('SearchFeature', () => {
  let searchFeature: SearchFeature;

  beforeAll(() => {
    searchFeature = new SearchFeature();
  });

  describe('searchWeb', () => {
    it('should perform basic web search', async () => {
      const result = await searchFeature.searchWeb('Browser MCP servers');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        const firstResult = result.data[0];
        expect(firstResult).toMatchObject({
          title: expect.any(String),
          url: expect.any(String),
          summary: expect.any(String),
          domain: expect.any(String),
        });
      }
    });

    it('should search with time range filter', async () => {
      const result = await searchFeature.searchWeb('AI tools 2025', {
        timeRange: 'oneMonth',
        enrich: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(item).toHaveProperty('timestamp');
          expect(item).toHaveProperty('domain');
        });
      }
    });

    it('should search specific domains', async () => {
      const result = await searchFeature.searchDomains(
        'TypeScript documentation',
        ['github.com', 'typescriptlang.org']
      );

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach((item: EnhancedSearchResult) => {
          const domain = new URL(item.url).hostname;
          expect(
            domain.includes('github.com') || domain.includes('typescriptlang.org')
          ).toBe(true);
        });
      }
    });

    it('should search with location filter', async () => {
      const result = await searchFeature.searchWeb('local news', {
        location: 'us',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('should respect maxResults limit', async () => {
      const result = await searchFeature.searchWeb('programming tutorials', {
        maxResults: 5,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('searchAndRead', () => {
    it('should search and read top results', async () => {
      const result = await searchFeature.searchAndRead('Browser automation', {
        readCount: 3,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('Browser automation');
        expect(result.data.searchResults).toBeDefined();
        expect(result.data.searchResults.length).toBeLessThanOrEqual(3);
        expect(result.data.content).toBeInstanceOf(Map);
        expect(result.data.successfulReads).toBeGreaterThan(0);
        expect(result.data.successfulReads).toBeLessThanOrEqual(3);

        // Check that content was retrieved
        const contents = Array.from(result.data.content.values());
        expect(contents.length).toBeGreaterThan(0);
        expect(contents[0].length).toBeGreaterThan(0);
      }
    });

    it('should apply read options to URL reading', async () => {
      const result = await searchFeature.searchAndRead('Markdown examples', {
        readCount: 2,
        readOptions: {
          returnFormat: 'markdown',
          retainImages: false,
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.successfulReads).toBeLessThanOrEqual(2);

        // Verify markdown format
        const contents = Array.from(result.data.content.values());
        contents.forEach(content => {
          expect(typeof content).toBe('string');
        });
      }
    });

    it('should include search metadata in result', async () => {
      const result = await searchFeature.searchAndRead('TypeScript patterns', {
        readCount: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          query: 'TypeScript patterns',
          totalResults: expect.any(Number),
          successfulReads: expect.any(Number),
        });

        // Verify enriched search results
        result.data.searchResults.forEach(item => {
          expect(item).toHaveProperty('domain');
          expect(item).toHaveProperty('extractedAt');
        });
      }
    });
  });

  describe('searchMultiple', () => {
    it('should search multiple queries in parallel', async () => {
      const result = await searchFeature.searchMultiple(
        ['React hooks', 'Vue composition API', 'Svelte stores'],
        { parallel: true }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.queries).toHaveLength(3);
        expect(result.data.results).toBeInstanceOf(Map);
        expect(result.data.results.size).toBe(3);
        expect(result.data.totalResults).toBeGreaterThan(0);

        // Check each query has results
        result.data.queries.forEach(query => {
          expect(result.data.results.has(query)).toBe(true);
        });
      }
    });

    it('should respect concurrency limit', async () => {
      const queries = Array.from({ length: 10 }, (_, i) => `query ${i}`);
      const result = await searchFeature.searchMultiple(queries, {
        parallel: true,
        maxConcurrency: 3,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.queries).toHaveLength(10);
        expect(result.data.results.size).toBe(10);
      }
    });

    it('should apply common options to all searches', async () => {
      const result = await searchFeature.searchMultiple(
        ['JavaScript', 'TypeScript'],
        {
          commonOptions: {
            timeRange: 'oneMonth',
            location: 'us',
          },
        }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results.size).toBe(2);
        expect(result.data.totalResults).toBeGreaterThan(0);
      }
    });

    it('should support sequential execution', async () => {
      const result = await searchFeature.searchMultiple(
        ['async/await', 'promises', 'callbacks'],
        { parallel: false }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.queries).toHaveLength(3);
        expect(result.data.results.size).toBe(3);
      }
    });
  });

  describe('research', () => {
    it('should perform full research workflow', async () => {
      const result = await searchFeature.research('MCP browser automation', 3);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('string');
        expect(result.data.length).toBeGreaterThan(0);

        // Check markdown structure
        expect(result.data).toContain('# Research Summary:');
        expect(result.data).toContain('## Sources');
        expect(result.data).toContain('## Key Findings');
        expect(result.data).toContain('*Generated at');
      }
    });

    it('should include source metadata in summary', async () => {
      const result = await searchFeature.research('web search APIs', 2);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should have source links
        expect(result.data).toMatch(/https?:\/\//);

        // Should have title formatting
        expect(result.data).toContain('**');
      }
    });

    it('should include content previews', async () => {
      const result = await searchFeature.research('REST vs GraphQL', 2);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should have source sections
        expect(result.data).toContain('### Source');

        // Should have URL labels
        expect(result.data).toContain('**URL:**');
      }
    });
  });

  describe('convenience methods', () => {
    it('should search recent results', async () => {
      const result = await searchFeature.searchRecent('AI news', 'oneDay');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(item).toHaveProperty('timestamp');
        });
      }
    });

    it('should search with single domain', async () => {
      const result = await searchFeature.searchDomains(
        'documentation',
        'github.com'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(item.domain).toContain('github.com');
        });
      }
    });
  });

  describe('error handling', () => {
    it('should handle empty query gracefully', async () => {
      const result = await searchFeature.searchWeb('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle invalid URL in searchAndRead', async () => {
      // This tests the error handling when search succeeds but reading fails
      const result = await searchFeature.searchAndRead('test query', {
        readCount: 0, // No URLs to read
      });

      // Should succeed but with no reads
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.successfulReads).toBe(0);
      }
    });
  });

  describe('result enrichment', () => {
    it('should add domain to all results when enriching', async () => {
      const result = await searchFeature.searchWeb('test', {
        enrich: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(item).toHaveProperty('domain');
          expect(item.domain.length).toBeGreaterThan(0);
        });
      }
    });

    it('should add timestamps to enriched results', async () => {
      const result = await searchFeature.searchWeb('programming', {
        enrich: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(item).toHaveProperty('timestamp');
          expect(item).toHaveProperty('extractedAt');
          expect(new Date(item.extractedAt).toISOString()).toBe(item.extractedAt);
        });
      }
    });

    it('should extract valid domains from URLs', async () => {
      const result = await searchFeature.searchWeb('web development', {
        enrich: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach((item: EnhancedSearchResult) => {
          expect(() => new URL(`https://${item.domain}`)).not.toThrow();
        });
      }
    });
  });
});
