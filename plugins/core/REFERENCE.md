# Core Plugin - Quick Reference

> **Shared infrastructure** - Templates, validation, hooks, lazy loading

---

## Quick Start

```bash
# Used by other plugins (auto-loaded)
/core is a dependency for all SMITE plugins

# Initialize core
npm run init-core

# Validate plugin
npm run validate-plugin -- --plugin=studio

# Detect platform
npm run detect-platform
```

---

## Templates

| Template | Usage | Lazy Load |
|----------|-------|-----------|
| `command-header.md` | Command frontmatter | ✅ |
| `warnings.md` | Warning messages | ✅ |
| `metadata.md` | Footer metadata | ✅ |
| `plan-mode-first.md` | Plan mode template | ✅ |

### Usage

```markdown
<!-- @include ../../core/infrastructure/templates/warnings.md#MANDATORY -->
```

---

## Validation Schemas

| Schema | Usage |
|--------|-------|
| `plugin.schema.json` | Plugin manifests |
| `design-styles.schema.json` | Design styles |
| `vaults.schema.json` | Vault configs |
| `templates.schema.json` | Templates |

### Usage

```json
{
  "$schema": "../core/infrastructure/validation/schemas/plugin.schema.json"
}
```

---

## Platform Detection

| Platform | Detection | Shells |
|----------|-----------|--------|
| **Windows** | MINGW/MSYS/CYGWIN | PowerShell, cmd |
| **macOS** | `darwin` | Bash, Zsh |
| **Linux** | default | Bash, Zsh |

### Script

```bash
npm run detect-platform
# → { platform: 'windows', shell: 'powershell' }
```

---

## Hooks

| Hook | Action | Description |
|------|--------|-------------|
| `SessionStart` | init-core | Initialize core |
| `PostToolUse` | trackUsage | Track usage |
| `Stop` | reportMetrics | Report metrics |

### Registry

```typescript
import { getGlobalHookRegistry } from '@smite/core/src/hooks/registry';
```

---

## Lazy Loading

### TemplateLoader

```typescript
import { TemplateLoader } from '@smite/core/skills/template-loader';

const template = await TemplateLoader.load('command-header');
```

### Benefits

- 60% reduction tokens
- <100ms load time
- Cache for frequently used

---

## MCP Tools

### Template Server

| Tool | Description |
|------|-------------|
| `get_template` | Get template content |
| `render_template` | Render with variables |
| `list_templates` | List all templates |

### Validation Server

| Tool | Description |
|------|-------------|
| `validate_config` | Validate against schema |
| `list_schemas` | List available schemas |

### Core Server

| Tool | Description |
|------|-------------|
| `get_platform` | Get platform info |
| `get_stats` | Get core statistics |

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `init-core.js` | `npm run init-core` | Initialize core |
| `validate-plugin.js` | `npm run validate-plugin` | Validate plugin |
| `detect-platform.js` | `npm run detect-platform` | Detect platform |
| `template-renderer.js` | `npm run render-template` | Render template |

---

## Exports

### From `src/index.ts`

```typescript
// Manifest
export { ManifestLoader, loadFromPluginRoot } from '../manifest/loader';

// Config
export { ConfigManager } from './config/loader';

// Hooks
export { HookRegistry, getGlobalHookRegistry } from './hooks/registry';

// Platform
export { PlatformDetector, getPlatformInfo } from './platform/detector';

// Templates
export { TemplateEngine } from './template/engine';

// Utils
export { Logger, getGlobalLogger } from './utils/logger';
```

---

## Integration

**Used by:**
- studio (v2.0.0+)
- agents (v2.0.0+)
- essentials (v2.0.0+)

**Dependencies:**
- None (core is foundational)

---

## Metrics

| Metric | Value |
|--------|-------|
| Startup tokens | ~6k (60% reduction) |
| Template load | <100ms |
| Hook overhead | <50ms |
| Test coverage | >80% |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Template not found | Check template name, verify lazy loading |
| Validation fails | Check schema path, validate JSON syntax |
| Hook not firing | Verify hook registration, check event name |
| Platform wrong | Run detect-platform script |

---

*Version: 2.0.0 | Last Updated: 2026-03-12*
