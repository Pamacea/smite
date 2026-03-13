#!/usr/bin/env node
/**
 * SMITE Essentials - File Changes Validation Hook (Cross-platform)
 * Validates file writes/edits for security and size constraints
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

function log(msg, color = '') {
  process.stderr.write(`${color}${msg}${colors.reset}\n`);
}

// Read input from stdin
let input = '';
try {
  input = await readStdin();
} catch {
  input = '{}';
}

let filePath = '';
let content = '';

try {
  const data = JSON.parse(input || '{}');
  filePath = data.file_path || '';
  content = data.content || '';
} catch {
  // Invalid JSON
}

// Skip if no file
if (!filePath) {
  process.exit(0);
}

// Security checks
const sensitivePatterns = [/\.env$/, /\.pem$/, /\.key$/, /secret/i, /password/i, /credentials/i];
for (const pattern of sensitivePatterns) {
  if (pattern.test(filePath)) {
    log(`[SMITE]⚠️  Sensitive file detected: ${filePath}`, colors.yellow);
    log('[SMITE]   Ensure no secrets are committed', colors.yellow);
  }
}

// Size check (prevent huge writes)
const size = content.length;
if (size > 100000) {
  log(`[SMITE]⚠️  Large file: ${size} bytes (max recommended: 100KB)`, colors.yellow);
}

// TypeScript quality check
if (/\.(ts|tsx)$/.test(filePath)) {
  if (content.includes(': any')) {
    log(`[SMITE]⚠️  Using 'any' type in ${filePath}`, colors.yellow);
  }
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
