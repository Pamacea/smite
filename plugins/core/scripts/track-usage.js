#!/usr/bin/env node

/**
 * SMITE Core - Usage Tracking
 * Tracks tool usage in background for analytics
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const USAGE_FILE = path.join(os.homedir(), '.smite', 'usage.json');

function trackUsage(toolName) {
  try {
    let usage = { total: 0, tools: {} };

    // Load existing usage
    if (fs.existsSync(USAGE_FILE)) {
      usage = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    }

    // Update counts
    usage.total++;
    usage.tools[toolName] = (usage.tools[toolName] || 0) + 1;

    // Save back
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (err) {
    // Silent fail - tracking shouldn't break operations
  }
}

// Run in background
if (require.main === module) {
  const tool = process.argv[2] || 'unknown';
  trackUsage(tool);
}

module.exports = { trackUsage };
