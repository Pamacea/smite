#!/usr/bin/env node
/**
 * SMITE Agents - Pattern Library MCP Server
 *
 * Stores and retrieves code patterns organized by domain and tech stack.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pattern storage
const PATTERNS_DIR = '.smite/agents/patterns';

// Initialize patterns directory
function initPatterns() {
  try {
    mkdirSync(PATTERNS_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
}

// Save pattern
function savePattern(domain, tech, pattern) {
  initPatterns();

  const timestamp = new Date().toISOString();
  const id = `${domain}-${tech}-${Date.now()}`;

  const data = {
    id,
    domain,
    tech,
    ...pattern,
    timestamp
  };

  const filename = join(PATTERNS_DIR, `${id}.json`);
  writeFileSync(filename, JSON.stringify(data, null, 2));

  return id;
}

// Get patterns
function getPatterns(domain = null, tech = null) {
  initPatterns();

  if (!existsSync(PATTERNS_DIR)) {
    return [];
  }

  const fs = require('fs');
  const files = fs.readdirSync(PATTERNS_DIR);
  const patterns = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(join(PATTERNS_DIR, file), 'utf8');
        const pattern = JSON.parse(content);

        // Filter by domain
        if (domain && pattern.domain !== domain) continue;
        if (tech && pattern.tech !== tech) continue;

        patterns.push(pattern);
      } catch (err) {
        // Skip invalid files
      }
    }
  }

  return patterns;
}

// Create server
const server = new Server({
  name: 'smite-agents-patterns',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'save_pattern',
        description: 'Save a code pattern to the library',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain (frontend, backend, etc.)',
              enum: ['frontend', 'backend', 'database', 'devops', 'workflow', 'optimization', 'testing']
            },
            tech: {
              type: 'string',
              description: 'Technology (rust, nextjs, prisma, etc.)'
            },
            name: {
              type: 'string',
              description: 'Pattern name'
            },
            description: {
              type: 'string',
              description: 'Pattern description'
            },
            code: {
              type: 'string',
              description: 'Code example'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization'
            }
          },
          required: ['domain', 'tech', 'name', 'description']
        }
      },
      {
        name: 'get_patterns',
        description: 'Retrieve patterns by domain and/or tech',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Filter by domain'
            },
            tech: {
              type: 'string',
              description: 'Filter by technology'
            }
          }
        }
      },
      {
        name: 'list_patterns',
        description: 'List all patterns grouped by domain',
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

  if (name === 'save_pattern') {
    const id = savePattern(args.domain, args.tech, {
      name: args.name,
      description: args.description,
      code: args.code || '',
      tags: args.tags || []
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, id, message: `Pattern "${args.name}" saved` }, null, 2)
      }]
    };
  }

  if (name === 'get_patterns') {
    const patterns = getPatterns(args.domain, args.tech);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(patterns, null, 2)
      }]
    };
  }

  if (name === 'list_patterns') {
    const patterns = getPatterns();
    const grouped = {};

    for (const p of patterns) {
      if (!grouped[p.domain]) {
        grouped[p.domain] = {};
      }
      if (!grouped[p.domain][p.tech]) {
        grouped[p.domain][p.tech] = [];
      }
      grouped[p.domain][p.tech].push({
        id: p.id,
        name: p.name,
        description: p.description,
        tags: p.tags
      });
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ grouped }, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Agents Pattern Library MCP Server running on stdio');
