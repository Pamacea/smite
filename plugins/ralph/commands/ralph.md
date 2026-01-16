---
description: "Multi-agent orchestration with parallel execution"
argument-hint: "[prd.json] | '<prompt>'"
---

# Ralph Multi-Agent

Autonomous multi-agent workflow with parallel execution for 2-3x speedup.

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
