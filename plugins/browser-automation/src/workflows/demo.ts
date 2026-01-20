/**
 * Workflow Orchestrator Demonstration
 *
 * Real-world examples of using the workflow orchestrator
 * to solve complex, multi-step tasks.
 *
 * Run with: node dist/workflows/demo.js
 */

import {
  WorkflowOrchestrator,
  researchTopic,
  debugError,
  analyzeLibrary,
  auditCodebase,
} from '../index.js';

// ============================================================================
// Demo 1: Research Topic
// ============================================================================

async function demoResearchTopic() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 1: Research Topic                                   ║');
  console.log('║  Task: Research "Browser automation MCP"                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const orchestrator = new WorkflowOrchestrator();
  const result = await orchestrator.researchTopic('Browser automation MCP servers', 3);

  if (result.success) {
    const data = result.data;

    console.log(`✅ Research complete for: "${data.query}"`);
    console.log(`\n📊 Statistics:`);
    console.log(`   • Sources analyzed: ${data.totalSources}`);
    console.log(`   • Key findings: ${data.keyFindings.length}`);
    console.log(`   • Summary length: ${data.summary.length} chars`);

    console.log(`\n📝 Key Findings:`);
    data.keyFindings.forEach((finding, i) => {
      console.log(`   ${i + 1}. ${finding.substring(0, 120)}...`);
    });

    console.log(`\n📚 Sources:`);
    data.sources.forEach((source, i) => {
      console.log(`   ${i + 1}. ${source.title}`);
      console.log(`      ${source.url}`);
      console.log(`      ${source.summary.substring(0, 80)}...`);
    });

    console.log(`\n📄 Summary Preview:`);
    console.log(`   ${data.summary.substring(0, 300)}...`);
  } else {
    console.log(`❌ Research failed: ${result.error?.message}`);
  }
}

// ============================================================================
// Demo 2: Debug Error
// ============================================================================

async function demoDebugError() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 2: Debug Error                                     ║');
  console.log('║  Task: Debug error from screenshot                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Note: This would work with a real error screenshot
  // For demo purposes, we'll show what the result would look like
  console.log('ℹ️  Note: This demo requires a real error screenshot.');
  console.log('   Example usage:\n');

  console.log('   ```typescript');
  console.log('   const result = await debugError(');
  console.log('     "/path/to/error-screenshot.png",');
  console.log('     "During npm install"');
  console.log('   );');
  console.log('   ```\n');

  console.log('   Expected result structure:');
  console.log('   • Error type: e.g., "DependencyError"');
  console.log('   • Error message: Extracted from screenshot');
  console.log('   • Possible causes: Array of potential root causes');
  console.log('   • Suggested fixes: Array of actionable solutions');
  console.log('   • Related solutions: URLs to relevant docs/issues');
  console.log('   • Action plan: Step-by-step resolution guide');
}

// ============================================================================
// Demo 3: Analyze Library
// ============================================================================

async function demoAnalyzeLibrary() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 3: Analyze Library                                 ║');
  console.log('║  Task: Analyze React library                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const result = await analyzeLibrary('react', '18');

  if (result.success) {
    const data = result.data;

    console.log(`✅ Analysis complete for: ${data.libraryName}@${data.version}`);
    console.log(`\n📖 Description:`);
    console.log(`   ${data.description?.substring(0, 200) || 'N/A'}...`);

    console.log(`\n📚 Examples found: ${data.examples.length}`);
    data.examples.slice(0, 2).forEach((example, i) => {
      console.log(`   ${i + 1}. ${example.title}`);
      console.log(`      ${example.url}`);
      if (example.code) {
        console.log(`      Code: ${example.code.substring(0, 100)}...`);
      }
    });

    console.log(`\n⚠️  Common Issues: ${data.commonIssues.length}`);
    data.commonIssues.slice(0, 2).forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.issue}`);
      console.log(`      ${issue.solution.substring(0, 100)}...`);
    });

    if (data.repository) {
      console.log(`\n🔧 Repository Info:`);
      console.log(`   • Name: ${data.repository.name}`);
      console.log(`   • Language: ${data.repository.language}`);
      console.log(`   • Key files: ${data.repository.keyFiles.join(', ')}`);
    }

    console.log(`\n🚀 Getting Started:`);
    data.gettingStarted.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step.substring(0, 100)}...`);
    });
  } else {
    console.log(`❌ Analysis failed: ${result.error?.message}`);
  }
}

// ============================================================================
// Demo 4: Audit Codebase
// ============================================================================

