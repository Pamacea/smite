---
description: Multi-agent coordination and workflow management
argument-hint: [--workflow=full-feature|bugfix|refactor] [--agents=all|custom]
---

Use the smite-orchestrator skill to coordinate multi-agent workflows.

**Workflows:**
- `full-feature` - Complete feature development (all agents)
- `bugfix` - Bug resolution workflow
- `refactor` - Code refactoring workflow

**Agent Selection:**
- `all` - Use all relevant agents automatically
- `custom` - Choose specific agents

**Orchestration:**
Coordinates agents in optimal sequence for the workflow

**Usage:**
/smite:orchestrator --workflow=full-feature
/smite:orchestrator --workflow=bugfix --agents=analyst,constructor,gatekeeper
