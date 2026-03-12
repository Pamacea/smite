# SMITE Agents Hooks

Event-driven validation and analytics for agent usage.

## Overview

The agents plugin uses hooks to:
- **Initialize** tracking on session start
- **Validate** agents before invocation
- **Track** usage patterns for analytics
- **Report** metrics at session end

## Hook Events

| Event | When | Handler |
|-------|------|---------|
| `SessionStart` | Plugin loaded | Initialize metrics |
| `PreAgentInvoke` | Before agent loads | Validation script |
| `PostAgentInvoke` | After agent execution | Usage tracking |
| `Stop` | Session end | Metrics report |

## Configuration

`hooks/hooks.json`:
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "./plugins/agents/scripts/init-agents.sh"
      }]
    }],
    "PreAgentInvoke": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "./plugins/agents/scripts/validate-agent.sh"
      }]
    }],
    "PostAgentInvoke": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "./plugins/agents/scripts/track-usage.sh"
      }]
    }]
  }
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `init-agents.sh` | Initialize metrics tracking |
| `validate-agent.sh` | Validate agent before loading |
| `track-usage.sh` | Track agent usage |
| `agent-metrics.sh` | Display session metrics |
| `list-agents.sh` | List all available agents |

## Usage

The hooks run automatically. To list agents manually:
```bash
./plugins/agents/scripts/list-agents.sh
```

## Storage

Agent metrics stored in `.smite/agents/`:
- `metrics.json` - Session metrics
- `invocations.log` - Agent invocation log

---

**Version:** 1.0.0 | **Part of:** Agents Plugin v2.0
