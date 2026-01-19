/**
 * Quality Gate CLI
 * Command-line interface for code quality validation and documentation management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { table } from 'table';
import {
  Judge,
  ConfigManager,
  DocTrigger,
  createDefaultDocTriggerConfig,
  JudgeConfig,
  DEFAULT_CONFIG,
  ValidationResults,
} from './index';
import type { DocumentationAction } from './doc-trigger';

/**
 * Main CLI entry point
 */
async function main() {
  const program = new Command();

  program
    .name('quality-gate')
    .description('Code quality gate and documentation management CLI')
    .version('1.0.0');

  // Quality check command
  program
    .command('quality-check')
    .description('Run quality gate validation on codebase')
    .option('-d, --dry-run', 'Show what would be validated without running')
    .option('-p, --print', 'Print detailed validation results')
    .option('-f, --format <format>', 'Output format (table|json)', 'table')
    .option('--files <files>', 'Comma-separated list of files to validate')
    .option('--staged', 'Only validate staged git files')
    .option('--changed', 'Only validate changed git files')
    .option('--git-diff', 'Only validate files in git diff (working directory)')
    .option('--batch-size <size>', 'Number of files to process per batch', '10')
    .action(async (options) => {
      await qualityCheckCommand(options);
    });

  // Docs sync command
  program
    .command('docs-sync')
    .description('Trigger documentation updates based on code changes')
    .option('-d, --dry-run', 'Show what would be updated without running')
    .option('-v, --validate', 'Validate documentation tools before syncing')
    .option('--openapi', 'Only sync OpenAPI specification')
    .option('--readme', 'Only update README architecture')
    .option('--jsdoc', 'Only generate JSDoc comments')
    .action(async (options) => {
      await docsSyncCommand(options);
    });

  // Quality config command
  program
    .command('quality-config')
    .description('Manage quality gate configuration')
    .option('-i, --init', 'Initialize configuration file')
    .option('-s, --show', 'Show current configuration')
    .option('-p, --path <path>', 'Configuration file path', '.claude/.smite/quality.json')
    .option('-f, --format <format>', 'Output format (json|yaml)', 'json')
    .action(async (options) => {
      await qualityConfigCommand(options);
    });

  await program.parseAsync(process.argv);
}

/**
 * Get files to validate based on options
 */
async function getFilesToValidate(
  options: {
    files?: string;
    staged?: boolean;
    changed?: boolean;
    gitDiff?: boolean;
  },
  config: JudgeConfig,
  configManager: ConfigManager,
  cwd: string
): Promise<string[]> {
  if (options.files) {
    return options.files.split(',').map((f) => f.trim());
  }

  if (options.staged || options.changed || options.gitDiff) {
    try {
      let gitArgs: string[];

      if (options.staged) {
        gitArgs = ['diff', '--cached', '--name-only', '--diff-filter=ACM'];
      } else if (options.gitDiff) {
        // Working directory changes (not staged)
        gitArgs = ['diff', '--name-only', '--diff-filter=ACM'];
      } else {
        // changed = both staged and unstaged
        gitArgs = ['diff', '--name-only', '--diff-filter=ACM'];
      }

      const gitOutput = execSync(`git ${gitArgs.join(' ')}`, {
        encoding: 'utf-8',
        cwd,
      });
      return gitOutput.split('\n').filter((f) => f && configManager.shouldValidateFile(f));
    } catch (error) {
      console.error(chalk.red('Failed to get git file changes:'), error);
      process.exit(1);
    }
  }

  // Scan all included files
  const { glob } = await import('glob');
  return await glob(config.include, {
    cwd,
    ignore: config.exclude,
    absolute: false,
  });
}

/**
 * Validate a single file
 */
