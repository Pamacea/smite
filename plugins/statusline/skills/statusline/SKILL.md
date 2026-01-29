---
name: statusline
description: Lightweight session statusline display with git branch, tokens, cost, and progress
version: 1.0.0
---

# Statusline Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Display a lightweight statusline in the terminal showing current session information including git branch, file changes, model used, token consumption, estimated cost, and progress percentage.

## Core Workflow

1. **Input**: Automatic (PostToolUse hook) or manual invocation
2. **Process**:
   - Read git status for branch and file changes
   - Calculate token usage from session metadata
   - Estimate cost based on model pricing
   - Calculate progress based on completed tasks
   - Format and display statusline
3. **Output**: Compact one-line status display

## Key Principles

- **Non-Intrusive**: Single line, doesn't interfere with work
- **Real-Time**: Updates after each tool use
- **Compact**: All info in one glance
- **Color-Coded**: Visual indicators for status

## Statusline Format

```
{branch} {+added} {-deleted} {~modified} | {model} | {tokens}k/{budget}k | {cost} | {progress}% | {duration}
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| **branch** | Current git branch | `main` |
| **changes** | File changes | `+3 -1 ~2` |
| **model** | AI model used | `opus` |
| **tokens** | Used/budget tokens | `45k/100k` |
| **cost** | Estimated cost | `$0.54` |
| **progress** | Task completion | `75%` |
| **duration** | Session time | `12m` |

## Color Indicators

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Normal operation |
| 🟢 Green | On track |
| 🟡 Yellow | Approaching limit |
- 🔴 Red | Over budget |
| ⚪ Gray | No data |

## Configuration

### Display Options
- `hide-on-empty`: Hide when no active session
- `show-cost`: Enable/disable cost display
- `token-budget`: Set warning threshold (default: 100k)
- `update-frequency`: How often to refresh (default: per tool use)

### Git Integration
- Auto-detects git repository
- Shows branch name
- Tracks staged and unstaged changes
- Works with any git hosting

### Token Tracking
- Counts input and output tokens
- Calculates total session usage
- Estimates based on model pricing:
  - `opus`: $15/M input, $75/M output
  - `sonnet`: $3/M input, $15/M output
  - `haiku`: $0.25/M input, $1.25/M output

## Integration

- **Trigger**: PostToolUse hook (after each tool execution)
- **Requires**: Git repository (optional), session metadata
- **Works with**: All SMITE workflows
- **Location**: Terminal bottom line or after output

## Usage

```bash
# Manual invocation
/statusline

# Toggle on/off (via hook configuration)
/statusline toggle

# Update display settings
/statusline config --show-cost=false
```

## Error Handling

- **Not a git repo**: Shows branch as `no-git`
- **No session data**: Shows dashes for metrics
- **Hook fails**: Continues without display
- **Cost calc fails**: Shows cost as `N/A`

## Examples

### Example 1: Active Development
```
main +5 -2 ~3 | opus | 45k/100k | $0.54 | 75% | 12m
```

### Example 2: Feature Branch
```
feat/auth +12 -0 ~4 | sonnet | 23k/100k | $0.09 | 40% | 8m
```

### Example 3: Approaching Limit
```
main +20 -5 ~8 | opus | 92k/100k | $1.12 | 90% | 25m ⚠️
```

## Performance

- **Overhead**: <10ms per update
- **Memory**: Minimal (cached state)
- **CPU**: Negligible (simple git commands)

---
*Statusline Skill v1.0.0 - Session awareness at a glance*
