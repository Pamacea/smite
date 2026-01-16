#!/usr/bin/env node

/**
 * SMITE Toolkit - Post-Tool Use Hook
 *
 * Runs after each tool use during a Claude Code session.
 * Tracks token usage and warns at thresholds.
 *
 * WORKAROUND: Due to Claude Code bug #9567, environment variables
 * ($CLAUDE_TOOL_INPUT, $CLAUDE_EVENT_TYPE, etc.) are not populated.
 * We use a simple heuristic: track tool usage counts instead of tokens.
 */

const fs = require('fs');
const path = require('path');

// Paths
const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const budgetPath = path.join(toolkitDir, 'budget.json');
const statsPath = path.join(toolkitDir, 'stats.json');
const logPath = path.join(toolkitDir, 'usage.log');

function trackTokenUsage() {
  try {
    if (!fs.existsSync(budgetPath)) {
      return false;
    }

    // Read budget
    const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf-8'));

    // WORKAROUND: Since we can't get actual token usage due to bug #9567,
    // we track tool invocations and estimate tokens based on tool type
    // Average token cost per tool use: ~500 tokens (input + output)
    const estimatedTokensPerTool = 500;
    budget.usedTokens += estimatedTokensPerTool;

    // Log the tool usage
    const toolName = process.env.CLAUDE_TOOL_NAME || 'unknown';
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | Tool: ${toolName} | Est. tokens: ${estimatedTokensPerTool}\n`;
    fs.appendFileSync(logPath, logEntry, 'utf-8');

    const usedPercent = budget.usedTokens / budget.maxTokens;

    // Check thresholds
    if (usedPercent >= budget.criticalThreshold) {
      console.log('');
      console.warn(`🚨 CRITICAL: Token budget at ${(usedPercent * 100).toFixed(1)}%`);
      console.warn(`   Used: ${budget.usedTokens.toLocaleString()}/${budget.maxTokens.toLocaleString()}`);
      console.warn('');
    } else if (usedPercent >= budget.warnThreshold) {
      console.log('');
      console.log(`⚠️  Warning: Token budget at ${(usedPercent * 100).toFixed(1)}%`);
      console.log(`   Used: ${budget.usedTokens.toLocaleString()}/${budget.maxTokens.toLocaleString()}`);
      console.log('');
    }

    // Save updated budget
    budget.lastUpdated = new Date().toISOString();
    fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));

    return true;
  } catch (error) {
    console.error('⚠️  Token tracking failed:', error.message);
    return false;
  }
}

// Run token tracking
module.exports = trackTokenUsage();
