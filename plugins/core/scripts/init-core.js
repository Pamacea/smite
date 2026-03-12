#!/usr/bin/env node
/**
 * SMITE Core - Initialize Core
 *
 * Initializes SMITE Core systems for the current project.
 * Creates necessary directories and configuration files.
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, homedir } from 'path';

interface InitConfig {
  skipHooks?: boolean;
  skipMetrics?: boolean;
  verbose?: boolean;
}

function log(message: string, verbose: boolean) {
  if (verbose) {
    console.log(`[INFO] ${message}`);
  }
}

function initializeCore(config: InitConfig = {}) {
  const smiteDir = '.smite';
  const coreDir = join(smiteDir, 'core');
  const metricsDir = join(coreDir, 'metrics');
  const cacheDir = join(coreDir, 'cache');

  // Create directories
  const dirs = [smiteDir, coreDir, metricsDir, cacheDir];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`, config.verbose || false);
    }
  }

  // Initialize metrics file
  const metricsFile = join(metricsDir, 'metrics.json');
  if (!existsSync(metricsFile)) {
    const initialMetrics = {
      version: '2.0.0',
      initialized: new Date().toISOString(),
      templateUsage: {},
      platformStats: {
        windows: 0,
        macos: 0,
        linux: 0
      },
      tokenSavings: {
        totalTokens: 0,
        templates: 0
      }
    };
    writeFileSync(metricsFile, JSON.stringify(initialMetrics, null, 2));
    log(`Initialized metrics: ${metricsFile}`, config.verbose || false);
  }

  // Initialize cache index
  const cacheIndex = join(cacheDir, 'index.json');
  if (!existsSync(cacheIndex)) {
    writeFileSync(cacheIndex, JSON.stringify({
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      templates: {}
    }, null, 2));
    log(`Initialized cache index: ${cacheIndex}`, config.verbose || false);
  }

  // Create hooks.json if not exists
  const hooksFile = join(smiteDir, 'hooks.json');
  if (!existsSync(hooksFile) && !config.skipHooks) {
    writeFileSync(hooksFile, JSON.stringify({
      version: '2.0.0',
      hooks: {}
    }, null, 2));
    log(`Created hooks configuration: ${hooksFile}`, config.verbose || false);
  }

  return {
    success: true,
    directories: dirs,
    metricsFile,
    cacheIndex,
    hooksFile
  };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  const config: InitConfig = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipHooks: args.includes('--skip-hooks'),
    skipMetrics: args.includes('--skip-metrics')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node init-core.js [options]

Options:
  --verbose, -v      Enable verbose logging
  --skip-hooks      Skip hooks.json creation
  --skip-metrics    Skip metrics initialization

Description:
  Initializes SMITE Core for the current project.
  Creates necessary directories and configuration files.

Directories created:
  .smite/core/
  .smite/core/metrics/
  .smite/core/cache/

Files created:
  .smite/core/metrics/metrics.json
  .smite/core/cache/index.json
  .smite/hooks.json (unless --skip-hooks)

Examples:
  node init-core.js
  node init-core.js --verbose
  node init-core.js --skip-hooks
    `);
    process.exit(0);
  }

  try {
    const result = initializeCore(config);

    console.log('✅ SMITE Core initialized successfully!');
    console.log('\n📁 Directories created:');
    result.directories.forEach(d => console.log(`  - ${d}`));
    console.log('\n📄 Files created:');
    console.log(`  - ${result.metricsFile}`);
    console.log(`  - ${result.cacheIndex}`);
    if (result.hooksFile) {
      console.log(`  - ${result.hooksFile}`);
    }

    console.log('\n🎯 Next steps:');
    console.log('  1. Verify plugin configuration');
    console.log('  2. Run: npm run validate-plugin');
    console.log('  3. Start using SMITE Core features');

  } catch (error) {
    console.error(`❌ Initialization failed: ${error}`);
    process.exit(1);
  }
}

export { initializeCore, InitConfig };
