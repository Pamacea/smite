#!/usr/bin/env node

/**
 * SMITE Toolkit - Simple Policy Reminder
 *
 * Detects if manual tools (Grep/Glob/Bash) were used for code exploration
 * and reminds agent to use /toolkit instead.
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const logPath = path.join(toolkitDir, 'violations.log');

// Get last assistant output to detect violations
const lastOutput = process.env.LAST_ASSISTANT_OUTPUT || '';

// Simple detection patterns
const hasGrep = /Used Grep tool|<tool_use>\s*<name>Grep/i.test(lastOutput);
const hasGlob = /Used Glob tool|<tool_use>\s*<name>Glob/i.test(lastOutput);
const hasBashGrep = /Bash.*\b(grep|egrep|ag|rg|find|cat|ls|tree)\b/i.test(lastOutput);

if (hasGrep || hasGlob || hasBashGrep) {
  const timestamp = new Date().toISOString();
  let message = `\n[${timestamp}] Toolkit policy reminder: Use /toolkit instead\n`;
  message += `  - Grep detected: ${hasGrep}\n`;
  message += `  - Glob detected: ${hasGlob}\n`;
  message += `  - Bash grep detected: ${hasBashGrep}\n`;

  try {
    fs.mkdirSync(toolkitDir, { recursive: true });
    fs.appendFileSync(logPath, message);
  } catch (err) {
    // Silently ignore logging errors
  }

  console.warn('\n⚠️  Toolkit-first policy reminder:');
  console.warn('   Use /toolkit search "query" instead of Grep');
  console.warn('   Use /toolkit explore instead of Glob');
  console.warn('   Benefits: 75% token savings, 2x precision\n');
}

module.exports = true;
