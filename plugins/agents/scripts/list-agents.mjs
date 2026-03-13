#!/usr/bin/env node
/**
 * SMITE Agents - List Available Agents (Cross-platform)
 */

import fs from 'node:fs';
import path from 'node:path';

const agentsDir = path.join(process.cwd(), 'plugins', 'agents', 'agents');
const domains = ['frontend', 'backend', 'database', 'devops', 'workflow', 'optimization', 'testing'];

const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(msg, color = '') {
  process.stdout.write(`${color}${msg}${colors.reset}\n`);
}

log('');
log('════════════════════════════════════════', colors.cyan);
log('   SMITE Agents - Available Agents', colors.cyan);
log('════════════════════════════════════════', colors.cyan);
log('');

for (const domain of domains) {
  const domainPath = path.join(agentsDir, domain);
  if (!fs.existsSync(domainPath)) continue;

  const files = fs.readdirSync(domainPath).filter((f) => f.endsWith('.agent.md'));
  if (files.length === 0) continue;

  const label = domain.charAt(0).toUpperCase() + domain.slice(1);
  log(`\n${label}:`, colors.yellow);

  for (const file of files) {
    const name = file.replace('.agent.md', '');
    log(`  • ${name}`, colors.green);
  }
}

log('');
log('Usage: /studio build --agent <domain>/<name>', colors.cyan);
log('');

process.exit(0);
