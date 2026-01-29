# 🔥 SMITE v3.2.0

**Zero-debt engineering agents with multi-agent parallel orchestration (2-3x faster)**

---

## ⚡ Quick Start

```bash
# Step 1: Install Core (REQUIRED - provides shared utilities)
/plugin marketplace add Pamacea/smite
/plugin install core@smite

# Step 2: Install desired plugins
/plugin install toolkit@smite    # Optional but recommended (75% token savings)
/plugin install ralph@smite       # Multi-agent orchestrator
/plugin install mobs@smite        # Architect, Builder, Refactor, Note
/plugin install basics@smite      # Oneshot, Epct, Debug, Explore, Commit

# Step 3: Execute
/ralph "Build a todo app with authentication"
/architect "Design a modern dashboard"
```

**🚨 CRITICAL: Always use semantic search before exploring code** (75% token savings)
```bash
/toolkit search "authentication flow"    # 1st choice (75% savings)
grepai search "authentication"           # 2nd choice (semantic search)
```

**Why?** Traditional: 180k tokens → Toolkit: 45k tokens. **See:** [DECISION_TREE.md](docs/DECISION_TREE.md)

---

## 🎯 Plugin Dependencies

**Starting with v3.2.0, SMITE uses a modular plugin system with shared dependencies.**

### Required vs Optional Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| **core** | **REQUIRED** | Shared utilities, templates, validation schemas |
| toolkit | Optional | Token optimization (75% savings) |
| ralph | Optional | Multi-agent orchestrator |
| mobs | Optional | Architect, Builder, Refactor, Note agents |
| basics | Optional | Essential commands (oneshot, epct, debug, explore, commit) |
| predator | Optional | Modular workflow system |
| statusline | Optional | Session status display |
| shell | Optional | Shell shortcuts |
| auto-rename | Optional | Session renaming |

### Dependency Graph

```
                    ┌─────────────┐
                    │    core     │  ← REQUIRED for all plugins
                    │  (v1.0.0)   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │  mobs   │      │ basics  │      │ ralph   │
    │(v4.1.0) │      │(v3.2.0) │      │(v3.1.0) │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
         └─────────┬───────┴─────────┬───────┘
                   │                 │
              ┌────▼────┐      ┌────▼────┐
              │toolkit* │      │predator │
              │(optional)│      │(v1.0.0) │
              └─────────┘      └─────────┘
```

---

## 🚀 What's New in v3.2

### ✨ **New Core Plugin System**
- **`core` plugin** - Shared utilities for all SMITE plugins
  - Standardized templates (command headers, warnings, metadata)
  - JSON schemas for configuration validation
  - Cross-platform utilities (Windows, macOS, Linux)
  - Dependency resolution patterns

### 🔧 **Plugin Dependency Management**
- **Required dependencies** - Plugin fails gracefully if missing with clear error
- **Optional dependencies** - Automatic fallback to alternative implementations
- **MCP tool declarations** - Explicit MCP tool requirements per plugin
- **Graceful degradation** - Plugins work even when optional tools are missing

### 📦 **Refactored Plugins**
- **mobs v4.1.0** - Modular `note` command (write/format/search)
- **basics v3.2.0** - Standardized command interfaces
- **design-styles** - Modular configuration (base + 5 variants)

### 🌍 **Cross-Platform Compatibility**
- **Windows** (Git Bash, MSYS2, PowerShell)
- **macOS** (Homebrew paths, BSD tools compatibility)
- **Linux** (Distribution detection)

---

## 🤖 Core Plugins (9)

### Foundation
**[core](plugins/core)** ⚠️ **REQUIRED** - Shared utilities, templates, validation schemas
```
Provides: templates/, validation/schemas/, platform/, dependency-resolution/
Required by: mobs, basics, and all future plugins
```

### Orchestration
**[ralph](plugins/ralph)** - Multi-agent orchestrator with parallel execution (2-3x speedup)
```bash
/ralph "Build a REST API"
/ralph:loop "Full SaaS platform"  # Auto-iterating
```

**[mobs](plugins/mobs)** - Multi-agent system with spec-first workflow and creative design
```bash
/architect "Design authentication system"
/builder "Implement user dashboard"
/refactor "Systematic refactoring"
/note write inbox "Quick note"
```

### Development
**[basics](plugins/basics)** - Essential commands (oneshot, epct, debug, explore, commit)
```bash
/oneshot "Add user login"    # Ultra-fast
/epct "Build dashboard"      # Systematic
/debug "Fix memory leak"
/explore "How does auth work?"
/commit
```

**[predator](plugins/predator)** - Advanced modular workflow with 8-step systematic execution
```bash
/predator "Feature implementation"
/debug "Bug investigation"
/brainstorm "Solutions exploration"
```