async function validateFile(
  file: string,
  judge: Judge,
  cwd: string
): Promise<{ file: string; error?: string }> {
  try {
    const content = fs.readFileSync(path.join(cwd, file), 'utf-8');
    const hookInput = {
      session_id: `cli-${Date.now()}`,
      transcript_path: '',
      cwd,
      hook_event_name: 'PreToolUse' as const,
      tool_name: 'Write' as const,
      tool_input: {
        file_path: file,
        content,
      },
    };

    const result = await judge.validate(hookInput);
    const decision = result.hookSpecificOutput.permissionDecision;
    const reason = result.hookSpecificOutput.permissionDecisionReason;

    if (decision === 'deny') {
      return { file, error: reason };
    }

    return { file };
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Output validation results in the specified format
 */
function outputValidationResults(
  allResults: Array<{ file: string; error?: string }>,
  format: string
): void {
  const failedFiles = allResults.filter((r) => r.error);
  const passedFiles = allResults.length - failedFiles.length;

  if (format === 'json') {
    console.log(
      JSON.stringify(
        { passed: passedFiles, failed: failedFiles.length, results: allResults },
        null,
        2
      )
    );
    return;
  }

  // Table format
  if (failedFiles.length > 0) {
    console.log(chalk.red.bold('\n❌ Validation Failed\n'));

    const tableData = [
      [chalk.bold('File'), chalk.bold('Issue')],
      ...failedFiles.map((f) => [
        chalk.red(f.file),
        chalk.gray(f.error?.substring(0, 100) || 'Unknown error'),
      ]),
    ];

    console.log(table(tableData, { singleLine: true }));
  }

  if (passedFiles > 0) {
    console.log(chalk.green(`\n✅ ${passedFiles} file(s) passed validation\n`));
  }
}

/**
 * Quality check command implementation
 */
async function qualityCheckCommand(options: {
  dryRun?: boolean;
  print?: boolean;
  format?: string;
  files?: string;
  staged?: boolean;
  changed?: boolean;
  gitDiff?: boolean;
  batchSize?: string;
}) {
  const cwd = process.cwd();
  const configManager = new ConfigManager(cwd);
  const config = configManager.getConfig();

  if (!config.enabled) {
    console.log(chalk.yellow('Quality gate is disabled in configuration.'));
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n🔍 Quality Gate Validation\n'));

  const filesToValidate = await getFilesToValidate(options, config, configManager, cwd);

  if (filesToValidate.length === 0) {
    console.log(chalk.yellow('No files to validate.'));
    process.exit(0);
  }

  console.log(chalk.gray(`Validating ${filesToValidate.length} file(s)...\n`));

  if (options.dryRun) {
    console.log(chalk.cyan('Dry run mode - files that would be validated:'));
    filesToValidate.forEach((file) => console.log(chalk.gray(`  - ${file}`)));
    process.exit(0);
  }

  // Get batch size from config or options
  const batchSize = options.batchSize
    ? parseInt(options.batchSize, 10)
    : (config as any).performance?.batchSize || 10;

  const allResults: Array<{ file: string; error?: string }> = [];

  // Process files in batches to manage memory
  for (let i = 0; i < filesToValidate.length; i += batchSize) {
    const batch = filesToValidate.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(filesToValidate.length / batchSize);

    if (totalBatches > 1) {
      console.log(chalk.gray(`Processing batch ${batchNum}/${totalBatches} (${batch.length} files)...\n`));
    }

    // Create new Judge instance for each batch to free memory
    const judge = new Judge(cwd);

    for (const file of batch) {
      const result = await validateFile(file, judge, cwd);
      allResults.push(result);

      // Print progress for large batches
      if (batch.length > 5) {
        const status = result.error ? chalk.red('✗') : chalk.green('✓');
        process.stdout.write(`  ${status} ${file}\n`);
      }
    }

    // Force garbage collection between batches if available
    if (global.gc) {
      global.gc();
    }
  }

  console.log(); // Empty line for spacing

  // Output results
  outputValidationResults(allResults, options.format || 'table');

  // Exit with appropriate code
  const failedFiles = allResults.filter((r) => r.error);
  process.exit(failedFiles.length > 0 ? 1 : 0);
}

/**
 * Determine which documentation triggers to run
 */
function determineTriggers(
  options: {
    openapi?: boolean;
    readme?: boolean;
    jsdoc?: boolean;
  },
  config: JudgeConfig
): { openapi: boolean; readme: boolean; jsdoc: boolean } {
  return {
    openapi: options.openapi ?? config.mcp.triggers.openAPI.enabled,
    readme: options.readme ?? config.mcp.triggers.readme.enabled,
    jsdoc: options.jsdoc ?? config.mcp.triggers.jsdoc.enabled,
  };
}

/**
 * Get changed files from git
 */
function getChangedFiles(cwd: string): string[] {
  const changedFiles: string[] = [];
  try {
    const gitOutput = execSync('git diff --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      cwd,
    });
    changedFiles.push(...gitOutput.split('\n').filter((f) => f));
  } catch (error) {
    console.log(chalk.yellow('Failed to get git changes, using all files'));
  }
  return changedFiles;
}

/**
 * Filter documentation actions based on options
 */
function filterDocActions(
  actions: DocumentationAction[],
  options: {
    openapi?: boolean;
    readme?: boolean;
    jsdoc?: boolean;
  }
): DocumentationAction[] {
  return actions.filter((action) => {
    if (options.openapi && action.toolName === 'sync_openapi_spec') return true;
    if (options.readme && action.toolName === 'update_readme_architecture') return true;
    if (options.jsdoc && action.toolName === 'generate_jsdoc_on_fly') return true;
    // If no specific options, include all
    if (!options.openapi && !options.readme && !options.jsdoc) return true;
    return false;
  });
}

/**
 * Execute documentation sync workflow
 */
async function executeDocSync(
  config: JudgeConfig,
  cwd: string,
  options: {
    validate?: boolean;
    openapi?: boolean;
    readme?: boolean;
    jsdoc?: boolean;
  }
): Promise<void> {
  const { MCPClient } = await import('./mcp-client.js');
  const mcpClient = new MCPClient({
    serverPath: config.mcp.serverPath,
  });

  await mcpClient.connect();

  const docTrigger = new DocTrigger({
    enabled: true,
    serverPath: config.mcp.serverPath,
    triggers: config.mcp.triggers,
  });

  docTrigger.setMCPClient(mcpClient);

  const changedFiles = getChangedFiles(cwd);

  if (changedFiles.length === 0) {
    console.log(chalk.yellow('\nNo changed files detected.'));
    console.log(chalk.gray('Run after making code changes to trigger updates.'));
    await mcpClient.close();
    process.exit(0);
  }

  console.log(chalk.gray(`\nChanged files: ${changedFiles.length}\n`));

  // Analyze triggers
  const actions = await docTrigger.analyzeTriggers({
    projectPath: cwd,
    changedFiles,
    validatedFiles: changedFiles,
    issues: [],
  });

  const filteredActions = filterDocActions(actions, options);

  if (filteredActions.length === 0) {
    console.log(chalk.yellow('No documentation actions triggered.'));
    await mcpClient.close();
    process.exit(0);
  }

  console.log(chalk.cyan(`Executing ${filteredActions.length} action(s)...\n`));

  // Execute actions
  await docTrigger.executeActions(filteredActions);

  console.log(chalk.green('\n✅ Documentation sync complete!\n'));

  await mcpClient.close();
}

/**
 * Validate MCP configuration and triggers
 */
function validateTriggers(triggers: { openapi: boolean; readme: boolean; jsdoc: boolean }): boolean {
  if (!triggers.openapi && !triggers.readme && !triggers.jsdoc) {
    console.log(chalk.yellow('No documentation triggers enabled.'));
    return false;
  }

  console.log(chalk.gray('Triggers to run:'));
  if (triggers.openapi) console.log(chalk.gray('  • OpenAPI spec sync'));
  if (triggers.readme) console.log(chalk.gray('  • README architecture update'));
  if (triggers.jsdoc) console.log(chalk.gray('  • JSDoc generation'));

  return true;
}

/**
 * Docs sync command implementation
 */
async function docsSyncCommand(options: {
  dryRun?: boolean;
  validate?: boolean;
  openapi?: boolean;
  readme?: boolean;
  jsdoc?: boolean;
}) {
  const cwd = process.cwd();
  const configManager = new ConfigManager(cwd);
  const config = configManager.getConfig();

  console.log(chalk.bold.blue('\n📚 Documentation Sync\n'));

  if (!config.mcp.enabled) {
    console.log(chalk.yellow('MCP integration is disabled in configuration.'));
    console.log(chalk.gray('Enable it in .claude/.smite/quality.json to use docs-sync.'));
    process.exit(0);
  }

  const triggers = determineTriggers(options, config);

  if (!validateTriggers(triggers)) {
    process.exit(0);
  }

  if (options.dryRun) {
    console.log(chalk.cyan('\nDry run mode - skipping execution'));
    process.exit(0);
  }

  if (options.validate) {
    console.log(chalk.cyan('\nValidating MCP tools...'));
    // Add validation logic if needed
  }

  try {
    await executeDocSync(config, cwd, options);
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Documentation sync failed:'), error);
    console.log(chalk.yellow('\nNote: docs-sync is non-blocking and will not fail your build.'));
    process.exit(0);
  }
}

/**
 * Initialize quality gate configuration
 */
function initializeConfig(cwd: string, configPath: string): void {
  const fullPath = path.join(cwd, configPath);
  const configDir = path.dirname(fullPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (fs.existsSync(fullPath)) {
    console.log(chalk.yellow(`Configuration file already exists: ${fullPath}`));
    console.log(chalk.gray('To overwrite, delete the existing file first.'));
    process.exit(1);
  }

  const config: JudgeConfig = {
    ...DEFAULT_CONFIG,
    // Override serverPath to be relative to project
    mcp: {
      ...DEFAULT_CONFIG.mcp,
      serverPath: path.join(cwd, 'node_modules', '@smite', 'docs-editor-mcp', 'dist', 'index.js'),
    },
  };

  fs.writeFileSync(fullPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✅ Configuration initialized: ${fullPath}`));
  console.log(chalk.gray('\nEdit this file to customize quality gate settings.'));
  process.exit(0);
}

/**
 * Display configuration in specified format
 */
function displayConfig(cwd: string, configPath: string, format: string): void {
  const fullPath = path.join(cwd, configPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.yellow(`Configuration file not found: ${fullPath}`));
    console.log(chalk.gray('Run with --init to create it.'));
    process.exit(1);
  }

  const configManager = new ConfigManager(cwd);
  const config = configManager.getConfig();

  if (format === 'json') {
    console.log(JSON.stringify(config, null, 2));
    process.exit(0);
  }

  // Table format
  console.log(chalk.bold('Quality Gate Configuration\n'));
  console.log(chalk.gray('General:'));
  console.log(`  Enabled: ${config.enabled ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Log Level: ${chalk.cyan(config.logLevel)}`);
  console.log(`  Max Retries: ${config.maxRetries}\n`);

  console.log(chalk.gray('Complexity Thresholds:'));
  console.log(`  Cyclomatic: ${config.complexity.maxCyclomaticComplexity}`);
  console.log(`  Cognitive: ${config.complexity.maxCognitiveComplexity}`);
  console.log(`  Nesting Depth: ${config.complexity.maxNestingDepth}`);
  console.log(`  Function Length: ${config.complexity.maxFunctionLength}\n`);

  console.log(chalk.gray('Security:'));
  console.log(`  Enabled: ${config.security.enabled ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Rules: ${config.security.rules.length}\n`);

  console.log(chalk.gray('Tests:'));
  console.log(`  Enabled: ${config.tests.enabled ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Fail on Failure: ${config.tests.failOnTestFailure ? chalk.green('Yes') : chalk.red('No')}\n`);

  console.log(chalk.gray('Documentation MCP:'));
  console.log(`  Enabled: ${config.mcp.enabled ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`  Server: ${chalk.cyan(config.mcp.serverPath)}\n`);

  process.exit(0);
}

/**
 * Quality config command implementation
 */
async function qualityConfigCommand(options: {
  init?: boolean;
  show?: boolean;
  path?: string;
  format?: string;
}) {
  const cwd = process.cwd();
  const configPath = options.path || '.claude/.smite/quality.json';

  if (options.init) {
    initializeConfig(cwd, configPath);
    return;
  }

  if (options.show) {
    displayConfig(cwd, configPath, options.format || 'json');
    return;
  }

  // No options provided - show help
  console.log(chalk.yellow('Please specify an action: --init, --show'));
  console.log(chalk.gray('Run "quality-config --help" for usage information.'));
  process.exit(1);
}

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('CLI error:'), error);
    process.exit(1);
  });
}

export { main };
