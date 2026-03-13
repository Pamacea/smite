#!/usr/bin/env node
/**
 * SMITE Agents - Agent Metrics Display (Cross-platform)
 * Shows agent usage metrics at session end
 */

import fs from 'node:fs';
import path from 'node:path';

const METRICS_FILE = path.join(process.cwd(), '.smite', 'agents', 'metrics.json');

const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

function log(msg, color = '') {
  process.stdout.write(`${color}${msg}${colors.reset}\n`);
}

if (fs.existsSync(METRICS_FILE)) {
  const content = fs.readFileSync(METRICS_FILE, 'utf8');
  log('');
  log('[SMITE Agents] Session Metrics', colors.cyan);
  log('════════════════════════════════════════');

  const match = content.match(/"totalAgentInvocations":\s*(\d+)/);
  const total = match ? parseInt(match[1], 10) : 0;
  log(`Agent invocations: ${total}`, colors.green);

  // Count agents by domain
  const agentsDir = path.join(process.cwd(), 'plugins', 'agents', 'agents');
  const domains = ['frontend', 'backend', 'database', 'devops', 'workflow', 'optimization'];

  log('');
  log('Available Agents:', colors.yellow);

  for (const domain of domains) {
    const domainPath = path.join(agentsDir, domain);
    let count = 0;
    try {
      if (fs.existsSync(domainPath)) {
        const files = fs.readdirSync(domainPath).filter((f) => f.endsWith('.agent.md'));
        count = files.length;
      }
    } catch {
      // Ignore
    }
    const label = domain.charAt(0).toUpperCase() + domain.slice(1).padEnd(12);
    log(`  ${label}: ${count}`);
  }
  log('');
} else {
  log('[SMITE Agents] No metrics recorded yet', colors.yellow);
}

process.exit(0);
