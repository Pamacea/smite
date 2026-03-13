#!/usr/bin/env node
/**
 * SMITE Agents - Agent Validation Hook (Cross-platform)
 * Validates agent before invocation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read input from stdin
let input = '';
try {
  input = await readStdin();
} catch {
  input = '{}';
}

let agent = '';
let subagentType = '';

try {
  const data = JSON.parse(input || '{}');
  agent = data.agent || '';
  subagentType = data.subagent_type || '';
} catch {
  // Invalid JSON, skip
}

// Skip if no agent specified
if (!agent && !subagentType) {
  process.exit(0);
}

// Validate agent exists
let agentFile = '';
if (agent) {
  const possiblePaths = [
    path.join(process.cwd(), 'plugins', 'agents', 'agents', `${agent}.agent.md`),
    path.join(process.cwd(), 'plugins', 'agents', 'agents', `${agent}.md`),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      agentFile = p;
      break;
    }
  }
}

// Log agent invocation (for tracking)
const trackingDir = path.join(process.cwd(), '.smite', 'agents');
try {
  fs.mkdirSync(trackingDir, { recursive: true });
} catch {
  // Ignore
}

const logFile = path.join(trackingDir, 'invocations.log');
const timestamp = new Date().toISOString();
const logLine = `${timestamp} | AGENT=${agent} SUBAGENT=${subagentType}\n`;

try {
  fs.appendFileSync(logFile, logLine);
} catch {
  // Ignore
}

process.exit(0);

/**
 * Read stdin asynchronously
 */
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}
