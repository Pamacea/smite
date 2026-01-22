#!/usr/bin/env node

/**
 * Glob Usage Enforcer - BLOCKING Hook
 *
 * This hook PREVENTS Glob usage for file searching and forces /toolkit explore instead.
 *
 * Mode: BLOCK when used for searching (patterns with wildcards)
 *       ALLOW for simple file lookups (specific filenames)
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const logPath = path.join(smiteDir, 'blocked-commands.log');

// Get command line args to check the pattern
const args = process.argv.slice(2);
const patternArg = args.find(arg => arg.startsWith('--pattern='));
const pattern = patternArg ? patternArg.replace('--pattern=', '').replace(/['"]/g, '') : '';

// Check if pattern looks like a file search (contains wildcards)
const isSearchPattern = /[*?\[\]]/.test(pattern);

// Allow simple file lookups, block search patterns
if (!isSearchPattern) {
  // Simple pattern like "package.json" or "tsconfig.json" - allow it
  process.exit(0);
}

// This is a search pattern - block it
const timestamp = new Date().toISOString();

// Log the violation
let message = `\n[${timestamp}] BLOCKED - Glob tool usage for file search\n`;
message += `  Tool: Glob\n`;
message += `  Pattern: ${pattern}\n`;
message += `  Reason: Glob with wildcards is prohibited - use semantic search instead\n`;

try {
  fs.mkdirSync(smiteDir, { recursive: true });
  fs.appendFileSync(logPath, message);
} catch (err) {
  // Continue even if logging fails
}

// BLOCK the operation with error message
console.error('\n❌ BLOCKED: Glob tool usage for file search is prohibited');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.error('');
console.error('🚫 Glob with wildcards (*, ?, []) is prohibited for file searching');
console.error(`   Pattern detected: "${pattern}"`);
console.error('');
console.error('✅ Use these INSTEAD:');
console.error('   1. /toolkit search "query"   (semantic code search - 75% token savings)');
console.error('   2. /toolkit explore           (intelligent file discovery)');
console.error('   3. Glob tool                  (ONLY for specific filenames like "package.json")');
console.error('');
console.error('📖 Why?');
console.error('   - Semantic search understands code context');
console.error('   - 75% token savings vs traditional search');
console.error('   - 2x better precision for finding relevant code');
console.error('');
console.error('📚 Documentation:');
console.error('   - Toolkit: plugins/toolkit/README.md');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Exit with error to BLOCK the operation
process.exit(1);