### Analysis
**[toolkit](plugins/toolkit)** - Token optimization + semantic search (75% savings)
```bash
/toolkit search "query" --mode=hybrid
/toolkit explore --task=find-function
/toolkit graph --impact
```

### Productivity
**[statusline](plugins/statusline)** - Auto-configuring statusline (tokens, git, session)
**[shell](plugins/shell)** - Shell shortcuts (cc, ccc)
**[auto-rename](plugins/auto-rename)** - Intelligent session renaming

---

## 📁 Structure

```
smite/
├── .claude-plugin/           # Marketplace manifest
│   └── marketplace.json      # 9 plugins catalog
├── .claude/
│   └── .smite/              # State (PRD, spec, quality config)
├── plugins/                  # 9 plugins
│   ├── core/                # ⚠️ FOUNDATION - shared utilities
│   │   ├── templates/       # Reusable templates
│   │   ├── validation/      # JSON schemas
│   │   └── platform/        # Cross-platform utilities
│   ├── ralph/               # Orchestrator (parallel execution)
│   ├── mobs/                # Multi-agent system
│   ├── basics/              # Essential commands
│   ├── predator/            # Modular workflow
│   ├── toolkit/             # Token optimization
│   ├── statusline/          # Status UI
│   ├── shell/               # Shell shortcuts
│   └── auto-rename/         # Session naming
├── docs/                    # Documentation hub
└── README.md                # This file
```

---

## 🔧 Installation

### Full Installation (Recommended)

```bash
# Add marketplace
/plugin marketplace add Pamacea/smite

# Install core first (REQUIRED)
/plugin install core@smite

# Install toolkit (highly recommended)
/plugin install toolkit@smite

# Install orchestration plugins
/plugin install ralph@smite
/plugin install mobs@smite

# Install development commands
/plugin install basics@smite
/plugin install predator@smite

# Install productivity tools
/plugin install statusline@smite
/plugin install auto-rename@smite
/plugin install shell@smite
```

### Minimal Installation

```bash
/plugin marketplace add Pamacea/smite
/plugin install core@smite
/plugin install basics@smite    # Essential commands only
```

---

## 🌍 Cross-Platform Compatibility

SMITE works on all major operating systems with automatic platform detection:

### Windows (Git Bash / MSYS2)
- Automatic detection of Git Bash environment
- Reserved device name filtering (nul, con, prn, aux, com1-9, lpt1-9)
- PowerShell hook compatibility with automatic `--no-verify` fallback

### macOS
- Homebrew paths auto-detection (`/opt/homebrew/bin`)
- BSD vs GNU tools compatibility
- Apple Silicon (ARM64) support

### Linux
- Distribution detection (Debian, Ubuntu, Fedora, Arch, etc.)
- Package manager compatibility (apt, dnf, pacman, etc.)

**Platform detection is handled automatically by the `core` plugin.**

---

## 📊 Ralph Parallel Execution

```json
{
  "project": "TodoApp",
  "userStories": [
    { "id": "US-001", "title": "Setup Next.js", "dependencies": [] },
    { "id": "US-002", "title": "Build UI", "dependencies": ["US-001"] },
    { "id": "US-003", "title": "Add auth", "dependencies": ["US-001"] }
  ]
}
```

**Execution:** `Batch 1: [US-001] → Batch 2: [US-002, US-003] ← PARALLEL!`

**Speedup:**
- Small projects: 20-30% faster
- Medium projects: 40-50% faster
- Complex projects: 50-60% faster

---

## 🔄 Updating

```bash
# Update core first (REQUIRED)
/plugin update core@smite

# Update all plugins
/plugin update --all

# Or update from marketplace
/plugin marketplace update smite
```

---

## 📚 Documentation

- **[All docs](docs/INDEX.md)** - Complete documentation index
- **[Plugins](plugins/README.md)** - 9 plugins catalog
- **[Core Plugin](plugins/core/README.md)** - Shared utilities documentation
- **[Ralph Guide](docs/RALPH_GUIDE.md)** - Complete Ralph usage
- **[Spec-First](docs/SPEC_FIRST.md)** - Spec-driven workflow
- **[Decision Tree](docs/DECISION_TREE.md)** - Tool selection guide

---

## ⚠️ Troubleshooting

### "Core plugin not found" error

```bash
# Install the core plugin first
/plugin install core@smite
```

### "MCP tool unavailable" warning

Some plugins use optional MCP tools. If unavailable, plugins automatically fall back to alternative methods. For full functionality, ensure MCP servers are running.

### Windows-specific issues

```bash
# If git hooks fail, the commit command automatically retries with --no-verify
# For manual fixes:
git commit --no-verify -m "your message"
```

---

**SMITE v3.2.0** • **9 plugins** • **Core foundation** • **Modular architecture** • **Zero-debt engineering**

**License:** MIT • **Repository:** [github.com/Pamacea/smite](https://github.com/Pamacea/smite)
