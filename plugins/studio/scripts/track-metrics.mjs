#!/usr/bin/env node
/**
 * SMITE Studio - Metrics Tracking Hook (Cross-platform)
 * Tracks code metrics after each file change
 */

import fs from 'node:fs';
import path from 'node:path';

const metricsDir = path.join(process.cwd(), '.smite');
const metricsFile = path.join(metricsDir, 'session-metrics.json');

// Create directory if needed
try {
  fs.mkdirSync(metricsDir, { recursive: true });
} catch {
  // Ignore
}

// Initialize metrics if not exist
if (!fs.existsSync(metricsFile)) {
  const initialMetrics = {
    filesModified: 0,
    linesAdded: 0,
    linesRemoved: 0,
    lastUpdate: null,
  };
  fs.writeFileSync(metricsFile, JSON.stringify(initialMetrics, null, 2));
}

// Increment file count
let current = {};
try {
  current = JSON.parse(fs.readFileSync(metricsFile, 'utf8') || '{}');
} catch {
  // Use empty object
}
const files = current.filesModified || 0;
const newFiles = files + 1;

// Update metrics
const updatedMetrics = {
  filesModified: newFiles,
  linesAdded: 0,
  linesRemoved: 0,
  lastUpdate: new Date().toISOString(),
};

fs.writeFileSync(metricsFile, JSON.stringify(updatedMetrics, null, 2));

process.exit(0);
