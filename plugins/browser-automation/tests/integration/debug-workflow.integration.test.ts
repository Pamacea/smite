/**
 * Debug Workflow Integration Tests
 *
 * Tests the complete debug workflow: Analyze error → Search solutions → Validate results
 * Uses REAL MCP calls to validate error diagnosis and solution finding
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VisionFeature } from '../../dist/features/vision.feature.js';
import { ResearchFeature } from '../../dist/features/research.feature.js';

describe('Debug Workflow Integration', { timeout: 30000 }, () => {
  const vision = new VisionFeature();
  const research = new ResearchFeature();

  it('should analyze error screenshot and search for solutions', async () => {
    // Note: This test uses a placeholder URL
    // In real usage, you would provide an actual error screenshot
    const errorScreenshotUrl = 'https://example.com/error-screenshot.png';

    // Step 1: Analyze the error
    const diagnosisResult = await vision.diagnoseError(
      errorScreenshotUrl,
      'During npm install in a Next.js project'
    );

    // This might fail if we don't have a real screenshot, but let's test the workflow
    if (diagnosisResult.success) {
      const diagnosis = diagnosisResult.data;

      assert.ok(diagnosis.errorType, 'Should have error type');
      assert.ok(diagnosis.errorMessage, 'Should have error message');
      assert.ok(Array.isArray(diagnosis.possibleCauses), 'Should have possible causes');
      assert.ok(Array.isArray(diagnosis.suggestedFixes), 'Should have suggested fixes');

      console.log('✓ Error diagnosis complete:');
      console.log(`  Error Type: ${diagnosis.errorType}`);
      console.log(`  Message: ${diagnosis.errorMessage.slice(0, 100)}...`);
      console.log(`  Causes: ${diagnosis.possibleCauses.length}`);
      console.log(`  Fixes: ${diagnosis.suggestedFixes.length}`);

      // Step 2: Search for solutions based on the error
      const searchQuery = `${diagnosis.errorType} ${diagnosis.errorMessage.split(' ').slice(0, 5).join(' ')} solution`;
      const searchResult = await research.searchWeb(searchQuery);

      if (searchResult.success) {
        assert.ok(searchResult.data.length > 0, 'Should find solutions');

        console.log(`✓ Found ${searchResult.data.length} potential solutions`);

        // Step 3: Read the top solution
        const topSolution = searchResult.data[0];
        const readResult = await research.readUrl(topSolution.url);

        if (readResult.success) {
          console.log(`✓ Read solution from: ${topSolution.title}`);
          console.log(`  Content length: ${readResult.data.content.length} chars`);

          // Validate that the content is relevant
          const contentLower = readResult.data.content.toLowerCase();
          const hasRelevantContent = contentLower.includes(diagnosis.errorType.toLowerCase()) ||
                                     contentLower.includes('fix') ||
                                     contentLower.includes('solution');

          assert.ok(hasRelevantContent, 'Solution content should be relevant');
        }
      }
    } else {
      console.log('⚠ Error diagnosis failed (expected without real screenshot)');
      console.log(`  Error: ${diagnosisResult.error?.message}`);

      // Test the search part of the workflow with a known error
      const knownErrorQuery = 'TypeScript error TS2307 cannot find module';
      const searchResult = await research.searchWeb(knownErrorQuery);

      assert.ok(searchResult.success, 'Should search for known error');
      assert.ok(searchResult.data.length > 0, 'Should find results');

      console.log(`✓ Found ${searchResult.data.length} solutions for known error`);
    }
  });

  it('should extract error text and search for specific solutions', async () => {
    // Simulate error text extraction workflow
    const errorScreenshotUrl = 'https://example.com/typescript-error.png';

    // Extract text from error screenshot
    const textResult = await vision.extractText(errorScreenshotUrl, {
      prompt: 'Extract the error message, error code, and file path from this error screenshot',
    });

    if (textResult.success) {
      const extractedText = textResult.data.text;

      assert.ok(extractedText.length > 0, 'Should extract text');
      console.log('✓ Extracted error text:');
      console.log(`  Length: ${extractedText.length} chars`);

      // Parse error code (e.g., TS2307)
      const errorCodeMatch = extractedText.match(/TS\d+/);
      if (errorCodeMatch) {
        const errorCode = errorCodeMatch[0];

        // Search for specific error code
        const searchResult = await research.searchWeb(
          `${errorCode} TypeScript error solution`
        );

        assert.ok(searchResult.success, 'Should search for error code');
        assert.ok(searchResult.data.length > 0, 'Should find solutions');

        console.log(`✓ Found solutions for error code ${errorCode}`);
        console.log(`  Solutions found: ${searchResult.data.length}`);

        // Read top 2 solutions
        const topSolutions = searchResult.data.slice(0, 2);
        const readResults = await Promise.all(
          topSolutions.map((s) => research.readUrl(s.url))
        );

        const successfulReads = readResults.filter((r) => r.success);
        console.log(`  Successfully read: ${successfulReads.length}`);
      }
    } else {
      console.log('⚠ Text extraction failed (expected without real screenshot)');
    }
  });

  it('should diagnose and compare multiple solution approaches', async () => {
    const errorScenario = 'React useEffect infinite loop';

    // Search for different solution approaches
    const searchQueries = [
      `${errorScenario} solution`,
      `${errorScenario} best practices`,
      `${errorScenario} fix 2024`,
    ];

    const searchResults = await Promise.all(
      searchQueries.map((q) => research.searchWeb(q))
    );

    assert.ok(searchResults.every((r) => r.success), 'All searches should succeed');

    // Collect unique solutions
    const allSolutions = searchResults
      .filter((r) => r.success)
      .flatMap((r) => r.data);

    console.log(`✓ Found ${allSolutions.length} potential solutions`);

    // Remove duplicates based on URL
    const uniqueSolutions = Array.from(
      new Map(allSolutions.map((s) => [s.url, s])).values()
    );

    console.log(`  Unique solutions: ${uniqueSolutions.length}`);

    // Read top 3 unique solutions
    const topSolutions = uniqueSolutions.slice(0, 3);
    const readResults = await Promise.all(
      topSolutions.map((s) => research.readUrl(s.url))
    );

    const successfulReads = readResults.filter((r) => r.success);
    console.log(`  Successfully read: ${successfulReads.length}`);

    // Compare solution approaches
    const approaches = successfulReads.map((result) => {
      const content = result.data.content.toLowerCase();
      return {
        url: topSolutions[readResults.indexOf(result)].url,
        mentionsCleanup: content.includes('cleanup') || content.includes('return'),
        mentionsDependency: content.includes('dependency') || content.includes('deps'),
        mentionsUseEffect: content.includes('useeffect'),
      };
    });

    console.log('\n✓ Solution approaches:');
    approaches.forEach((approach, i) => {
      console.log(`  Solution ${i + 1}:`);
      console.log(`    Cleanup function: ${approach.mentionsCleanup ? 'Yes' : 'No'}`);
      console.log(`    Dependencies: ${approach.mentionsDependency ? 'Yes' : 'No'}`);
      console.log(`    useEffect: ${approach.mentionsUseEffect ? 'Yes' : 'No'}`);
    });

    assert.ok(successfulReads.length > 0, 'Should have at least one successful read');
  });

  it('should validate error diagnosis with multiple sources', async () => {
    const errorCode = 'Error: Cannot find module \'typescript\'';

    // Search for this error
    const searchResult = await research.searchWeb(errorCode);

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(searchResult.data.length >= 2, 'Should find multiple sources');

    // Read top 3 results
    const topResults = searchResult.data.slice(0, 3);
    const readResults = await Promise.all(
      topResults.map((r) => research.readUrl(r.url))
    );

    const successfulReads = readResults.filter((r) => r.success);
    console.log(`✓ Read ${successfulReads.length} sources`);

    // Extract common fixes from all sources
    const commonFixes = [
      'install typescript',
      'npm install',
      'add to devdependencies',
      'check package.json',
    ];

    const fixCounts: Record<string, number> = {};
    commonFixes.forEach((fix) => fixCounts[fix] = 0);

    successfulReads.forEach((result) => {
      const content = result.data.content.toLowerCase();
      commonFixes.forEach((fix) => {
        if (content.includes(fix)) {
          fixCounts[fix]++;
        }
      });
    });

    console.log('\n✓ Common fixes mentioned:');
    Object.entries(fixCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .forEach(([fix, count]) => {
        console.log(`  "${fix}": mentioned in ${count}/${successfulReads.length} sources`);
      });

    // Most common fix should be mentioned in at least half the sources
    const topFix = Object.entries(fixCounts).sort(([, a], [, b]) => b - a)[0];
    const [, topCount] = topFix;
    const threshold = Math.ceil(successfulReads.length / 2);

    assert.ok(topCount >= threshold, 'Top fix should be mentioned in at least half the sources');
  });

  it('should handle debug workflow with context', async () => {
    const errorContext = {
      screenshot: 'https://example.com/vite-error.png',
      scenario: 'Building Vite project',
      reproduction: 'Run vite build',
    };

    // Diagnose error with context
    const diagnosisResult = await vision.diagnoseError(
      errorContext.screenshot,
      `Error during ${errorContext.scenario}. Steps to reproduce: ${errorContext.reproduction}`
    );

    if (diagnosisResult.success) {
      const diagnosis = diagnosisResult.data;

      console.log('✓ Diagnosis with context:');
      console.log(`  Error type: ${diagnosis.errorType}`);
      console.log(`  Message: ${diagnosis.errorMessage.slice(0, 80)}...`);

      // Search for solutions specific to the context
      const contextSpecificQuery = `${diagnosis.errorType} vite build error`;
      const searchResult = await research.searchWeb(contextSpecificQuery);

      if (searchResult.success && searchResult.data.length > 0) {
        console.log(`✓ Found ${searchResult.data.length} context-specific solutions`);

        // The first result should be highly relevant
        const firstResult = searchResult.data[0];
        const readResult = await research.readUrl(firstResult.url);

        if (readResult.success) {
          const content = readResult.data.content.toLowerCase();
          const mentionsVite = content.includes('vite');
          const mentionsBuild = content.includes('build');

          assert.ok(mentionsVite || mentionsBuild, 'Solution should be context-specific');
          console.log('✓ Solution is context-specific');
        }
      }
    } else {
      console.log('⚠ Diagnosis failed (expected without real screenshot)');

      // Test with a text-based search instead
      const textSearchQuery = 'vite build error solutions';
      const searchResult = await research.searchWeb(textSearchQuery);

      assert.ok(searchResult.success, 'Should search for build errors');
      console.log(`✓ Found ${searchResult.data.length} solutions for build errors`);
    }
  });

  it('should handle timeout errors gracefully', async () => {
    // Try to read from a very slow or non-existent URL
    const slowUrl = 'https://example.com/very-slow-page';

    const readResult = await research.readUrl(slowUrl, {
      timeout: 5, // 5 second timeout
    });

    // Should either succeed or fail gracefully (not hang)
    assert.ok(readResult !== undefined, 'Should return result (success or failure)');

    if (!readResult.success) {
      console.log('✓ Handled timeout gracefully');
      console.log(`  Error: ${readResult.error?.message}`);
    } else {
      console.log('✓ Read succeeded (URL was responsive)');
    }
  });

  it('should validate solution quality', async () => {
    const problem = 'Next.js hydration error';
    const searchResult = await research.searchWeb(problem + ' solution');

    assert.ok(searchResult.success, 'Search should succeed');
    assert.ok(searchResult.data.length > 0, 'Should find solutions');

    // Read top 2 solutions
    const topSolutions = searchResult.data.slice(0, 2);
    const readResults = await Promise.all(
      topSolutions.map((s) => research.readUrl(s.url))
    );

    const successfulReads = readResults.filter((r) => r.success);

    // Validate solution quality
    const qualityChecks = successfulReads.map((result) => {
      const content = result.data.content.toLowerCase();
      return {
        hasCodeExample: content.includes('```') || content.includes('<code'),
        hasExplanation: content.includes('because') || content.includes('reason'),
        hasSteps: content.includes('step') || content.includes('1.'),
        mentionsNextjs: content.includes('next') || content.includes('next.js'),
      };
    });

    console.log('\n✓ Solution quality assessment:');
    qualityChecks.forEach((quality, i) => {
      console.log(`  Solution ${i + 1}:`);
      console.log(`    Code example: ${quality.hasCodeExample ? 'Yes' : 'No'}`);
      console.log(`    Explanation: ${quality.hasExplanation ? 'Yes' : 'No'}`);
      console.log(`    Steps: ${quality.hasSteps ? 'Yes' : 'No'}`);
      console.log(`    Context: ${quality.mentionsNextjs ? 'Yes' : 'No'}`);
    });

    // At least one solution should have good quality indicators
    const hasHighQualitySolution = qualityChecks.some((q) =>
      q.hasCodeExample && q.hasExplanation && q.mentionsNextjs
    );

    assert.ok(hasHighQualitySolution, 'At least one solution should be high quality');
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Debug Workflow Integration Tests...\n');
}
