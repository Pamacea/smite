#!/usr/bin/env node
/**
 * SMITE Agents - Initialization Script (Cross-platform)
 * Initializes agent tracking and metrics
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

// Initialize tracking directory
const trackingDir = path.join(process.cwd(), '.smite', 'agents');
try {
  fs.mkdirSync(trackingDir, { recursive: true });
} catch {
  // Ignore
}

// Initialize metrics file
const metricsFile = path.join(trackingDir, 'metrics.json');

if (!fs.existsSync(metricsFile)) {
  const initialMetrics = {
    totalAgentInvocations: 0,
    byDomain: {
      frontend: 0,
      backend: 0,
      database: 0,
      devops: 0,
      workflow: 0,
      optimization: 0,
      testing: 0,
    },
    byAgent: {},
    lastUpdate: null,
  };
  fs.writeFileSync(metricsFile, JSON.stringify(initialMetrics, null, 2));
}

log(`[SMITE Agents]${colors.reset} Tracking initialized at ${metricsFile}`, colors.green);
log(`[SMITE Agents]${colors.cyan} 23 agents ready for lazy loading`, colors.cyan);

function log(msg, color = '') {
  process.stdout.write(`${color}${msg}${colors.reset || '\x1b[0m'}\n`);
}

process.exit(0);
