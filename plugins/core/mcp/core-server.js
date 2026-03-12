#!/usr/bin/env node
/**
 * SMITE Core - Core MCP Server
 *
 * Main MCP server for SMITE Core functionality.
 * Provides platform detection, core statistics, and system information.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform as osPlatform, homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__dirname);

/**
 * Get platform information
 */
function getPlatformInfo() {
  const platform = osPlatform();
  let shell = 'unknown';

  const env = process.env;
  if (platform === 'win32') {
    if (env.PSModulePath) {
      shell = 'powershell';
    } else if (env.COMSPEC) {
      shell = 'cmd';
    }
  } else {
    const shellPath = env.SHELL || '';
    if (shellPath.includes('zsh')) {
      shell = 'zsh';
    } else if (shellPath.includes('bash')) {
      shell = 'bash';
    }
  }

  return {
    platform: platform === 'win32' ? 'windows' : platform === 'darwin' ? 'macos' : 'linux',
    shell,
    arch: process.arch,
    nodeVersion: process.version,
    homeDir: homedir()
  };
}

/**
 * Get core statistics
 */
function getCoreStats() {
  const metricsPath = '.smite/core/metrics/metrics.json';

  let metrics = {
    templateUsage: {},
    platformStats: {
      windows: 0,
      macos: 0,
      linux: 0
    },
    tokenSavings: {
      totalTokens: 0,
      templates: 0
    },
    initialized: null
  };

  if (existsSync(metricsPath)) {
    try {
      metrics = JSON.parse(readFileSync(metricsPath, 'utf8'));
    } catch {
      // Use default
    }
  }

  // Get cache stats
  const cacheIndex = '.smite/core/cache/index.json';
  let cacheSize = 0;

  if (existsSync(cacheIndex)) {
    try {
      const cache = JSON.parse(readFileSync(cacheIndex, 'utf8'));
      cacheSize = Object.keys(cache.templates || {}).length;
    } catch {
      // Use default
    }
  }

  return {
    ...metrics,
    cacheSize
  };
}

// Create server
const server = new Server({
  name: 'smite-core',
  version: '2.0.0'
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_platform',
        description: 'Get current platform information (OS, shell, arch)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_stats',
        description: 'Get SMITE Core statistics - template usage, platform distribution, token savings',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_version',
        description: 'Get SMITE Core version information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_capabilities',
        description: 'List all SMITE Core capabilities and features',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_platform') {
    const info = getPlatformInfo();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(info, null, 2)
      }]
    };
  }

  if (name === 'get_stats') {
    const stats = getCoreStats();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(stats, null, 2)
      }]
    };
  }

  if (name === 'get_version') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          name: 'SMITE Core',
          version: '2.0.0',
          smiteVersion: '4.0.0',
          lastUpdated: '2026-03-12'
        }, null, 2)
      }]
    };
  }

  if (name === 'list_capabilities') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          capabilities: [
            'lazy-loading',
            'template-engine',
            'validation-schemas',
            'platform-detection',
            'parallel-execution',
            'hooks-system',
            'metrics-collection',
            'mcp-integration'
          ],
          dependencies: [],
          integrations: ['studio', 'agents', 'essentials']
        }, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Core MCP Server running on stdio');
