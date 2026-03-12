# SMITE MCP Servers

Model Context Protocol servers for memory and analytics.

## Overview

SMITE v3.0 includes two MCP servers:

| Server | Purpose |
|--------|---------|
| **smite-memory** | Persistent pattern storage |
| **smite-analytics** | Build metrics tracking |

## smite-memory Server

### Tools

| Tool | Description |
|------|-------------|
| `save_pattern` | Save a code pattern to memory |
| `get_pattern` | Retrieve patterns by category/query |
| `list_patterns` | List all stored patterns |
| `delete_pattern` | Delete a pattern |

### Usage

```json
// Save pattern
{
  "category": "architecture",
  "name": "Feature module pattern",
  "description": "Self-contained feature modules",
  "code": "src/features/[feature]/...",
  "files": ["src/features/auth/*"]
}

// Get patterns
{
  "category": "architecture",
  "query": "auth"
}
```

### Categories

- `architecture` - Module structure, layering
- `implementation` - Code patterns, idioms
- `testing` - Test patterns, fixtures
- `configuration` - Setup, conventions
- `security` - Security patterns
- `performance` - Optimization patterns

### Resources

- `memory://patterns` - All patterns
- `memory://categories` - Grouped by category
- `memory://pattern/{id}` - Specific pattern

## smite-analytics Server

### Tools

| Tool | Description |
|------|-------------|
| `record_build` | Record build metrics |
| `record_refactor` | Record refactor metrics |
| `get_summary` | Get analytics summary |
| `get_metrics` | Get detailed metrics |

### Usage

```json
// Record build
{
  "flags": ["--scale", "--test"],
  "duration": 45000,
  "qualityScore": 85,
  "filesModified": 5,
  "linesAdded": 127,
  "linesRemoved": 42,
  "testsPassed": true
}

// Get summary
{
  "type": "builds"
}
```

## Installation

Add to your Claude Code settings:

```json
// .claude.json or project .mcp.json
{
  "mcpServers": {
    "smite-memory": {
      "transport": "stdio",
      "command": "node",
      "args": ["./plugins/studio/mcp/memory-server.js"]
    },
    "smite-analytics": {
      "transport": "stdio",
      "command": "node",
      "args": ["./plugins/studio/mcp/analytics-server.js"]
    }
  }
}
```

## Storage

Data stored in `.smite/` directory:

```
.smite/
├── memory/           # Pattern storage
│   ├── architecture-*.json
│   └── implementation-*.json
└── analytics/        # Metrics storage
    ├── builds.json
    └── refactors.json
```

## Dependencies

```bash
npm install @modelcontextprotocol/sdk
```

---

**Version:** 1.0.0 | **Part of:** Studio v3.0
