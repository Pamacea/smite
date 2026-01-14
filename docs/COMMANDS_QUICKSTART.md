# SMITE Commands Plugin - Quick Start

## Installation

```bash
/plugin install commands@smite
```

This will automatically install 11 essential commands to your `~/.claude/commands/` directory.

## What Gets Installed

| Command | Purpose | Use When |
|---------|---------|----------|
| `/oneshot` | Ultra-fast implementation | Quick features, small fixes |
| `/explore` | Deep codebase exploration | Understanding new code |
| `/debug` | Systematic bug debugging | Complex bugs, errors |
| `/commit` | Quick commit & push | Save your work |
| `/claude-memory` | CLAUDE.md management | Project setup |
| `/epct` | Systematic implementation | Medium complexity features |
| `/apex` | Quality-focused workflow | Production code |
| `/explain-architecture` | Architecture analysis | Documentation |
| `/cleanup-context` | Context optimization | Reduce token usage |
| `/create-pull-request` | PR creation | Code review |
| `/run-tasks` | GitHub issue execution | Issue-driven dev |

## Quick Examples

### Ultra-Fast Feature
```bash
/oneshot Add user profile page with avatar upload
```

### Understand Codebase
```bash
/explore How does the payment system work?
```

### Fix Bug
```bash
debug User gets 500 error when uploading large files
```

### Commit Work
```bash
/commit
```

### Systematic Implementation
```bash
/epct Build complete admin dashboard with user management
```

## Decision Guide

```
Need speed?
  → /oneshot (5-10 min, shallow validation)

Need balance?
  → /epct (detailed planning, thorough testing)

Need quality?
  → /apex (user approval, comprehensive verification)

Need understanding?
  → /explore (deep research, parallel agents)
  → /explain-architecture (patterns and design)

Need to fix bug?
  → /debug (root cause analysis, minimal fixes)

Need to save work?
  → /commit (auto-format, auto-push)

Need to collaborate?
  → /create-pull-request (PR with auto-description)
  → /run-tasks (GitHub issue → PR workflow)
```

## Integration with SMITE

These commands work seamlessly with SMITE agents:

```bash
# Explore first, then use architect
/explore How is authentication implemented?
/architect --mode=design "Update auth system"

# Use oneshot with builder
/oneshot Add dark mode toggle
/builder --tech=nextjs "Implement theme switcher"

# Debug before simplifying
/debug Memory leak in data fetching
/simplifier --scope=file src/hooks/useData.ts

# Commit after any agent work
/ralph "Build user settings page"
/commit  # Auto-commits Ralph's work
```

## Documentation

Full documentation available at:
- [plugins/commands/README.md](../plugins/commands/README.md)
- [docs/COMMANDS_ANALYSIS.md](COMMANDS_ANALYSIS.md) - Complete analysis and rationale

## Updating

```bash
/plugin update commands@smite
```

**Note**: Existing commands won't be overwritten. Delete manually first if needed.

---

**Version**: 1.0.0
**SMITE Version**: 3.0.0
