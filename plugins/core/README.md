# Core Plugin v2.0.0

Shared infrastructure for all SMITE plugins - lazy loading, templates, validation, hooks, MCP integration.

**Version:** 2.0.0 | **SMITE Version:** 4.0.0

---

## Quick Start

```bash
# Auto-loaded by all SMITE plugins
# No manual installation required

# Initialize core (optional, for development)
npm run init-core

# Validate plugin
npm run validate-plugin
```

---

## Overview

SMITE Core is the foundational infrastructure layer for all SMITE plugins. It provides shared utilities, validation schemas, templates, and cross-platform capabilities with lazy loading and MCP integration.

**Key Features:**
- **Lazy Loading** - 60% token reduction with on-demand template loading
- **Template Engine** - Reusable markdown templates with variable substitution
- **Validation** - JSON schemas for configuration validation
- **Platform Detection** - Cross-platform utilities (Win/Mac/Linux)
- **Hooks System** - Centralized hook registry for all plugins
- **MCP Integration** - Template access, validation, platform info via MCP
- **Metrics** - Template usage tracking, platform statistics

---

## Directory Structure

```
plugins/core/
├── infrastructure/          # Shared infrastructure
│   ├── templates/          # Markdown templates (lazy loaded)
│   ├── validation/         # JSON schemas
│   ├── platform/           # Cross-platform utilities
│   ├── parallel/           # Parallel execution
│   └── docs/               # Technical documentation
├── src/                     # Source code
│   ├── config/             # Configuration management
│   ├── hooks/              # Hook registry
│   ├── platform/           # Platform detection
│   ├── template/           # Template engine
│   ├── utils/              # Utilities
│   └── metrics/            # Metrics collection
├── integration/             # Integration layer
│   ├── smite-integrator.ts
│   ├── model-router.ts
│   ├── hooks.ts
│   └── index.ts
├── skills/                  # Lazy loading system
│   ├── skill-loader.ts
│   └── template-loader.ts
├── mcp/                     # MCP servers
│   ├── template-server.js
│   ├── validation-server.js
│   ├── core-server.js
│   └── package.json
├── scripts/                 # Cross-platform scripts
│   ├── init-core.js
│   ├── validate-plugin.js
│   ├── detect-platform.js
│   └── template-renderer.js
├── hooks/                   # Centralized hooks
│   └── hooks.json
├── examples/                # Example plugins
│   ├── simple-plugin/
│   └── advanced-plugin/
├── README.md                # This file
├── GUIDE.md                 # Complete guide
└── REFERENCE.md             # Quick reference
```

---

## Features

### Lazy Loading

**Benefits:**
- 60% reduction in startup tokens
- <100ms template load time
- Cache for frequently used templates

**Usage:**
```typescript
import { TemplateLoader } from '@smite/core/skills/template-loader';

const template = await TemplateLoader.load('command-header');
```

### Template Engine

**Available Templates:**
- `command-header.md` - Command frontmatter
- `warnings.md` - Warning messages
- `metadata.md` - Footer metadata
- `plan-mode-first.md` - Plan mode template

**Usage:**
```markdown
<!-- @include ../../core/infrastructure/templates/warnings.md#MANDATORY -->
```

### Validation

**Available Schemas:**
- `plugin.schema.json` - Plugin manifests
- `design-styles.schema.json` - Design styles
- `vaults.schema.json` - Vault configs
- `templates.schema.json` - Templates

### Hooks System

**Centralized Hooks:**
- `SessionStart` → Initialize core, lazy loading
- `PreToolUse` → Validate tool usage
- `PostToolUse` → Track template usage
- `Stop` → Report metrics, cleanup

**Usage:**
```typescript
import { getGlobalHookRegistry } from '@smite/core/src/hooks/registry';

const registry = getGlobalHookRegistry();
await registry.register('SessionStart', async (ctx) => {
  // Handler logic
});
```

### MCP Integration

**Servers:**
- `smite-core-templates` - Template access
- `smite-core-validation` - Config validation
- `smite-core` - Core stats & platform info

**Tools:**
- `list_templates` - List all templates
- `get_template` - Get template content
- `render_template` - Render with variables
- `validate_config` - Validate against schema
- `get_platform` - Platform information
- `get_stats` - Core statistics

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `init-core.js` | `npm run init-core` | Initialize core |
| `validate-plugin.js` | `npm run validate-plugin` | Validate plugin |
| `detect-platform.js` | `npm run detect-platform` | Detect platform |
| `template-renderer.js` | `npm run render-template` | Render template |

---

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete guide (5-min storytelling)
- **[REFERENCE.md](./REFERENCE.md)** - Quick reference cheat sheet
- **[infrastructure/docs/](./infrastructure/docs/)** - Technical documentation

---

## What's New in v2.0.0

### New Features
- ✅ **Lazy loading** for all templates
- ✅ **MCP integration** with 3 servers
- ✅ **Cross-platform scripts** (Win/Mac/Linux)
- ✅ **Centralized hooks** in hooks.json
- ✅ **Metrics collection** for templates

### Breaking Changes
- TemplateLoader now uses lazy loading (cache enabled)
- Hooks registry moved to `src/hooks/`
- Scripts replaced with Node.js cross-platform

---

## Dependencies

**Required by:**
- studio (v2.0.0+)
- agents (v2.0.0+)
- essentials (v2.0.0+)

**Dependencies:**
- None (core is foundational)

---

## License

MIT

---

**Version:** 2.0.0 | **Last Updated:** 2026-03-12
