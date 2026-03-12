#!/usr/bin/env node
/**
 * SMITE Agents - Agent Discovery MCP Server
 *
 * Provides dynamic agent discovery and loading based on tech stack.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agents directory
const AGENTS_DIR = join(__dirname, '../agents');
const MANIFEST_FILE = join(__dirname, '../manifest.json');

// Load manifest
let manifest = { agents: [] };
try {
  const manifestContent = readFileSync(MANIFEST_FILE, 'utf8');
  manifest = JSON.parse(manifestContent);
} catch (err) {
  // Use default
}

// Discover all agents
function discoverAgents() {
  const agents = [];

  function scanDirectory(dir, domain) {
    if (!existsSync(dir)) return [];

    const files = readdirSync(dir);
    const results = [];

    for (const file of files) {
      if (file.endsWith('.agent.md')) {
        const filePath = join(dir, file);
        try {
          const content = readFileSync(filePath, 'utf8');
          const name = content.match(/^# (.+)$/m)?.[1] || file.replace('.agent.md', '');
          const domain = filePath.split(/[/\\]/)[1] || 'unknown';

          // Extract metadata
          const tech = content.match(/tech_stack: (.+)/)?.[1] || '';
          const version = content.match(/version: "(.+)"/)?.[1] || '';
          const lazyLoad = content.includes('lazy_load: true');

          results.push({
            id: file.replace('.agent.md', ''),
            name: name.trim(),
            domain,
            file: filePath,
            tech,
            version,
            lazyLoad
          });
        } catch (err) {
          // Skip invalid files
        }
      }
    }

    return results;
  }

  // Scan all domain directories
  const domains = ['frontend', 'backend', 'database', 'devops', 'workflow', 'optimization', 'testing'];
  for (const domain of domains) {
    const domainDir = join(AGENTS_DIR, domain);
    if (existsSync(domainDir)) {
      agents.push(...scanDirectory(domainDir, domain));
    }
  }

  return agents;
}

// Find agent by tech stack
function findAgentByTech(tech) {
  const agents = discoverAgents();

  // Direct match
  let agent = agents.find(a => a.tech.toLowerCase().includes(tech.toLowerCase()));

  // Domain match
  if (!agent) {
    agent = agents.find(a => a.domain.toLowerCase() === tech.toLowerCase());
  }

  // Partial match
  if (!agent) {
    agent = agents.find(a => a.id.toLowerCase().includes(tech.toLowerCase()));
  }

  return agent;
}

// Find agent by name/path
function findAgentByName(name) {
  const agents = discoverAgents();

  // Direct path match
  if (name.includes('/')) {
    const agent = agents.find(a => a.file.includes(name));
    if (agent) return agent;
  }

  // ID match
  return agents.find(a => a.id === name);
}

// Get agents by domain
function getAgentsByDomain(domain) {
  const agents = discoverAgents();
  return agents.filter(a => a.domain === domain);
}

// Create server
const server = new Server({
  name: 'smite-agents-discovery',
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
        name: 'discover_agents',
        description: 'List all available agents with their metadata',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Filter by domain (frontend, backend, etc.)',
              enum: ['frontend', 'backend', 'database', 'devops', 'workflow', 'optimization', 'testing']
            }
          }
        }
      },
      {
        name: 'find_agent',
        description: 'Find agent by tech stack, name, or domain',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Tech stack, agent name, or domain (e.g., "rust", "nextjs", "frontend")'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_agent_content',
        description: 'Get the full content of a specific agent file',
        inputSchema: {
          type: 'object',
          properties: {
            agent_id: {
              type: 'string',
              description: 'Agent ID (e.g., "nextjs", "rust", "prisma")'
            }
          },
          required: ['agent_id']
        }
      },
      {
        name: 'list_domains',
        description: 'List all available domains with agent counts',
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

  if (name === 'discover_agents') {
    let agents = discoverAgents();

    if (args.domain) {
      agents = getAgentsByDomain(args.domain);
    }

    // Group by domain
    const grouped = {};
    for (const agent of agents) {
      if (!grouped[agent.domain]) {
        grouped[agent.domain] = [];
      }
      grouped[agent.domain].push({
        id: agent.id,
        name: agent.name,
        tech: agent.tech,
        version: agent.version,
        lazyLoad: agent.lazyLoad
      });
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ total: agents.length, byDomain: grouped }, null, 2)
      }]
    };
  }

  if (name === 'find_agent') {
    const agent = findAgentByTech(args.query) || findAgentByName(args.query);

    if (!agent) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: `Agent not found: ${args.query}` }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(agent, null, 2)
      }]
    };
  }

  if (name === 'get_agent_content') {
    const agent = findAgentByName(args.agent_id);

    if (!agent) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: `Agent not found: ${args.agent_id}` }, null, 2)
        }]
      };
    }

    try {
      const content = readFileSync(agent.file, 'utf8');
      return {
        content: [{
          type: 'text',
        text: content
      }]
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
        text: JSON.stringify({ error: `Failed to read agent file: ${err.message}` }, null, 2)
        }]
      };
    }
  }

  if (name === 'list_domains') {
    const agents = discoverAgents();
    const domains = {};

    for (const agent of agents) {
      if (!domains[agent.domain]) {
        domains[agent.domain] = 0;
      }
      domains[agent.domain]++;
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ domains }, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('SMITE Agents Discovery MCP Server running on stdio');
