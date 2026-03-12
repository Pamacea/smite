#!/usr/bin/env node
/**
 * SMITE Memory MCP Server
 * 
 * Provides persistent memory storage for SMITE patterns and decisions.
 * Integrates with claude-mem for cross-session pattern learning.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Memory storage (in-memory for demo, could use file/database)
const memoryStore = new Map();
const MEMORY_DIR = '.smite/memory';

// Initialize memory store
function initMemory() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  } catch (err) {
    // Ignore if exists
  }
  
  // Load existing patterns
  try {
    const files = fs.readdirSync(MEMORY_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
        const data = JSON.parse(content);
        memoryStore.set(file.replace('.json', ''), data);
      }
    }
  } catch (err) {
    // No existing patterns
  }
}

// Save pattern to memory
function savePattern(category, pattern) {
  const fs = require('fs');
  const path = require('path');
  
  const timestamp = new Date().toISOString();
  const id = `${category}-${Date.now()}`;
  
  const data = {
    id,
    category,
    ...pattern,
    timestamp
  };
  
  memoryStore.set(id, data);
  
  // Persist to file
  const filename = path.join(MEMORY_DIR, `${id}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  
  return id;
}

// Get patterns by category
function getPatterns(category) {
  const fs = require('fs');
  const path = require('path');
  
  if (category) {
    return Array.from(memoryStore.values())
      .filter(p => p.category === category);
  }
  
  return Array.from(memoryStore.values());
}

// Create server
const server = new Server({
  name: 'smite-memory',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Initialize
initMemory();

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'save_pattern',
        description: 'Save a code pattern or decision to memory for future reference',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Pattern category (architecture, implementation, testing, etc.)',
              enum: ['architecture', 'implementation', 'testing', 'configuration', 'security', 'performance']
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
              description: 'Code example (optional)'
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Related files'
            }
          },
          required: ['category', 'name', 'description']
        }
      },
      {
        name: 'get_pattern',
        description: 'Retrieve patterns from memory by category or search query',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category (optional)'
            },
            query: {
              type: 'string',
              description: 'Search query (optional)'
            }
          }
        }
      },
      {
        name: 'list_patterns',
        description: 'List all stored patterns grouped by category',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'delete_pattern',
        description: 'Delete a pattern from memory',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Pattern ID to delete'
            }
          },
          required: ['id']
        }
      }
    ]
  };
});

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const patterns = getPatterns();
  
  return {
    resources: [
      {
        uri: 'memory://patterns',
        name: 'All Patterns',
        description: 'All stored patterns',
        mimeType: 'application/json'
      },
      {
        uri: 'memory://categories',
        name: 'Pattern Categories',
        description: 'Patterns grouped by category',
        mimeType: 'application/json'
      },
      ...patterns.map(p => ({
        uri: `memory://pattern/${p.id}`,
        name: p.name,
        description: p.description,
        mimeType: 'application/json'
      }))
    ]
  };
});

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'memory://patterns') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(getPatterns(), null, 2)
      }]
    };
  }
  
  if (uri === 'memory://categories') {
    const patterns = getPatterns();
    const grouped = {};
    
    for (const p of patterns) {
      if (!grouped[p.category]) {
        grouped[p.category] = [];
      }
      grouped[p.category].push(p);
    }
    
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(grouped, null, 2)
      }]
    };
  }
  
  if (uri.startsWith('memory://pattern/')) {
    const id = uri.replace('memory://pattern/', '');
    const pattern = memoryStore.get(id);
    
    if (!pattern) {
      throw new Error(`Pattern not found: ${id}`);
    }
    
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(pattern, null, 2)
      }]
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'save_pattern') {
    const id = savePattern(args.category, {
      name: args.name,
      description: args.description,
      code: args.code,
      files: args.files || []
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          id,
          message: `Pattern "${args.name}" saved to memory`
        }, null, 2)
      }]
    };
  }
  
  if (name === 'get_pattern') {
    let patterns = getPatterns(args.category);
    
    if (args.query) {
      const query = args.query.toLowerCase();
      patterns = patterns.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query))
      );
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(patterns, null, 2)
      }]
    };
  }
  
  if (name === 'list_patterns'
