#!/usr/bin/env node

/**
 * Simplified Statusline for Claude Code
 *
 * A reliable, cross-platform statusline implementation that:
 * - Uses synchronous stdin reading (no async hangs)
 * - Has 300ms timeout on git commands
 * - Works on Windows, macOS, and Linux
 * - Shows git branch, cost, duration, and context usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // Read stdin synchronously
  const inputData = fs.readFileSync(0, 'utf-8');
  const data = JSON.parse(inputData);

  // Get git branch with timeout
  let branch = 'main';
  try {
    branch = execSync('git branch --show-current', {
      encoding: 'utf8',
      timeout: 300,
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: data.workspace?.current_dir || process.cwd()
    }).trim() || 'main';
  } catch {
    branch = 'main';
  }

  // Format cost
  const cost = (data.cost?.total_cost_usd || 0).toFixed(2);

  // Format duration
  const durationSecs = Math.floor((data.cost?.total_duration_ms || 0) / 1000);
  const mins = Math.floor(durationSecs / 60);
  const secs = durationSecs % 60;

  // Calculate context percentage
  const contextWindow = data.context_window?.context_window_size || 200000;
  const currentUsage = (data.context_window?.current_usage?.input_tokens || 0) +
                     (data.context_window?.current_usage?.cache_creation_input_tokens || 0) +
                     (data.context_window?.current_usage?.cache_read_input_tokens || 0);
  const percentage = Math.min(100, Math.round((currentUsage / contextWindow) * 100));

  // Simple progress bar
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  // Get model name
  const modelName = data.model?.display_name || 'Claude';

  // Format tokens in K
  const tokensK = (currentUsage / 1000).toFixed(1);

  // Output the statusline
  console.log(`${branch} • ${modelName} • $${cost} • ${mins}m${secs}s • ${tokensK}K tokens • [${bar}] ${percentage}%`);

} catch (error) {
  // Fallback output on any error
  console.log('>> accepts edits on');
}
