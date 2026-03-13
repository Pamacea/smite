#!/usr/bin/env node
/**
 * SMITE Studio - Quality Gate Script (Cross-platform)
 * Provides objective quality metrics for code changes
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(msg, color = '') {
  process.stdout.write(`${color}${msg}${colors.reset}\n`);
}

log('');
log('════════════════════════════════════════', colors.cyan);
log('   SMITE Quality Gate', colors.cyan);
log('════════════════════════════════════════', colors.cyan);
log('');

// Get git diff if available
let files = [];
let linesAdded = 0;
let linesRemoved = 0;

try {
  // Check if we're in a git repo
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });

  // Get changed files
  const filesStr = execSync('git diff --cached --name-only 2>nul || git diff --name-only 2>nul || echo ""', {
    encoding: 'utf8',
    shell: true,
  });
  files = filesStr.trim().split('\n').filter(Boolean);

  // Count lines
  try {
    const diffStr = execSync('git diff --cached 2>nul || git diff 2>nul || echo ""', {
      encoding: 'utf8',
      shell: true,
    });
    linesAdded = (diffStr.match(/^\+/gm) || []).length;
    linesRemoved = (diffStr.match(/^-/gm) || []).length;
  } catch {
    // Ignore
  }
} catch {
  // Not in git repo
}

const fileCount = files.length;
const netChange = linesAdded - linesRemoved;

log('📊 Code Metrics:', colors.cyan);
log(`   Files changed: ${fileCount}`);
log(`   Lines added:   ${linesAdded}`);
log(`   Lines removed: ${linesRemoved}`);
log(`   Net change:    ${netChange}`);
log('');

// Quality scoring
let score = 0;
const maxScore = 100;

log('🔍 Quality Checks:', colors.cyan);

// Check for barrel exports
const hasBarrel = files.some((f) => f.includes('index.ts') || f.includes('index.js'));
if (hasBarrel) {
  log('   ✅ Barrel exports present', colors.green);
  score += 20;
} else {
  log('   ⚠️  No barrel exports detected', colors.yellow);
}

// Check for tests
const hasTests = files.some((f) => f.includes('.test.') || f.includes('.spec.'));
if (hasTests) {
  log('   ✅ Tests included', colors.green);
  score += 30;
} else {
  log('   ⚠️  No test files detected', colors.yellow);
}

// Check for TypeScript
const hasTypeScript = files.some((f) => /\.(tsx?)$/.test(f));
if (hasTypeScript) {
  // Try to check for 'any' usage in the diff
  try {
    const diffStr = execSync('git diff 2>nul || echo ""', { encoding: 'utf8', shell: true });
    if (diffStr.includes(': any')) {
      log("   ❌ Using 'any' type", colors.red);
    } else {
      log("   ✅ Type-safe (no 'any')", colors.green);
      score += 20;
    }
  } catch {
    score += 20;
  }
}

// Delete-first bonus
if (netChange < 0) {
  log('   ✅ Net code reduction!', colors.green);
  score += 30;
} else if (netChange === 0) {
  log('   ✅ Net zero change', colors.green);
  score += 15;
}

// Documentation check
const hasDocs = files.some((f) => f.endsWith('.md'));
if (hasDocs) {
  log('   ✅ Documentation updated', colors.green);
  score += 10;
}

log('');
log(`📈 Quality Score: ${score}/${maxScore}`, colors.cyan);

if (score >= 80) {
  log('   ✅ Excellent quality!', colors.green);
  process.exit(0);
} else if (score >= 50) {
  log('   ⚠️  Good quality, room for improvement', colors.yellow);
  process.exit(0);
} else {
  log('   ❌ Low quality score - review recommended', colors.red);
  process.exit(1);
}
