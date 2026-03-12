#!/usr/bin/env node
/**
 * SMITE Core - Validation MCP Server
 *
 * MCP server for configuration validation against JSON schemas.
 * Provides tools for validating configs and listing available schemas.
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Schema directory
const SCHEMAS_DIR = join(__dirname, '../infrastructure/validation/schemas');

// Available schemas
const AVAILABLE_SCHEMAS = [
  'plugin.schema.json',
  'design-styles.schema.json',
  'vaults.schema.json',
  'templates.schema.json'
];

/**
 * Validate JSON against schema
 */
function validateAgainstSchema(data, schemaPath) {
  const errors = [];

  // Basic validation
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  // In a real implementation, this would use a JSON schema validator
  // For now, we do basic checks
  if (schemaPath.includes('plugin.schema.json')) {
    if (!data.name) errors.push('Missing required field: name');
    if (!data.version) errors.push('Missing required field: version');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Create server
const server = new Server({
  name: 'smite-core-validation',
  version: '2.0.0'
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
        name: 'list_schemas',
        description: 'List all available validation schemas',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'validate_config',
        description: 'Validate configuration data against a schema',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'string',
              description: 'Schema name (e.g., plugin.schema.json)',
              enum: AVAILABLE_SCHEMAS
            },
            data: {
              type: 'object',
              description: 'Configuration data to validate (as JSON object or JSON string)'
            }
          },
          required: ['schema']
        }
      },
      {
        name: 'get_schema',
        description: 'Get the content of a specific schema file',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'string',
              description: 'Schema name',
              enum: AVAILABLE_SCHEMAS
            }
          },
          required: ['schema']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'list_schemas') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total: AVAILABLE_SCHEMAS.length,
          schemas: AVAILABLE_SCHEMAS
        }, null, 2)
      }]
    };
  }

  if (name === 'validate_config') {
    const schemaPath = join(SCHEMAS_DIR, args.schema);

    if (!existsSync(schemaPath)) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: `Schema not found: ${args.schema}` }, null, 2)
        }]
      };
    }

    // Parse data if it's a string
    let data;
    if (typeof args.data === 'string') {
      try {
        data = JSON.parse(args.data);
      } catch {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Invalid JSON data' }, null, 2)
          }]
        };
      }
    } else {
      data = args.data;
    }

    const result = validateAgainstSchema(data, args.schema);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  if (name === 'get_schema') {
    const schemaPath = join(SCHEMAS_DIR, args.schema);

    if (!existsSync(schemaPath)) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: `Schema not found: ${args.schema}` }, null, 2)
        }]
      };
    }

    const content = readFileSync(schemaPath, 'utf8');
    return {
      content: [{
        type: 'text',
        text: content
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Core Validation MCP Server running on stdio');
