#!/usr/bin/env node
/**
 * SMITE Agents - Usage Tracking Hook (Cross-platform)
 * Tracks agent usage for analytics
 */

import fs from 'node:fs';
import path from 'node:path';

const trackingDir = path.join(process.cwd(), '.smite', 'agents');
const metricsFile = path.join(trackingDir, 'metrics.json');

let newTotal = 1;

if (fs.existsSync(metricsFile)) {
  try {
    const current = JSON.parse(fs.readFileSync(metricsFile, 'utf8') || '{}');
    const total = current.totalAgentInvocations || 0;
    newTotal = total + 1;
  } catch {
    newTotal = 1;
  }
}

// Update metrics
const updatedMetrics = {
  totalAgentInvocations: newTotal,
  lastUpdate: new Date().toISOString(),
};

try {
  fs.mkdirSync(trackingDir, { recursive: true });
} catch {
  // Ignore
}

fs.writeFileSync(metricsFile, JSON.stringify(updatedMetrics, null, 2));

process.exit(0);
