#!/usr/bin/env node
/**
 * SMITE Studio - Session Start Hook (Cross-platform)
 * Initializes session tracking
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const metricsDir = path.join(process.cwd(), '.smite');

try {
  fs.mkdirSync(metricsDir, { recursive: true });
} catch {
  // Ignore
}

const metricsFile = path.join(metricsDir, 'session-metrics.json');

if (!fs.existsSync(metricsFile)) {
  const initialMetrics = {
    filesModified: 0,
    linesAdded: 0,
    linesRemoved: 0,
    lastUpdate: null,
  };
  fs.writeFileSync(metricsFile, JSON.stringify(initialMetrics, null, 2));
}

function log(msg, color = '') {
  process.stderr.write(`${color}${msg}${colors.reset}\n`);
}

log('[SMITE Studio] v2.5.0 initialized', colors.cyan);

process.exit(0);
