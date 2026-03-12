#!/usr/bin/env node
/**
 * SMITE Core - Template MCP Server
 *
 * MCP server for template access and rendering.
 * Provides tools for listing, getting, and rendering templates.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import template loader
let TemplateLoader;

async function initTemplateLoader() {
  const { default: loader } = await import('../skills/template-loader.js');
  TemplateLoader = loader;
}

// Create server
const server = new Server({
  name: 'smite-core-templates',
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
        name: 'list_templates',
        description: 'List all available SMITE Core templates with metadata',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_template',
        description: 'Get the full content of a specific template',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Template name (e.g., command-header, warnings, metadata)',
              enum: ['command-header', 'warnings', 'metadata', 'plan-mode-first']
            }
          },
          required: ['name']
        }
      },
      {
        name: 'render_template',
        description: 'Render a template with variable substitution',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Template name (e.g., command-header, warnings)',
              enum: ['command-header', 'warnings', 'metadata', 'plan-mode-first']
            },
            variables: {
              type: 'object',
              description: 'Variables to substitute in template (JSON object)',
              additionalProperties: true
            }
          },
          required: ['name']
        }
      },
      {
        name: 'get_template_metadata',
        description: 'Get metadata for a specific template without loading full content',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Template name',
              enum: ['command-header', 'warnings', 'metadata', 'plan-mode-first']
            }
          },
          required: ['name']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Initialize template loader if needed
  if (!TemplateLoader) {
    await initTemplateLoader();
  }

  if (name === 'list_templates') {
    const templates = TemplateLoader.listTemplates();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total: templates.length,
          templates: templates.map(t => ({
            name: t.name,
            category: t.category,
            version: t.version,
            description: t.description,
            lazy_load: t.lazy_load
          }))
        }, null, 2)
      }]
    };
  }

  if (name === 'get_template') {
    const content = await TemplateLoader.load(args.name);
    if (content) {
      return {
        content: [{
          type: 'text',
          text: content
        }]
      };
    }
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: `Template not found: ${args.name}` }, null, 2)
      }]
    };
  }

  if (name === 'render_template') {
    const rendered = await TemplateLoader.render(args.name, args.variables || {});
    if (rendered) {
      return {
        content: [{
          type: 'text',
          text: rendered
        }]
      };
    }
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: `Template not found: ${args.name}` }, null, 2)
      }]
    };
  }

  if (name === 'get_template_metadata') {
    const metadata = TemplateLoader.getMetadata(args.name);
    if (metadata) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(metadata, null, 2)
        }]
      };
    }
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: `Template not found: ${args.name}` }, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Core Template MCP Server running on stdio');
