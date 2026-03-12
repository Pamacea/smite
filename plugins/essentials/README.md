# Essentials Plugin

**Productivity utilities** - Auto-rename, shell aliases, lazy loading, hooks system.

**Version:** 2.0.0 | **SMITE Version:** 4.0.0

---

## Quick Start

```bash
# Installation
/plugin install essentials

# Install shell aliases (optional)
/install-aliases

# Use aliases
cc "Build my feature"       # Normal mode
ccc "Quick fix"            # Bypass mode
```

---

## Overview

SMITE Essentials provides productivity utilities that enhance your daily development workflow:

- **Auto-Rename**: Intelligent session renaming with "Action: Context" format
- **Shell Aliases**: Cross-platform cc/ccc aliases for Claude Code
- **Lazy Loading**: Skills loaded on-demand for optimal performance
- **Hooks System**: Event-driven automation for session management
- **Cross-Platform**: Windows, macOS, Linux support

---

## Commands

### /install-aliases

One-time installation of Claude Code shell aliases.

```bash
/install-aliases
```

**Installs:**
- `cc` - Normal mode (respects permissions)
- `ccc` - Bypass-permissions mode (skips confirmations)

**Platforms:**
- Windows: PowerShell, cmd.exe
- macOS: Bash, Zsh
- Linux: Bash, Zsh

### /rename

Manual session renaming (automatic by default).

```bash
/rename "Custom session name"
```

---

## Features

### Auto-Rename

**Smart Triggers:**
- SessionStart - Sets initial name
- PostToolUse - Updates after operations
- UserPromptSubmit - Refines based on context

**Name Format:** `Action: Context`
- `Fix: login bug`
- `Add: user API`
- `Refactor: auth system`

### Shell Aliases

**Cross-Platform:**
| Alias | Mode | Description |
|-------|------|-------------|
| `cc` | Normal | Respects all hooks |
| `ccc` | Bypass | Skips confirmations |

**Safe Installation:**
- Automatic backup
- Idempotent (safe to re-run)
- Rollback capability

### Lazy Loading

Skills loaded on-demand with `lazy_load` frontmatter:
- **auto-rename** - `lazy_load: false` (always active)
- **shell** - `lazy_load: true` (on-demand)

---

## Configuration

**File:** `.claude/.smite/essentials.json`

```json
{
  "version": "2.0.0",
  "autoRename": {
    "enabled": true,
    "maxNameLength": 50,
    "maxRenamesPerSession": 10
  },
  "shell": {
    "enabled": true,
    "aliases": {
      "cc": "claude",
      "ccc": "claude-code"
    }
  }
}
```

---

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete guide (5-min storytelling)
- **[REFERENCE.md](./REFERENCE.md)** - Quick reference cheat sheet

---

## Requirements

- SMITE v4.0.0 or higher
- /core (installed automatically)
- Node.js 18.0.0 or higher

---

## License

MIT

---

**Version:** 2.0.0 | **Last Updated:** 2026-03-12
