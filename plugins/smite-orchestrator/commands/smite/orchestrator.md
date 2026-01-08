---
description: Multi-agent coordination and workflow management
argument-hint: [--workflow=full-feature|bugfix|refactor|custom] [--agents=agent1,agent2,...]
---

Use the smite-orchestrator skill to coordinate multi-agent workflows.

**Workflows:**
- `full-feature` - Complete feature development (all agents)
- `bugfix` - Bug resolution workflow
- `refactor` - Code refactoring workflow
- `custom` - Build your own workflow with specific agents

**Agent Selection:**
- For `custom` workflow: specify comma-separated agents
- Available agents: initializer, explorer, strategist, aura, constructor, gatekeeper, handover, surgeon, brainstorm

**Orchestration:**
Coordinates agents in optimal sequence for the workflow

**Usage:**
/smite:orchestrator --workflow=full-feature
/smite:orchestrator --workflow=bugfix --agents=explorer,constructor,gatekeeper
/smite:orchestrator --workflow=custom --agents=explorer,strategist,constructor
