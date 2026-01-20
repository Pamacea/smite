#!/usr/bin/env node

/**
 * SMITE Browser Automation CLI
 *
 * MCP-first command-line interface for web search, content reading,
 * image analysis, repository research, and automated workflows.
 *
 * @module @smite/browser-automation/cli
 */

import {
  searchWeb,
  readWebPage,
  type SearchFeature,
  type ReadFeature,
  type VisionFeature,
  type RepositoryFeature,
} from './features/index.js';
import {
  WorkflowOrchestrator,
  researchTopic,
  debugError,
  analyzeLibrary,
  auditCodebase,
} from './workflows/workflow-orchestrator.js';
import type { Result } from './mcp/types.js';

// ============================================================================
// CLI Interface
// ============================================================================

interface Command {
  name: string;
  args: string[];
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const command = parseCommand(args);
  const startTime = Date.now();

  try {
    await executeCommand(command);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Completed in ${duration}s`);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Parse command and arguments
 */
function parseCommand(args: string[]): Command {
  const [name, ...rest] = args;
  return { name, args: rest };
}

/**
 * Execute a command
 */
async function executeCommand(command: Command): Promise<void> {
  switch (command.name) {
    // ========================================================================
    // New MCP-powered commands
    // ========================================================================

    case 'search':
      await cmdSearch(command.args);
      break;

    case 'read':
      await cmdRead(command.args);
      break;

    case 'analyze-image':
      await cmdAnalyzeImage(command.args);
      break;

    case 'repo':
      await cmdRepo(command.args);
      break;

    case 'research':
      await cmdResearch(command.args);
      break;

    // ========================================================================
    // Deprecated commands (migration messages)
    // ========================================================================

    case 'goto':
      printDeprecatedMessage('goto', 'read', 'browse read <url>');
      break;

    case 'extract':
      printDeprecatedMessage('extract', 'read', 'browse read <url>');
      break;

    case 'screenshot':
      printDeprecatedMessage('screenshot', 'analyze-image', 'browse analyze-image <path>');
      break;

    case 'interactive':
      console.log('\n❌ The "interactive" command has been deprecated.');
      console.log('   Interactive browser mode is no longer supported.');
      console.log('   Please use your browser directly for manual navigation.\n');
      break;

    // ========================================================================
    // Help and unknown commands
    // ========================================================================

    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;

    default:
      console.error(`\n❌ Unknown command: ${command.name}`);
      console.log('   Run "browse help" to see available commands.\n');
      process.exit(1);
  }
}

// ============================================================================
// Command Implementations
// ============================================================================

/**
 * Search the web
 *
 * Usage: browse search <query> [--max-results N] [--time-range RANGE]
 */
async function cmdSearch(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: search requires a query');
    console.log('Usage: browse search <query> [--max-results N] [--time-range RANGE]');
    console.log('  --max-results N    Maximum number of results (default: 10)');
    console.log('  --time-range RANGE Time filter: oneDay, oneWeek, oneMonth, oneYear, noLimit');
    process.exit(1);
  }

  const query = args[0];
  const maxResults = parseFlag(args, '--max-results', '10');
  const timeRange = parseFlag(args, '--time-range', 'noLimit');

  console.log(`🔍 Searching for: "${query}"`);

  const result = await searchWeb(query, {
    maxResults: parseInt(maxResults, 10),
    timeRange: timeRange as any,
    enrich: true,
  });

  if (!result.success) {
    throw new Error(result.error?.message || 'Search failed');
  }

  console.log(`\n📊 Found ${result.data.length} results:\n`);

  result.data.forEach((r, i) => {
    console.log(`${i + 1}. **${r.title}**`);
    console.log(`   ${r.url}`);
    if (r.summary) {
      console.log(`   ${r.summary.substring(0, 150)}${r.summary.length > 150 ? '...' : ''}`);
    }
    console.log('');
  });
}

/**
 * Read a web page
 *
 * Usage: browse read <url>
 */
async function cmdRead(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: read requires a URL');
    console.log('Usage: browse read <url>');
    process.exit(1);
  }

  const url = args[0];
  console.log(`📖 Reading: ${url}`);

  const result = await readWebPage(url, {
    retainImages: false,
    withLinksSummary: true,
  });

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to read page');
  }

  console.log('\n' + result.data);
}

/**
 * Analyze an image
 *
 * Usage: browse analyze-image <path> [--prompt "custom prompt"]
 */
async function cmdAnalyzeImage(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: analyze-image requires a file path or URL');
    console.log('Usage: browse analyze-image <path> [--prompt "custom prompt"]');
    process.exit(1);
  }

  const imagePath = args[0];
  const customPrompt = parseFlag(args, '--prompt', '');

  const prompt = customPrompt || 'Describe this image in detail, including any text, UI elements, or important visual information.';

  console.log(`🔍 Analyzing image: ${imagePath}`);

  const { VisionFeature } = await import('./features/vision.feature.js');
  const vision = new VisionFeature();

  const result = await vision.analyzeImage(imagePath, prompt);

  if (!result.success) {
    throw new Error(result.error?.message || 'Image analysis failed');
  }

  console.log('\n' + result.data);
}

/**
 * Analyze a GitHub repository
 *
 * Usage: browse repo <owner/repo> [structure|docs|files <path>]
 */
async function cmdRepo(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: repo requires an owner/repo');
    console.log('Usage: browse repo <owner/repo> [structure|docs|files <path>]');
    console.log('  structure              Show repository structure');
    console.log('  docs <query>           Search documentation');
    console.log('  files <path>           Read file content');
    process.exit(1);
  }

  const repoId = args[0];
  const action = args[1] || 'structure';
  const actionArg = args[2];

  const { owner, repo } = parseRepoId(repoId);
  console.log(`🔍 Analyzing repository: ${owner}/${repo}`);

  const { RepositoryFeature } = await import('./features/repository.feature.js');
  const repositoryFeature = new RepositoryFeature();

  switch (action) {
    case 'structure': {
      const result = await repositoryFeature.getRepoStructure(owner, repo);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get structure');
      }
      console.log('\n' + result.data);
      break;
    }

    case 'docs': {
      if (!actionArg) {
        console.error('❌ Error: docs requires a search query');
        console.log('Usage: browse repo <owner/repo> docs <query>');
        process.exit(1);
      }
      const result = await repositoryFeature.searchRepoDocs(owner, repo, actionArg);
      if (!result.success) {
        throw new Error(result.error?.message || 'Documentation search failed');
      }
      console.log('\n' + result.data);
      break;
    }

    case 'files': {
      if (!actionArg) {
        console.error('❌ Error: files requires a file path');
        console.log('Usage: browse repo <owner/repo> files <path>');
        process.exit(1);
      }
      const result = await repositoryFeature.readRepoFile(owner, repo, actionArg);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to read file');
      }
      console.log('\n' + result.data);
      break;
    }

    default:
      console.error(`❌ Unknown repo action: ${action}`);
      console.log('Valid actions: structure, docs, files');
      process.exit(1);
  }
}

/**
 * Research a topic (workflow)
 *
 * Usage: browse research <query> [--sources N]
 */
async function cmdResearch(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: research requires a query');
    console.log('Usage: browse research <query> [--sources N]');
    console.log('  --sources N    Number of sources to analyze (default: 3)');
    process.exit(1);
  }

  const query = args[0];
  const sourceCount = parseInt(parseFlag(args, '--sources', '3'), 10);

  console.log(`🔬 Researching topic: "${query}"`);
  console.log(`   Analyzing ${sourceCount} sources...\n`);

  const result = await researchTopic(query, sourceCount);

  if (!result.success) {
    throw new Error(result.error?.message || 'Research failed');
  }

  const research = result.data;

  // Print summary
  console.log('\n' + research.summary);

  // Print key findings
  if (research.keyFindings.length > 0) {
    console.log('\n## Key Findings\n');
    research.keyFindings.forEach(finding => {
      console.log(`• ${finding}`);
    });
  }

  // Print sources
  console.log('\n## Sources\n');
  research.sources.forEach((source, i) => {
    console.log(`${i + 1}. **${source.title}**`);
    console.log(`   ${source.url}`);
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a flag value from arguments
 */
function parseFlag(args: string[], flag: string, defaultValue: string): string {
  const flagIndex = args.indexOf(flag);
  if (flagIndex === -1 || flagIndex === args.length - 1) {
    return defaultValue;
  }
  return args[flagIndex + 1];
}

/**
 * Parse owner/repo from string
 */
function parseRepoId(repoId: string): { owner: string; repo: string } {
  const parts = repoId.split('/');
  if (parts.length !== 2) {
    throw new Error(`Invalid repository format: ${repoId}. Expected: owner/repo`);
  }
  return { owner: parts[0], repo: parts[1] };
}

/**
 * Print deprecated command message
 */
function printDeprecatedMessage(
  oldCommand: string,
  newCommand: string,
  example: string
): void {
  console.log(`\n⚠️  The "${oldCommand}" command has been deprecated.`);
  console.log(`   Please use the new MCP-powered "${newCommand}" command instead.\n`);
  console.log(`   Example: ${example}\n`);
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
🌐 SMITE Browser Automation CLI (MCP-Powered)

Usage: browse <command> [options...]

Web Search & Reading:
  search <query>              Search the web
     --max-results N          Maximum results (default: 10)
     --time-range RANGE       Filter: oneDay, oneWeek, oneMonth, oneYear, noLimit

  read <url>                  Read a web page as markdown

Image Analysis:
  analyze-image <path>        Analyze an image with AI
     --prompt "text"          Custom analysis prompt

GitHub Research:
  repo <owner/repo>           Analyze a GitHub repository
     structure                Show repository structure (default)
     docs <query>             Search documentation
     files <path>             Read file content

Workflows:
  research <query>            Comprehensive research workflow
     --sources N              Number of sources (default: 3)

Help:
  help                        Show this help message

Examples:
  # Search the web
  browse search "Browser automation MCP"
  browse search "TypeScript 5" --max-results 5 --time-range oneWeek

  # Read a web page
  browse read https://example.com/article

  # Analyze an image
  browse analyze-image ./screenshot.png
  browse analyze-image ./ui.png --prompt "Describe the UI layout"

  # Research a GitHub repository
  browse repo vitejs/vite
  browse repo facebook/react docs "hooks"
  browse repo vuejs/core files src/index.ts

  # Run comprehensive research
  browse research "Next.js 15 server actions"
  browse research "AI agents 2025" --sources 5

For more information:
  https://github.com/pamacea/smite/tree/main/plugins/browser-automation
`);
}

// ============================================================================
// Start CLI
// ============================================================================

main();
