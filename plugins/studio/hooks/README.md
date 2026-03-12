# SMITE Studio Hooks

Event-driven validation and quality tracking system.

## Overview

The hooks system provides automatic validation and quality tracking for all operations:

- **PreToolUse** - Validate before Write/Edit/Bash operations
- **PostToolUse** - Track metrics after file changes
- **SessionStart** - Initialize session tracking
- **Stop** - Display session summary

## Hook Events

| Event | When | Handler |
|-------|------|---------|
| `SessionStart` | Plugin loaded | Startup message |
| `PreToolUse` | Before tool execution | Validation scripts |
| `PostToolUse` | After tool execution | Metrics tracking |
| `Stop` | Session end | Summary display |

## Configuration

`hooks/hooks.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "./plugins/studio/scripts/validate-changes.sh",
        "timeout": 5000,
        "allowFailure": true
      }]
    }]
  }
}
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `validate-changes.sh` | Security and size validation for file writes |
| `validate-command.sh` | Dangerous command detection |
| `track-metrics.sh` | Code metrics tracking |
| `session-summary.sh` | End-of-session summary |
| `quality-gate.sh` | Quality scoring (manual) |

## Usage

The hooks are automatically triggered. No manual invocation needed.

To run quality gate manually:
```bash
./plugins/studio/scripts/quality-gate.sh
```

## Quality Scoring

The quality gate evaluates:

- **Barrel exports** (20 pts) - index.ts present
- **Tests** (30 pts) - Test files included
- **Type safety** (20 pts) - No `any` types
- **Code reduction** (30 pts) - Net lines removed
- **Documentation** (10 pts) - Docs updated

**Score ≥ 80** = Excellent
**Score 50-79** = Good
**Score < 50** = Needs improvement

## Customization

To add custom hooks:

1. Edit `hooks/hooks.json`
2. Add your hook script to `scripts/`
3. Reload the plugin

---

**Version:** 1.0.0 | **Part of:** Studio v3.0
