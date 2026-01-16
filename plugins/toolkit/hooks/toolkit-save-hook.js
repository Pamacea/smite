#!/usr/bin/env node

/**
 * SMITE Toolkit - Session End Hook
 *
 * Runs when a Claude Code session ends.
 * Saves session statistics and prints summary.
 */

const fs = require('fs');
const path = require('path');

// Paths
const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const budgetPath = path.join(toolkitDir, 'budget.json');
const statsPath = path.join(toolkitDir, 'stats.json');

function saveSessionStats() {
  try {
    if (!fs.existsSync(budgetPath) || !fs.existsSync(statsPath)) {
      return false;
    }

    // Read current stats
    const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf-8'));
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

    // Update stats
    stats.sessions += 1;
    stats.totalTokens += budget.usedTokens;
    stats.lastUpdated = new Date().toISOString();

    // Calculate savings (assuming 75% savings compared to traditional approach)
    const traditionalTokens = budget.usedTokens * 4;
    const savings = traditionalTokens - budget.usedTokens;
    stats.totalSavings += savings;

    // IMPORTANT: Reset budget for next session but keep the same maxTokens
    const sessionUsedTokens = budget.usedTokens;
    budget.usedTokens = 0;
    budget.lastReset = new Date().toISOString();
    fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));

    // Save stats
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

    // Print summary
    console.log('');
    console.log('📊 SMITE Toolkit Session Summary');
    console.log('─'.repeat(40));
    console.log(`Tokens used: ${sessionUsedTokens.toLocaleString()}`);
    console.log(`Est. savings: ${savings.toLocaleString()} tokens (${((savings / traditionalTokens) * 100).toFixed(1)}%)`);
    console.log(`Total sessions: ${stats.sessions}`);
    console.log(`Lifetime savings: ${stats.totalSavings.toLocaleString()} tokens`);
    console.log('─'.repeat(40));
    console.log('');

    return true;
  } catch (error) {
    console.error('⚠️  Session save failed:', error.message);
    return false;
  }
}

// Save session stats
module.exports = saveSessionStats();
