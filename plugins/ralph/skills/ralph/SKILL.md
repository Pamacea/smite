# Ralph Skill

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

Orchestrate multi-agent workflows with intelligent parallel execution to achieve 2-3x speedup over sequential development.

## Core Workflow

1. **Input**: User prompt or PRD file
2. **Process**:
   - Parse PRD and extract user stories
   - Build dependency graph
   - Create parallel batches (independent stories)
   - Execute batches sequentially (stories in parallel)
   - Track progress and commit after each story
3. **Output**: Completed feature with all stories passing

## Key Principles

- **Parallel execution**: Independent stories run simultaneously via Task tool
- **Dependency analysis**: Automatic graph building ensures correct execution order
- **State persistence**: Progress tracked in `.claude/.smite/prd.json`
- **Spec-first**: Architect generates spec before Builder implements
- **Quality gates**: Refactor ensures code quality improvements

## Integration

- **Requires**: toolkit (semantic search - mandatory)
- **Orchestrates**: architect, builder, refactor, explorer, simplifier
- **Reads from**: `.claude/.smite/prd.json`
- **Writes to**: `.claude/.smite/ralph-state.json`, `.claude/.smite/progress.txt`

## Commands

- `/ralph "prompt"` - Auto-generate PRD and execute
- `/ralph execute <prd.json>` - Execute custom PRD
- `/loop "prompt"` - Auto-iterating execution
- `/ralph status` - Show progress
- `/ralph cancel` - Cancel workflow

## Configuration

- **PRD format**: JSON with project, userStories array
- **Story fields**: id, title, agent, dependencies, passes
- **State file**: `.claude/.smite/ralph-state.json`
- **Environment**: `.claude/.smite/` directory

## Error Handling

- **Dependency cycle**: Detect and request PRD fix
- **Story failure**: Mark as failed, allow retry
- **Hook missing**: Request `npm run install-hook`
- **Incomplete PRD**: Alert and request missing fields

---
*Auto-generated from plugin.json - Last sync: 2025-01-22*
