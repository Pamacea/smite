#!/usr/bin/env node

/**
 * SMITE Toolkit - Post-Tool Use Hook
 *
 * Runs after each tool use during a Claude Code session.
 * Tracks ACTUAL token usage from transcript and enforces budget limits.
 *
 * IMPROVED: Now parses actual token usage from transcript instead of guessing.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Paths
const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const budgetPath = path.join(toolkitDir, 'budget.json');
const statsPath = path.join(toolkitDir, 'stats.json');
const logPath = path.join(toolkitDir, 'usage.log');

// Per-tool token estimates (fallback when transcript not available)
const TOOL_TOKEN_ESTIMATES = {
  'Read': 5000,      // Large file reads can be 10K+ tokens
  'Write': 2000,     // Writing content varies
  'Edit': 1000,      // Small edits
  'Grep': 3000,      // Search results
  'Glob': 500,       // File lists
  'Bash': 2000,      // Command output varies widely
  'WebSearch': 1500, // Web search results
  'WebFetch': 2000,  // Fetched content
  'Task': 1000,      // Agent launches
  'Skill': 500,      // Skill invocations
  'default': 1000    // Conservative default
};

/**
 * Find transcript file in platform-specific location
 */
function findTranscriptPath() {
  const platform = os.platform();
  let transcriptDir;

  if (platform === 'win32') {
    transcriptDir = path.join(os.homedir(), 'AppData', 'Local', 'Claude', 'sessions');
  } else if (platform === 'darwin') {
    transcriptDir = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'sessions');
  } else {
    transcriptDir = path.join(os.homedir(), '.config', 'Claude', 'sessions');
  }

  if (!fs.existsSync(transcriptDir)) {
    return null;
  }

  // Find most recent session directory
  const sessions = fs.readdirSync(transcriptDir)
    .filter(f => f.startsWith('user_'))
    .map(f => ({
      name: f,
      path: path.join(transcriptDir, f)
    }))
    .filter(f => fs.statSync(f.path).isDirectory())
    .sort((a, b) => {
      const statA = fs.statSync(a.path);
      const statB = fs.statSync(b.path);
      return statB.mtimeMs - statA.mtimeMs;
    });

  if (sessions.length === 0) {
    return null;
  }

  // Return transcript file from most recent session
  return path.join(sessions[0].path, 'transcript.txt');
}

/**
 * Parse actual token usage from transcript
 */
function parseActualTokens(transcriptPath) {
  try {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      return null;
    }

    // Read last 5 lines to find most recent assistant message
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim()).slice(-5);

    // Parse lines in reverse to find most recent assistant message
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.type === 'assistant' && entry.usage) {
          return {
            inputTokens: entry.usage.input_tokens || 0,
            outputTokens: entry.usage.output_tokens || 0,
            totalTokens: (entry.usage.input_tokens || 0) + (entry.usage.output_tokens || 0)
          };
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get token estimate for tool
 */
function getTokenEstimate(toolName) {
  // Map common tool aliases
  const normalizedTool = toolName.replace(/^skll_/, '').replace(/^cmd_/, '');

  return TOOL_TOKEN_ESTIMATES[normalizedTool] || TOOL_TOKEN_ESTIMATES['default'];
}

function trackTokenUsage() {
  try {
    if (!fs.existsSync(budgetPath)) {
      return false;
    }

    // Read budget
    const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf-8'));

    // Try to parse actual token usage from transcript
    const transcriptPath = findTranscriptPath();
    const actualTokens = parseActualTokens(transcriptPath);

    let tokensUsed = 0;
    let trackingMethod = '';

    if (actualTokens && actualTokens.totalTokens > 0) {
      // Use actual token usage from transcript
      tokensUsed = actualTokens.totalTokens;
      trackingMethod = 'actual';
    } else {
      // Fallback to tool-based estimation
      const toolName = process.env.CLAUDE_TOOL_NAME || 'unknown';
      tokensUsed = getTokenEstimate(toolName);
      trackingMethod = 'estimated';
    }

    // Update budget
    budget.usedTokens += tokensUsed;

    // Log the tool usage
    const timestamp = new Date().toISOString();
    const toolName = process.env.CLAUDE_TOOL_NAME || 'unknown';
    const logEntry = `${timestamp} | Tool: ${toolName} | Tokens: ${tokensUsed} (${trackingMethod})\n`;
    fs.appendFileSync(logPath, logEntry, 'utf-8');

    const usedPercent = budget.usedTokens / budget.maxTokens;

    // Check thresholds - NEW: Hard limit at 95%
    if (usedPercent >= 0.95) {
      console.log('');
      console.error('🚨 CRITICAL: Token budget exhausted (95%+)');
      console.error(`   Used: ${budget.usedTokens.toLocaleString()}/${budget.maxTokens.toLocaleString()} (${(usedPercent * 100).toFixed(1)}%)`);
      console.error('   Session should be ended to prevent exceeding quota.');
      console.error('');
    } else if (usedPercent >= budget.criticalThreshold) {
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
    budget.trackingMethod = trackingMethod;
    fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));

    return true;
  } catch (error) {
    console.error('⚠️  Token tracking failed:', error.message);
    return false;
  }
}

// Run token tracking
module.exports = trackTokenUsage();
