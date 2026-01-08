---
description: Multi-agent coordination and custom workflow management
argument-hint: [--workflow=full-feature|bugfix|refactor|custom] [--agents=agent1,agent2,...]
---

Coordinate multi-agent workflows with automatic tracking and suggestions.

**Workflows:**
- `full-feature` - Complete feature development (all agents)
- `bugfix` - Bug resolution workflow
- `refactor` - Code refactoring workflow
- `custom` - Build your own workflow

**Custom Workflow:**
/smite-orchestrator --workflow=custom --agents=explorer,strategist,constructor

**Available agents:**
initializer, explorer, strategist, aura, constructor, gatekeeper, handover, surgeon, brainstorm

**Output:**
- `.smite/orchestrator-state.json` - Current workflow state
- `.smite/workflow/session-info.md` - Progress tracking
- `docs/MISSION_BRIEF_{AGENT}.md` - Handoff documents

**Usage:**
/smite-orchestrator --workflow=full-feature
/smite-orchestrator --workflow=custom --agents=explorer,constructor,gatekeeper
