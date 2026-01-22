#!/usr/bin/env node

/**
 * Bash Usage Enforcer - BLOCKING Hook
 *
 * This hook PREVENTS Bash usage of forbidden commands that should be replaced
 * with proper tools.
 *
 * Mode: BLOCK specific forbidden commands
 *       ALLOW all other bash commands
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const logPath = path.join(smiteDir, 'blocked-commands.log');

// Get command line args to check the command
const args = process.argv.slice(2);
const commandArg = args.find(arg => arg.startsWith('--command='));
const command = commandArg ? commandArg.replace('--command=', '').replace(/['"]/g, '') : '';

// Forbidden commands (should use proper tools instead)
const forbiddenCommands = ['ls', 'find', 'cat', 'grep', 'egrep', 'ag', 'rg', 'ack', 'tree'];

// Check if command contains any forbidden patterns
// We check the first word of the command (the actual program being run)
const firstWord = command.trim().split(/\s+/)[0];
const isForbidden = forbiddenCommands.includes(firstWord);

// Allow if not a forbidden command
if (!isForbidden) {
  process.exit(0);
}

// This is a forbidden command - block it
const timestamp = new Date().toISOString();

// Log the violation
let message = `\n[${timestamp}] BLOCKED - Forbidden Bash command\n`;
message += `  Tool: Bash\n`;
message += `  Command: ${command}\n`;
message += `  Reason: Forbidden command - use proper tool instead\n`;

try {
  fs.mkdirSync(smiteDir, { recursive: true });
  fs.appendFileSync(logPath, message);
} catch (err) {
  // Continue even if logging fails
}

// Map commands to their alternatives
const alternatives = {
  'ls': 'Use Glob tool (for finding files) or /toolkit explore (for discovery)',
  'find': 'Use /toolkit search (semantic search) or Glob tool (for files by pattern)',
  'cat': 'Use Read tool (for reading file contents)',
  'grep': 'Use /toolkit search (preferred) or mgrep (semantic search)',
  'egrep': 'Use /toolkit search (preferred) or mgrep (semantic search)',
  'ag': 'Use /toolkit search (preferred) or mgrep (semantic search)',
  'rg': 'Use /toolkit search (preferred) or mgrep (semantic search)',
  'ack': 'Use /toolkit search (preferred) or mgrep (semantic search)',
  'tree': 'Use /toolkit explore (intelligent file discovery) or Glob tool'
};

const alternative = alternatives[firstWord] || 'Use proper tools (Read, Glob, /toolkit search)';

// BLOCK the operation with error message
console.error('\n❌ BLOCKED: Forbidden Bash command detected');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.error('');
console.error(`🚫 The command "${firstWord}" is prohibited in Bash`);
console.error(`   Full command: ${command}`);
console.error('');
console.error('✅ Use INSTEAD:');
console.error(`   ${alternative}`);
console.error('');
console.error('📖 Why?');
console.error('   - Specialized tools are more efficient and precise');
console.error('   - Better error handling and context awareness');
console.error('   - Consistent with codebase workflow standards');
console.error('');
console.error('📚 Documentation:');
console.error('   - Toolkit: plugins/toolkit/README.md');
console.error('   - Rules: .claude/rules/core/03-tools.md');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Exit with error to BLOCK the operation
process.exit(1);
