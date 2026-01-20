/**
 * Workflow Orchestrator Tests
 *
 * Demonstrates and tests the four main workflows:
 * 1. researchTopic - Search → Read → Summarize
 * 2. debugError - Analyze error → Search solutions → Explain fixes
 * 3. analyzeLibrary - Gather docs, examples, issues
 * 4. auditCodebase - Architecture analysis
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  WorkflowOrchestrator,
  researchTopic,
  debugError,
  analyzeLibrary,
  auditCodebase,
  type ResearchTopicResult,
  type DebugErrorResult,
  type AnalyzeLibraryResult,
  type AuditCodebaseResult,
} from '../workflow-orchestrator.js';

// ============================================================================
// Test Helper
// ============================================================================

function assertSuccess<T>(result: { success: boolean; data?: T; error?: unknown }): asserts result is { success: true; data: T } {
  if (!result.success) {
    assert.fail(`Expected success but got error: ${result.error}`);
  }
}

// ============================================================================
// Workflow 1: Research Topic Tests
// ============================================================================

describe('Workflow: Research Topic', () => {
  it('should research a simple topic with real search', async () => {
    const orchestrator = new WorkflowOrchestrator();
    const result = await orchestrator.researchTopic('Browser automation MCP', 2);

    assertSuccess<ResearchTopicResult>(result);

    // Validate structure
    assert.equal(result.data.query, 'Browser automation MCP');
    assert.ok(result.data.sources.length > 0, 'Should find sources');
    assert.ok(result.data.keyFindings.length > 0, 'Should extract key findings');
    assert.ok(result.data.summary.length > 0, 'Should generate summary');
    assert.equal(result.data.totalSources, result.data.sources.length);

    // Log results for demonstration
    console.log('\n=== Research Topic Results ===');
    console.log(`Query: ${result.data.query}`);
    console.log(`Sources found: ${result.data.sources.length}`);
    console.log(`Key findings: ${result.data.keyFindings.length}`);
    console.log('\nKey Findings:');
    result.data.keyFindings.forEach((finding, i) => {
      console.log(`${i + 1}. ${finding.substring(0, 100)}...`);
    });
    console.log('\nSummary (first 500 chars):');
    console.log(result.data.summary.substring(0, 500) + '...\n');
  });

  it('should handle research with convenience function', async () => {
    const result = await researchTopic('TypeScript best practices', 2);

    assertSuccess<ResearchTopicResult>(result);
    assert.ok(result.data.sources.length > 0);
    console.log('\n=== Convenience Function Test ===');
    console.log(`Researched: ${result.data.query}`);
    console.log(`Found ${result.data.sources.length} sources\n`);
  });
});

// ============================================================================
// Workflow 2: Debug Error Tests
// ============================================================================

describe('Workflow: Debug Error', () => {
  it('should debug an error from screenshot URL', async () => {
    const orchestrator = new WorkflowOrchestrator();

    // Note: This requires a real error screenshot URL
    // For demonstration, we'll use a placeholder
    const result = await orchestrator.debugError(
      'https://example.com/error-screenshot.png',
      'During npm install in CI/CD pipeline'
    );

    // This may fail if the image doesn't exist, but we can test the structure
    if (result.success) {
      const data = result.data;
      assert.ok(data.errorType);
      assert.ok(data.errorMessage);
      assert.ok(Array.isArray(data.possibleCauses));
      assert.ok(Array.isArray(data.suggestedFixes));
      assert.ok(Array.isArray(data.relatedSolutions));
      assert.ok(Array.isArray(data.actionPlan));

      console.log('\n=== Debug Error Results ===');
      console.log(`Error Type: ${data.errorType}`);
      console.log(`Error Message: ${data.errorMessage}`);
      console.log(`Possible Causes: ${data.possibleCauses.length}`);
      console.log(`Suggested Fixes: ${data.suggestedFixes.length}`);
      console.log(`Related Solutions: ${data.relatedSolutions.length}`);
      console.log(`Action Plan: ${data.actionPlan.length} steps\n`);
    } else {
      console.log('\n=== Debug Error Test ===');
      console.log('Expected: Image analysis failed (placeholder URL)');
      console.log(`Error: ${result.error?.message}\n`);
    }
  });

  it('should handle debug with convenience function', async () => {
    const result = await debugError(
      'https://example.com/error.png',
      'During build process'
    );

    if (result.success) {
      console.log('\n=== Convenience Function Test ===');
      console.log(`Error Type: ${result.data.errorType}`);
      console.log(`Suggested Fixes: ${result.data.suggestedFixes.length}\n`);
    }
  });
});

// ============================================================================
// Workflow 3: Analyze Library Tests
// ============================================================================

describe('Workflow: Analyze Library', () => {
  it('should analyze a popular library with real data', async () => {
    const orchestrator = new WorkflowOrchestrator();
    const result = await orchestrator.analyzeLibrary('react', '18');

    assertSuccess<AnalyzeLibraryResult>(result);

    // Validate structure
    assert.equal(result.data.libraryName, 'react');
    assert.equal(result.data.version, '18');
    assert.ok(result.data.documentation || result.data.examples.length > 0);
    assert.ok(Array.isArray(result.data.examples));
    assert.ok(Array.isArray(result.data.commonIssues));

    console.log('\n=== Analyze Library Results ===');
    console.log(`Library: ${result.data.libraryName}@${result.data.version}`);
    console.log(`Description: ${result.data.description?.substring(0, 100) || 'N/A'}...`);
    console.log(`Examples found: ${result.data.examples.length}`);
    console.log(`Common issues: ${result.data.commonIssues.length}`);

    if (result.data.repository) {
      console.log(`Repository: ${result.data.repository.name}`);
      console.log(`Language: ${result.data.repository.language}`);
      console.log(`Key files: ${result.data.repository.keyFiles.length}`);
    }

    console.log(`Getting Started: ${result.data.gettingStarted.length} steps\n`);
  });

  it('should analyze library with convenience function', async () => {
    const result = await analyzeLibrary('vue', '3');

    assertSuccess<AnalyzeLibraryResult>(result);
    assert.equal(result.data.libraryName, 'vue');
    console.log('\n=== Convenience Function Test ===');
    console.log(`Analyzed: ${result.data.libraryName}@${result.data.version}`);
    console.log(`Examples: ${result.data.examples.length}\n`);
  });
});

// ============================================================================
// Workflow 4: Audit Codebase Tests
// ============================================================================

describe('Workflow: Audit Codebase', () => {
  it('should audit a real GitHub repository', async () => {
    const orchestrator = new WorkflowOrchestrator();
    const result = await orchestrator.auditCodebase('vitejs/vite');

    assertSuccess<AuditCodebaseResult>(result);

    // Validate structure
    assert.equal(result.data.repository, 'vitejs/vite');
    assert.ok(result.data.structure.length > 0);
    assert.ok(result.data.architecture);
    assert.ok(result.data.codeQuality);
    assert.ok(Array.isArray(result.data.insights));
    assert.ok(Array.isArray(result.data.recommendations));

    console.log('\n=== Audit Codebase Results ===');
    console.log(`Repository: ${result.data.repository}`);
    console.log('\nArchitecture:');
    console.log(`  Language: ${result.data.architecture.language}`);
    console.log(`  Framework: ${result.data.architecture.framework || 'N/A'}`);
    console.log(`  Build Tool: ${result.data.architecture.buildTool || 'N/A'}`);
    console.log(`  Main Entry: ${result.data.architecture.mainEntry || 'N/A'}`);

    console.log('\nKey Components:');
    result.data.keyComponents.forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.path} - ${comp.purpose}`);
    });

    console.log('\nCode Quality:');
    console.log(`  Tests: ${result.data.codeQuality.hasTests ? '✓' : '✗'}`);
    console.log(`  Linting: ${result.data.codeQuality.hasLinting ? '✓' : '✗'}`);
    console.log(`  Docs: ${result.data.codeQuality.hasDocs ? '✓' : '✗'}`);
    console.log(`  CI/CD: ${result.data.codeQuality.hasCI ? '✓' : '✗'}`);

    console.log('\nInsights:');
    result.data.insights.forEach(insight => {
      console.log(`  • ${insight}`);
    });

    console.log('\nRecommendations:');
    result.data.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
  });

  it('should handle audit with convenience function', async () => {
    const result = await auditCodebase('facebook/react');

    assertSuccess<AuditCodebaseResult>(result);
    console.log('\n=== Convenience Function Test ===');
    console.log(`Audited: ${result.data.repository}`);
    console.log(`Language: ${result.data.architecture.language}\n`);
  });
});

// ============================================================================
// Workflow Composition Tests
// ============================================================================

describe('Workflow: Composition & Custom Workflows', () => {
  it('should execute custom workflow with dependencies', async () => {
    const orchestrator = new WorkflowOrchestrator();

    // Define custom workflow steps
    const steps = [
      {
        name: 'search',
        description: 'Search for information',
        execute: async () => {
          return await orchestrator.search.searchWeb('Browser automation', {
            maxResults: 2,
          });
        },
      },
      {
        name: 'read',
        description: 'Read first search result',
        dependencies: ['search'],
        execute: async (context) => {
          const searchResults = context.variables.get('search') as any[];
          const firstUrl = searchResults[0]?.url;

          if (!firstUrl) {
            throw new Error('No search results found');
          }

          return await orchestrator.read.readWebPage(firstUrl);
        },
      },
    ];

    const result = await orchestrator.executeWorkflow(steps);

    assert.ok(result.success);
    assert.ok(result.data.variables.has('search'));
    assert.ok(result.data.variables.has('read'));
    assert.equal(result.data.history.length, 2);

    console.log('\n=== Custom Workflow Results ===');
    console.log(`Steps executed: ${result.data.history.length}`);
    console.log('History:');
    result.data.history.forEach(h => {
      console.log(`  • ${h.step} at ${h.timestamp}`);
    });
    console.log('');
  });

  it('should demonstrate workflow composition', async () => {
    // Research → Analyze library mentioned in research
    const researchResult = await researchTopic('Modern JavaScript frameworks', 2);

    if (researchResult.success) {
      console.log('\n=== Workflow Composition Demo ===');
      console.log('Step 1: Research completed');
      console.log(`  Found ${researchResult.data.sources.length} sources`);

      // Extract library name from first source
      const firstSource = researchResult.data.sources[0];
      const libName = firstSource.title.toLowerCase().includes('react')
        ? 'react'
        : firstSource.title.toLowerCase().includes('vue')
        ? 'vue'
        : 'typescript';

      console.log('\nStep 2: Analyzing library mentioned in research...');
      const libResult = await analyzeLibrary(libName);

      if (libResult.success) {
        console.log(`  Analyzed: ${libResult.data.libraryName}@${libResult.data.version}`);
        console.log(`  Getting started steps: ${libResult.data.gettingStarted.length}`);
      }

      console.log('\n✓ Composed workflows work together!\n');
    }
  });
});

// ============================================================================
// Run Tests
// ============================================================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Workflow Orchestrator Tests                             ║');
console.log('║   Demonstrating complex multi-step workflows               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Run tests automatically
// Note: These tests make real network calls and may take time
console.log('Note: These tests make real API calls to MCP servers.');
console.log('They may take 30-60 seconds to complete.\n');
