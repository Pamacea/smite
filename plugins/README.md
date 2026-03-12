# SMITE Plugins

**Plugin ecosystem** for Claude Code - build, refactor, and scale projects with 12 composable flags and 23+ specialized agents.

**Quick Start:**
```bash
cd /path/to/smite
claude --plugin-dir ./plugins
/studio build "hello world"
```

**Features:** Auto-detection, lazy loading, quality gates, memory integration, progress tracking.

**Documentation:** @GUIDE.md @REFERENCE.md

---

## Overview

SMITE provides a unified development workflow with:

- **12 composable flags** for precise control
- **23+ specialized agents** (frontend, backend, workflow)
- **Auto-detection** for zero-config usage
- **Quality gates** with objective metrics
- **Memory integration** for pattern learning

---

## Quick Installation

```bash
# Core infrastructure (required)
/plugin install core

# Development workflow (recommended)
/plugin install studio

# Productivity tools (optional)
/plugin install essentials
```

---

## Available Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| **[core](./core/README.md)** | 3.6.0 | Shared utilities, templates, validation |
| **[studio](./studio/README.md)** | 2.0.0 | Complete build/refactor workflow |
| **[essentials](./essentials/README.md)** | 2.0.0 | Auto-rename, shell aliases |

---

## Common Commands

```bash
# Quick fix
/studio build --speed "fix button"

# Build feature
/studio build --scale "add auth"

# Quality-critical
/studio build --quality "payment API"

# Refactor
/studio refactor --quick
/studio refactor --types
```

---

## Configuration

`.claude/.smite/studio.json`
```json
{
  "build": {
    "defaults": { "flag": "scale" }
  },
  "refactor": {
    "defaults": { "scope": "recent" }
  }
}
```

---

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete guide with examples
- **[REFERENCE.md](./REFERENCE.md)** - Command cheat sheet
- **[MIGRATION_v3_to_v4.md](./MIGRATION_v3_to_v4.md)** - Migration guide

---

**Version:** 3.0.0 | **Last Updated:** 2026-03-12
