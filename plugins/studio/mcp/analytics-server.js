#!/usr/bin/env node
/**
 * SMITE Analytics MCP Server
 *
 * Provides build metrics and performance tracking for SMITE workflows.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Analytics storage
const analyticsStore = {
  builds: [],
  refactors: [],
  sessions: []
};

const ANALYTICS_DIR = '.smite/analytics';

// Initialize analytics
function initAnalytics() {
  const fs = require('fs');
  const path = require('path');

  try {
    fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  } catch (err) {
    // Ignore
  }

  // Load existing data
  try {
    const builds = fs.readFileSync(path.join(ANALYTICS_DIR, 'builds.json'), 'utf8');
    analyticsStore.builds = JSON.parse(builds);
  } catch (err) {
    analyticsStore.builds = [];
  }

  try {
    const refactors = fs.readFileSync(path.join(ANALYTICS_DIR, 'refactors.json'), 'utf8');
    analyticsStore.refactors = JSON.parse(refactors);
  } catch (err) {
    analyticsStore.refactors = [];
  }
}

// Save analytics
function saveAnalytics() {
  const fs = require('fs');
  const path = require('path');

  fs.writeFileSync(
    path.join(ANALYTICS_DIR, 'builds.json'),
    JSON.stringify(analyticsStore.builds, null, 2)
  );

  fs.writeFileSync(
    path.join(ANALYTICS_DIR, 'refactors.json'),
    JSON.stringify(analyticsStore.refactors, null, 2)
  );
}

// Record build metrics
function recordBuild(metrics) {
  const record = {
    id: `build-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...metrics
  };

  analyticsStore.builds.push(record);
  saveAnalytics();

  return record.id;
}

// Record refactor metrics
function recordRefactor(metrics) {
  const record = {
    id: `refactor-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...metrics
  };

  analyticsStore.refactors.push(record);
  saveAnalytics();

  return record.id;
}

// Get analytics summary
function getSummary(type = 'all') {
  const summary = {
    builds: {
      total: analyticsStore.builds.length,
      byFlag: {},
      avgDuration: 0,
      avgQualityScore: 0
    },
    refactors: {
      total: analyticsStore.refactors.length,
      byMode: {},
      avgFilesAffected: 0
    }
  };

  // Calculate build stats
  if (analyticsStore.builds.length > 0) {
    const flagCounts = {};
    let totalDuration = 0;
    let totalQuality = 0;

    for (const build of analyticsStore.builds) {
      for (const flag of build.flags || []) {
        flagCounts[flag] = (flagCounts[flag] || 0) + 1;
      }
      totalDuration += build.duration || 0;
      totalQuality += build.qualityScore || 0;
    }

    summary.builds.byFlag = flagCounts;
    summary.builds.avgDuration = Math.round(totalDuration / analyticsStore.builds.length);
    summary.builds.avgQualityScore = Math.round(totalQuality / analyticsStore.builds.length);
  }

  // Calculate refactor stats
  if (analyticsStore.refactors.length > 0) {
    const modeCounts = {};
    let totalFiles = 0;

    for (const refactor of analyticsStore.refactors) {
      const mode = refactor.mode || 'unknown';
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;
      totalFiles += refactor.filesAffected || 0;
    }

    summary.refactors.byMode = modeCounts;
    summary.refactors.avgFilesAffected = Math.round(totalFiles / analyticsStore.refactors.length);
  }

  return type === 'builds' ? summary.builds :
         type === 'refactors' ? summary.refactors : summary;
}

// Create server
const server = new Server({
  name: 'smite-analytics',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// Initialize
initAnalytics();

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'record_build',
        description: 'Record build metrics after completion',
        inputSchema: {
          type: 'object',
          properties: {
            flags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Flags used (e.g., --speed, --scale)'
            },
            duration: { type: 'number', description: 'Duration in milliseconds' },
            qualityScore: { type: 'number', description: 'Quality score (0-100)' },
            filesModified: { type: 'number', description: 'Number of files modified' },
            linesAdded: { type: 'number', description: 'Lines of code added' },
            linesRemoved: { type: 'number', description: 'Lines of code removed' },
            testsPassed: { type: 'boolean', description: 'Whether tests passed' }
          },
          required: ['flags', 'duration']
        }
      },
      {
        name: 'record_refactor',
        description: 'Record refactor metrics after completion',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', description: 'Refactor mode (quick, full, profile, etc.)' },
            duration: { type: 'number', description: 'Duration in milliseconds' },
            filesAffected: { type: 'number', description: 'Number of files affected' },
            complexityBefore: { type: 'number', description: 'Complexity score before' },
            complexityAfter: { type: 'number', description: 'Complexity score after' },
            improvements: { type: 'array', items: { type: 'string' }, description: 'Improvements made' }
          },
          required: ['mode', 'duration']
        }
      },
      {
        name: 'get_summary',
        description: 'Get analytics summary',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Summary type (all, builds, refactors)',
              enum: ['all', 'builds', 'refactors']
            }
          }
        }
      },
      {
        name: 'get_metrics',
        description: 'Get detailed metrics for builds or refactors',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['builds', 'refactors'] },
            limit: { type: 'number', description: 'Maximum results (default: 10)' }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'record_build') {
    const id = recordBuild(args);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, id, message: 'Build metrics recorded' }, null, 2)
      }]
    };
  }

  if (name === 'record_refactor') {
    const id = recordRefactor(args);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, id, message: 'Refactor metrics recorded' }, null, 2)
      }]
    };
  }

  if (name === 'get_summary') {
    const summary = getSummary(args.type);

    return {
      content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }]
    };
  }

  if (name === 'get_metrics') {
    const limit = args.limit || 10;
    const data = args.type === 'builds'
      ? analyticsStore.builds.slice(-limit)
      : analyticsStore.refactors.slice(-limit);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Analytics MCP Server running on stdio');