async function demoAuditCodebase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 4: Audit Codebase                                   ║');
  console.log('║  Task: Audit Vite repository                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const result = await auditCodebase('vitejs/vite');

  if (result.success) {
    const data = result.data;

    console.log(`✅ Audit complete for: ${data.repository}`);
    console.log(`\n🏗️  Architecture:`);
    console.log(`   • Language: ${data.architecture.language}`);
    console.log(`   • Framework: ${data.architecture.framework || 'N/A'}`);
    console.log(`   • Build Tool: ${data.architecture.buildTool || 'N/A'}`);
    console.log(`   • Main Entry: ${data.architecture.mainEntry || 'N/A'}`);

    console.log(`\n📦 Key Components: ${data.keyComponents.length}`);
    data.keyComponents.slice(0, 5).forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.path}`);
      console.log(`      ${comp.purpose}`);
    });

    if (data.dependencies) {
      console.log(`\n📋 Dependencies (top 10): ${data.dependencies.slice(0, 10).join(', ')}`);
    }

    console.log(`\n✅ Code Quality:`);
    console.log(`   • Tests: ${data.codeQuality.hasTests ? '✓' : '✗'}`);
    console.log(`   • Linting: ${data.codeQuality.hasLinting ? '✓' : '✗'}`);
    console.log(`   • Docs: ${data.codeQuality.hasDocs ? '✓' : '✗'}`);
    console.log(`   • CI/CD: ${data.codeQuality.hasCI ? '✓' : '✗'}`);

    console.log(`\n💡 Insights:`);
    data.insights.forEach(insight => {
      console.log(`   • ${insight}`);
    });

    console.log(`\n🎯 Recommendations:`);
    data.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  } else {
    console.log(`❌ Audit failed: ${result.error?.message}`);
  }
}

// ============================================================================
// Demo 5: Composed Workflow
// ============================================================================

async function demoComposedWorkflow() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 5: Composed Workflow                                ║');
  console.log('║  Task: Research → Analyze → Audit                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Step 1: Research "TypeScript build tools"');
  const research = await researchTopic('TypeScript build tools', 2);

  if (research.success) {
    console.log(`   ✓ Found ${research.data.sources.length} sources`);

    // Extract Vite from research
    const viteSource = research.data.sources.find(s =>
      s.title.toLowerCase().includes('vite')
    );

    if (viteSource) {
      console.log('\nStep 2: Analyze Vite library (found in research)');
      const libAnalysis = await analyzeLibrary('vite');

      if (libAnalysis.success) {
        console.log(`   ✓ Analyzed ${libAnalysis.data.libraryName}@${libAnalysis.data.version}`);

        console.log('\nStep 3: Audit Vite codebase');
        const audit = await auditCodebase('vitejs/vite');

        if (audit.success) {
          console.log(`   ✓ Audited ${audit.data.repository}`);
          console.log(`   ✓ Architecture: ${audit.data.architecture.framework} with ${audit.data.architecture.buildTool}`);
          console.log(`   ✓ Code Quality Score: ${
            [
              audit.data.codeQuality.hasTests,
              audit.data.codeQuality.hasLinting,
              audit.data.codeQuality.hasDocs,
              audit.data.codeQuality.hasCI,
            ].filter(Boolean).length
          }/4`);
        }
      }
    }
  }

  console.log('\n✅ Composed workflow demonstrates:');
  console.log('   • Workflows can be chained together');
  console.log('   • Output of one workflow informs the next');
  console.log('   • Complex multi-step tasks become simple');
}

// ============================================================================
// Demo 6: Custom Workflow
// ============================================================================

async function demoCustomWorkflow() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 6: Custom Workflow                                 ║');
  console.log('║  Task: Define and execute custom workflow steps           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const orchestrator = new WorkflowOrchestrator();

  // Define custom workflow
  const steps = [
    {
      name: 'search',
      description: 'Search for Next.js documentation',
      execute: async () => {
        const result = await orchestrator.search.searchWeb('Next.js documentation', {
          domainFilter: ['nextjs.org', 'vercel.com'],
          maxResults: 3,
        });
        return result;
      },
    },
    {
      name: 'analyze',
      description: 'Analyze first search result',
      dependencies: ['search'],
      execute: async (context: any) => {
        const results = context.variables.get('search') as any[];
        const firstResult = results[0];

        return {
          success: true,
          data: {
            title: firstResult.title,
            url: firstResult.url,
            domain: firstResult.domain,
          },
        } as const;
      },
    },
    {
      name: 'summarize',
      description: 'Summarize findings',
      dependencies: ['search', 'analyze'],
      execute: async (context: any) => {
        const searchResults = context.variables.get('search') as any[];
        const analysis = context.variables.get('analyze') as any;

        return {
          success: true,
          data: {
            totalResults: searchResults.length,
            topPick: analysis.title,
            summaryText: `Found ${searchResults.length} results. Best match: "${analysis.title}" from ${analysis.domain}`,
          },
        } as const;
      },
    },
  ];

  const result = await orchestrator.executeWorkflow(steps);

  if (result.success) {
    console.log('✅ Custom workflow executed successfully');
    console.log(`\n📊 Execution Summary:`);
    console.log(`   • Steps completed: ${result.data.history.length}`);
    console.log(`   • Variables stored: ${result.data.variables.size}`);

    console.log(`\n📋 Execution History:`);
    result.data.history.forEach((entry, i) => {
      console.log(`   ${i + 1}. ${entry.step} at ${new Date(entry.timestamp).toLocaleTimeString()}`);
    });

    const summary = result.data.variables.get('summarize') as any;
    if (summary) {
      console.log(`\n📄 Final Output:`);
      console.log(`   ${summary.summaryText}`);
    }
  } else {
    console.log(`❌ Custom workflow failed: ${result.error?.message}`);
  }
}

// ============================================================================
// Main Demo Runner
// ============================================================================

async function runDemos() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   Workflow Orchestrator Demonstration                     ║');
  console.log('║   Real-World Complex Task Examples                        ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await demoResearchTopic();
    await demoDebugError();
    await demoAnalyzeLibrary();
    await demoAuditCodebase();
    await demoComposedWorkflow();
    await demoCustomWorkflow();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   All Demonstrations Complete ✅                          ║');
    console.log('║                                                            ║');
    console.log('║   Key Takeaways:                                          ║');
    console.log('║   • Workflows compose multiple operations automatically   ║');
    console.log('║   • Structured results are easy to consume                ║');
    console.log('║   • Convenience functions for quick usage                 ║');
    console.log('║   • Custom workflows support complex scenarios            ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  }
}

// Run demos
runDemos().catch(console.error);
