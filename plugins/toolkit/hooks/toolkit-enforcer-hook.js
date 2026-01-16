#!/usr/bin/env node

/**
 * SMITE Toolkit - Enforcer Hook
 *
 * PreToolUse hook that ENFORCES toolkit-first policy
 * Blocks Grep/Glob/Bash usage for code exploration and redirects to /toolkit
 */

const fs = require('fs');
const path = require('path');

// Get tool use info from environment
const TOOL_USE_JSON = process.env.TOOL_USE;

if (!TOOL_USE_JSON) {
  // No tool use, nothing to enforce
  process.exit(0);
}

let toolUse;
try {
  toolUse = JSON.parse(TOOL_USE_JSON);
} catch (error) {
  // Can't parse, let it through
  process.exit(0);
}

const { name: toolName, input } = toolUse;

/**
 * Check if this is a code exploration attempt that should use toolkit instead
 */
function isCodeExplorationAttempt(toolName, input) {
  // Grep tool for code search
  if (toolName === 'Grep') {
    // Check if it's searching in source code
    const { pattern } = input;
    return pattern && !pattern.includes('\\.md') && !pattern.includes('README');
  }

  // Glob tool for finding source files
  if (toolName === 'Glob') {
    const { pattern } = input;
    return pattern && (
      pattern.includes('src/') ||
      pattern.includes('**/*.ts') ||
      pattern.includes('**/*.tsx') ||
      pattern.includes('**/*.js') ||
      pattern.includes('**/*.jsx')
    );
  }

  // Bash tool for code exploration (grep, find, cat, etc.)
  if (toolName === 'Bash') {
    const { command } = input;
    return command && (
      command.includes('grep') ||
      command.includes('find ') ||
      command.includes('cat ') ||
      command.includes('ls ') ||
      command.includes('tree') ||
      command.includes('rg ') ||
      command.includes('ag ')
    );
  }

  return false;
}

/**
 * Generate toolkit alternative command
 */
function suggestToolkitAlternative(toolName, input) {
  if (toolName === 'Grep') {
    const { pattern } = input;
    return `/toolkit search "${pattern}"`;
  }

  if (toolName === 'Glob') {
    return `/toolkit explore --task=find-component`;
  }

  if (toolName === 'Bash') {
    const { command } = input;

    if (command.includes('grep')) {
      const match = command.match(/grep\s+["']?([^"']+)["']?/);
      const query = match ? match[1] : 'code pattern';
      return `/toolkit search "${query}"`;
    }

    if (command.includes('find') || command.includes('ls')) {
      return `/toolkit explore --task=map-architecture`;
    }

    return `/toolkit search "your query here"`;
  }

  return '/toolkit search "your query"';
}

/**
 * Main enforcement logic
 */
function enforceToolkitPolicy() {
  if (!isCodeExplorationAttempt(toolName, input)) {
    // Not a code exploration attempt, allow it
    process.exit(0);
  }

  // This IS a code exploration attempt - BLOCK IT
  const suggestion = suggestToolkitAlternative(toolName, input);

  console.error('');
  console.error('⚠️  ====================================================');
  console.error('⚠️  TOOLKIT-FIRST POLICY VIOLATION DETECTED');
  console.error('⚠️  ====================================================');
  console.error('');
  console.error(`❌ You attempted to use ${toolName} for code exploration.`);
  console.error('');
  console.error('✅ REQUIRED: Use /toolkit instead for:');
  console.error('   • 75% token savings (180k → 45k)');
  console.error('   • 2x search precision (40% → 95%)');
  console.error('   • 40% more bugs detected');
  console.error('   • 2.5x faster than manual exploration');
  console.error('');
  console.error('🔧 SUGGESTED ALTERNATIVE:');
  console.error(`   ${suggestion}`);
  console.error('');
  console.error('📚 Available toolkit commands:');
  console.error('   /toolkit search "query"           - Semantic search');
  console.error('   /toolkit explore --task=X        - Find patterns');
  console.error('   /toolkit graph --impact          - Dependencies');
  console.error('   /toolkit detect --patterns="X"   - Bug detection');
  console.error('');
  console.error('📖 Reference: AGENTS.md | docs/DECISION_TREE.md');
  console.error('⚠️  ====================================================');
  console.error('');

  // Exit with error to BLOCK the tool use
  process.exit(1);
}

// Run enforcement
enforceToolkitPolicy();
