/**
 * Research Workflow Integration Tests
 *
 * Tests the complete research workflow: Search → Read → Summarize
 * Uses REAL MCP calls to validate end-to-end functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchFeature } from '../../dist/features/research.feature.js';

describe('Research Workflow Integration', { timeout: 30000 }, () => {
  const research = new ResearchFeature();

  it('should complete full research workflow: search → read → summarize', async () => {
    // Step 1: Search for information
    const searchResult = await research.searchWeb('Browser automation MCP server');

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(Array.isArray(searchResult.data), 'Search should return array of results');

    const searchResults = searchResult.data;
    assert.ok(searchResults.length > 0, 'Search should return at least one result');

    // Validate search result structure
    const firstResult = searchResults[0];
    assert.ok(firstResult.title, 'Result should have title');
    assert.ok(firstResult.url, 'Result should have URL');
    assert.ok(firstResult.summary, 'Result should have summary');

    console.log(`✓ Found ${searchResults.length} search results`);
    console.log(`  Top result: ${firstResult.title}`);

    // Step 2: Read the top result's content
    const readResult = await research.readUrl(firstResult.url);

    assert.ok(readResult.success, 'Reading URL should succeed');
    assert.ok(readResult.data, 'Read result should have data');
    assert.ok(readResult.data.content, 'Content should not be empty');
    assert.ok(readResult.data.content.length > 100, 'Content should have substantial text');

    console.log(`✓ Read content from ${firstResult.url}`);
    console.log(`  Content length: ${readResult.data.content.length} chars`);

    // Step 3: Extract insights from the content
    const content = readResult.data.content;
    const insights = {
      title: firstResult.title,
      url: firstResult.url,
      keyPoints: [] as string[],
      technology: [] as string[],
    };

    // Extract key information (simple extraction for validation)
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    insights.keyPoints = lines.slice(0, 5); // First 5 non-empty lines as key points

    // Detect mentions of common technologies
    const techKeywords = ['TypeScript', 'JavaScript', 'Python', 'MCP', 'API', 'Model Context Protocol'];
    techKeywords.forEach((tech) => {
      if (content.includes(tech)) {
        insights.technology.push(tech);
      }
    });

    console.log('✓ Extracted insights:');
    console.log(`  Key points: ${insights.keyPoints.length}`);
    console.log(`  Technologies: ${insights.technology.join(', ')}`);

    // Validate workflow completion
    assert.ok(insights.keyPoints.length > 0, 'Should extract some key points');
    assert.ok(insights.title, 'Should have title');
    assert.ok(insights.url, 'Should have URL');
  });

  it('should search and read multiple sources in parallel', async () => {
    // Search for a query
    const searchResult = await research.searchWeb('Next.js 15 features');

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(searchResult.data.length >= 3, 'Should have at least 3 results');

    // Take top 3 results
    const topResults = searchResult.data.slice(0, 3);

    // Read all URLs in parallel
    const readPromises = topResults.map((result) => research.readUrl(result.url));
    const readResults = await Promise.all(readPromises);

    // Validate results
    const successfulReads = readResults.filter((r) => r.success);
    const failedReads = readResults.filter((r) => !r.success);

    console.log(`✓ Parallel read complete:`);
    console.log(`  Successful: ${successfulReads.length}/${readResults.length}`);
    console.log(`  Failed: ${failedReads.length}/${readResults.length}`);

    assert.ok(successfulReads.length >= 2, 'At least 2 reads should succeed');
    assert.ok(readResults.length === 3, 'Should have 3 results');

    // Validate content quality
    successfulReads.forEach((result, i) => {
      assert.ok(result.data.content.length > 50, `Result ${i} should have content`);
    });
  });

  it('should handle research workflow with specific topic', async () => {
    const topic = 'React Server Components';
    const query = `${topic} documentation 2024`;

    // Search
    const searchResult = await research.searchWeb(query);

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(searchResult.data.length > 0, 'Should find results');

    console.log(`✓ Found ${searchResult.data.length} results for "${topic}"`);

    // Filter for documentation/results from official sources
    const officialDocs = searchResult.data.filter((r) =>
      r.url.includes('react.dev') || r.url.includes('nextjs.org')
    );

    console.log(`  Official docs: ${officialDocs.length}`);

    // Read the first result
    const firstResult = searchResult.data[0];
    const readResult = await research.readUrl(firstResult.url);

    assert.ok(readResult.success, 'Should read successfully');

    // Validate content relevance
    const content = readResult.data.content.toLowerCase();
    const hasRelevantContent = content.includes('server') ||
                               content.includes('component') ||
                               content.includes('react');

    assert.ok(hasRelevantContent, 'Content should be relevant to the topic');

    console.log(`✓ Content is relevant to "${topic}"`);
  });

  it('should handle search with recency filter', async () => {
    // Search for recent information
    const searchResult = await research.searchWeb('TypeScript 5.7', 'oneMonth');

    assert.ok(searchResult.success, 'Search should succeed');

    console.log(`✓ Found ${searchResult.data.length} recent results`);

    // Validate results are recent
    const today = new Date();
    searchResult.data.forEach((result) => {
      if (result.publishDate) {
        const publishDate = new Date(result.publishDate);
        const daysDiff = Math.floor((today.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
        assert.ok(daysDiff <= 35, 'Results should be from the last month');
      }
    });
  });

  it('should summarize research findings', async () => {
    const query = 'Zustand state management';

    // Search
    const searchResult = await research.searchWeb(query);

    assert.ok(searchResult.success, 'Search should succeed');

    // Read top 2 results
    const topResults = searchResult.data.slice(0, 2);
    const readResults = await Promise.all(
      topResults.map((r) => research.readUrl(r.url))
    );

    const successfulReads = readResults.filter((r) => r.success);

    // Create summary
    const summary = {
      query,
      sourcesAnalyzed: successfulReads.length,
      totalSources: topResults.length,
      keyFindings: [] as string[],
      averageContentLength: 0,
    };

    // Calculate average content length
    const totalLength = successfulReads.reduce((sum, r) => sum + r.data.content.length, 0);
    summary.averageContentLength = Math.floor(totalLength / successfulReads.length);

    // Extract key findings (first sentence from each content)
    successfulReads.forEach((result) => {
      const firstSentence = result.data.content.split('.')[0];
      summary.keyFindings.push(firstSentence.trim());
    });

    console.log('✓ Research Summary:');
    console.log(`  Query: ${summary.query}`);
    console.log(`  Sources analyzed: ${summary.sourcesAnalyzed}/${summary.totalSources}`);
    console.log(`  Average content length: ${summary.averageContentLength} chars`);
    console.log(`  Key findings: ${summary.keyFindings.length}`);

    assert.ok(summary.sourcesAnalyzed > 0, 'Should analyze at least one source');
    assert.ok(summary.averageContentLength > 100, 'Content should be substantial');
    assert.ok(summary.keyFindings.length > 0, 'Should extract key findings');
  });

  it('should handle errors gracefully in research workflow', async () => {
    // Try to read an invalid URL
    const readResult = await research.readUrl('https://this-domain-does-not-exist-12345.com');

    assert.ok(!readResult.success, 'Read should fail for invalid URL');
    assert.ok(readResult.error, 'Should have error object');
    assert.ok(readResult.error.message, 'Should have error message');

    console.log(`✓ Handled invalid URL gracefully`);
    console.log(`  Error: ${readResult.error.message.slice(0, 100)}...`);
  });

  it('should search with domain filter', async () => {
    // Search only specific domains
    const searchResult = await research.searchWeb(
      'TypeScript documentation',
      'noLimit',
      ['typescriptlang.org', 'devblogs.microsoft.com']
    );

    assert.ok(searchResult.success, 'Search should succeed');

    // All results should be from specified domains
    const allFromSpecifiedDomains = searchResult.data.every((result) => {
      return result.url.includes('typescriptlang.org') ||
             result.url.includes('devblogs.microsoft.com');
    });

    assert.ok(allFromSpecifiedDomains, 'All results should be from specified domains');

    console.log(`✓ Domain filter works correctly`);
    console.log(`  All ${searchResult.data.length} results from specified domains`);
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Research Workflow Integration Tests...\n');
}
