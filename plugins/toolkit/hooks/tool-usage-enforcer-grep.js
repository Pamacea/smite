#!/usr/bin/env node

/**
 * Grep Usage Enforcer - BLOCKING Hook
 *
 * This hook PREVENTS ALL Grep usage and forces the use of semantic search instead.
 *
 * Mode: BLOCK (unconditional - Grep is never allowed)
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const logPath = path.join(smiteDir, 'blocked-commands.log');

const timestamp = new Date().toISOString();

// Log the violation
let message = `\n[${timestamp}] BLOCKED - Grep tool usage\n`;
message += `  Tool: Grep\n`;
message += `  Reason: Grep is prohibited - use semantic search instead\n`;

try {
  fs.mkdirSync(smiteDir, { recursive: true });
  fs.appendFileSync(logPath, message);
} catch (err) {
  // Continue even if logging fails
}

// BLOCK the operation with error message
console.error('\n❌ BLOCKED: Grep tool usage is prohibited');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.error('');
console.error('🚫 Grep is NEVER allowed in this codebase');
console.error('');
console.error('✅ Use these INSTEAD:');
console.error('   1. /toolkit search "query"   (preferred - 75% token savings, 2x precision)');
console.error('   2. mgrep "pattern"            (alternative semantic search)');
console.error('');
console.error('📖 Why?');
console.error('   - Traditional search: 180k tokens');
console.error('   - Toolkit search: 45k tokens');
console.error('   - 75% token savings + 2x better precision');
console.error('');
console.error('📚 Documentation:');
console.error('   - Toolkit: plugins/toolkit/README.md');
console.error('   - mgrep:  https://mgrep.dev');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Exit with error to BLOCK the operation
process.exit(1);
