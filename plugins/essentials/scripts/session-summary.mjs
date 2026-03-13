#!/usr/bin/env node
/**
 * SMITE Essentials - Session Summary Hook (Cross-platform)
 * Displays session metrics on stop
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(msg, color = '') {
  process.stdout.write(`${color}${msg}${colors.reset}\n`);
}

const metricsFile = path.join(process.cwd(), '.smite', 'session-metrics.json');

if (fs.existsSync(metricsFile)) {
  log('[SMITE Essentials] Session Summary', colors.cyan);
  const content = fs.readFileSync(metricsFile, 'utf8');
  // Extract key: value pairs
  const matches = content.match(/"(\w+)":\s*(\d+)/g) || [];
  for (const match of matches) {
    const [, key, value] = match.match(/"(\w+)":\s*(\d+)/) || [];
    log(`  ${key}: ${value}`);
  }
  log('[SMITE Essentials] Session complete!', colors.green);
}

process.exit(0);
