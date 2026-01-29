---
description: "Multi-agent orchestration with parallel execution and workflow system"
argument-hint: "[prd.json] | '<prompt>' [--workflow=<id>] [--step=<id>] [--from=<id>] [--to=<id>]"
---

# Ralph Multi-Agent

Autonomous multi-agent workflow with parallel execution for 2-3x speedup and step-based workflow system.

## ⚠️ MANDATORY: All Agents Must Use Semantic Search First

**ALL agents launched by Ralph MUST follow this rule:**

**BEFORE any exploration/code analysis, agents MUST:**

1. **Try `/toolkit search`** - 75% token savings, 2x precision
2. **Try `grepai search "query"`** - Alternative semantic search
3. **ONLY then**: Manual Bash/Glob/Grep

**NEVER start with manual tools - Always use semantic search!**

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md` | [github.com/yoanbernabeu/grepai](https://github.com/yoanbernabeu/grepai)

---

## Quick Start

```bash
# Execute existing PRD
/ralph execute .claude/.smite/prd.json

# Auto-generate PRD from prompt and execute
/ralph "Build a todo app with auth, filters, and export"

# Show progress
/ralph status

# Cancel workflow
/ralph cancel
```

## How It Works

1. **Parse PRD** → Read user stories from prd.json
2. **Analyze Dependencies** → Build dependency graph
3. **Optimize** → Create parallel execution batches
4. **Execute** → Launch multiple agents simultaneously
5. **Track** → Update progress and commit changes
6. **Repeat** → Until all stories complete

---

## 🔄 Workflow System

Ralph now supports a step-based workflow system similar to the mobs plugin. Each story can be executed through a series of predefined steps with MCP tool integration.

### Available Workflows

| Workflow ID | Name | Description | Steps |
|------------|------|-------------|-------|
| `spec-first` | Spec-First Development | Default workflow with specification generation | analyze → plan → execute → review → complete |
| `debug` | Debug Workflow | Systematic bug detection and resolution | analyze → plan → resolve → verify → complete |
| `refactor` | Refactor Workflow | Code quality improvement with validation | analyze → plan → execute → review → resolve → verify → complete |
| `feature` | Feature Development | Complete feature implementation with research | analyze → plan → execute → review → complete |

### Workflow Steps

| Step | Description | MCP Tools |
|------|-------------|-----------|
| `analyze` | Codebase analysis and dependency detection | toolkit, web-search |
| `plan` | Specification generation | - |
| `execute` | Agent execution | - |
| `review` | Quality check and validation | toolkit |
| `resolve` | Apply fixes | - |
| `verify` | Verify fixes with testing | toolkit |
| `complete` | Mark story as completed | - |

### Workflow Usage

```bash
# Use default spec-first workflow
/ralph "Build a todo app" --workflow=spec-first

# Use debug workflow
/ralph "Fix authentication bug" --workflow=debug

# Use refactor workflow
/ralph "Improve code quality" --workflow=refactor

# Execute specific steps only
/ralph "Add feature" --workflow=feature --step=analyze --step=execute

# Execute from specific step
/ralph "Continue work" --workflow=spec-first --from=execute

# Execute up to specific step
/ralph "Plan only" --workflow=spec-first --to=plan

# Skip specific steps
/ralph "Quick execution" --workflow=spec-first --skip=review

# Disable MCP tools
/ralph "Simple task" --workflow=spec-first --mcp=false
```

### Workflow Configuration

Workflows are defined in `plugins/ralph/config/workflows.json`. Each workflow includes:

- **Steps**: Ordered list of steps to execute
- **MCP Tools**: Tools available at each step
- **Required**: Whether step failure should stop the workflow
- **Outputs**: Expected outputs from each step

---

## Parallel Execution Example

Given 4 user stories:
- US-001: Database (no dependencies)
- US-002: API (depends on US-001)
- US-003: UI (depends on US-001)
- US-004: Filter (depends on US-003)

Ralph creates 3 batches:
- **Batch 1**: US-001 (sequential)
- **Batch 2**: US-002, US-003 (parallel) ⚡
- **Batch 3**: US-004 (sequential)

**Speedup: 25% faster than sequential**

## Usage Examples

### Example 1: Execute PRD

```bash
/ralph execute .claude/.smite/prd.json
```

Ralph will:
- Parse the PRD
- Optimize execution
- Run agents in parallel
- Track progress
- Complete all stories

### Example 2: Auto-Generate PRD

```bash
/ralph "Build a task manager app with:
- User authentication
- Task CRUD operations
- Category filtering
- Due date reminders
- Export to CSV"
```

Ralph will:
1. Generate detailed PRD
2. Split into user stories
3. Build dependency graph
4. Execute in parallel
5. Complete workflow

### Example 3: Check Progress

```bash
/ralph status
```

Shows:
- Current iteration
- Stories completed
- Stories remaining
- Estimated time remaining

## PRD Format

Create `.claude/.smite/prd.json`:

```json
{
  "project": "TodoApp",
  "branchName": "ralph/todo-app",
  "description": "Task manager with advanced features",
  "userStories": [
    {
      "id": "US-001",
      "title": "Setup Next.js project",
      "description": "Initialize Next.js with TypeScript and Tailwind",
      "acceptanceCriteria": [
        "Next.js 14 installed",
        "TypeScript configured",
        "Tailwind CSS working",
        "Typecheck passes"
      ],
      "priority": 1,
      "agent": "smite-builder",
      "tech": "nextjs",
      "dependencies": [],
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Best Practices

1. **Small Stories** - Each story fits in one iteration
2. **Explicit Dependencies** - Use `dependencies` array
3. **Verifiable Criteria** - Include "Typecheck passes"
4. **Agent Selection** - Match agent to story type

## Performance

**Typical speedups:**
- Simple projects: 20-30% faster
- Medium projects: 40-50% faster
- Complex projects: 50-60% faster

## Key Innovation

Unlike traditional Ralph (sequential), SMITE Ralph executes independent stories in **parallel** using the Task tool.

**Traditional:**
```
Story 1 → Story 2 → Story 3 → Story 4
(12 minutes)
```

**SMITE Ralph:**
```
Story 1 → (Story 2 + Story 3) → Story 4
(9 minutes - 25% faster)
```
