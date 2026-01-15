---
name: smite-ralph
description: Multi-agent orchestrator with parallel execution using Ralph Wiggum technique
version: 3.0.0
---

# 🔄 SMITE RALPH

**Multi-Agent Orchestrator with Parallel Execution**

---

## 🎯 MISSION

**Orchestrate multi-agent workflows with intelligent parallel execution. Analyze PRDs, build dependency graphs, and execute user stories in parallel where possible to achieve 2-3x speedup over sequential execution.**

**Key Innovation:** Unlike traditional Ralph (sequential), SMITE Ralph executes independent stories in parallel using the Task tool.

---

## 📋 COMMANDES

### `/ralph execute <prd.json>`

Execute a PRD with parallel optimization.

```bash
/ralph execute .smite/prd.json
```

**Process:**
1. Parse PRD and extract user stories
2. Build dependency graph
3. Optimize for parallel execution
4. Launch agents in parallel via Task tool
5. Track progress and update state
6. Generate completion report

### `/ralph "<prompt>"`

Auto-generate PRD from prompt and execute.

```bash
/ralph "Build a todo app with auth, filters, and export to CSV"
```

**Process:**
1. Generate detailed PRD from prompt
2. Split into user stories
3. Build dependency graph
4. Execute in parallel
5. Complete workflow

### `/ralph status`

Show current workflow progress.

```bash
/ralph status
```

### `/ralph cancel`

Cancel active Ralph workflow.

```bash
/ralph cancel
```

### `/ralph-loop "<prompt>"` ⚡ NEW

Auto-generate PRD from prompt and execute with **autonomous looping** until completion.

```bash
# Basic usage
/ralph-loop "Build a todo app with authentication"

# With custom options
/ralph-loop "Create REST API" --max-iterations 100 --completion-promise "DEPLOYED"
```

**Process:**
1. Generate detailed PRD from prompt
2. Create `.claude/ralph-loop.local.md` with loop configuration
3. Execute user stories iteratively
4. Stop hook intercepts exit and re-feeds prompt if not complete
5. Continues until `<promise>COMPLETE</promise>` detected or max iterations

**Best for:** Complex features requiring multiple iterations until completion.

---

## 🚀 INNOVATION: PARALLEL EXECUTION

### Traditional Ralph (Sequential)

```
Iteration 1: Story 1 → 3 min
Iteration 2: Story 2 → 3 min
Iteration 3: Story 3 → 3 min
Iteration 4: Story 4 → 3 min

Total: 12 minutes
```

### SMITE Ralph (Parallel)

```
Batch 1: [Story 1] → 3 min
Batch 2: [Story 2, Story 3] → 3 min (PARALLEL!)
Batch 3: [Story 4] → 3 min

Total: 9 minutes (2x faster)
```

**Speedup:** 40-60% faster depending on dependency structure

---

## 📊 DEPENDENCY GRAPH

Ralph automatically analyzes dependencies and creates execution batches.

### Example PRD

```json
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Add tasks table",
      "priority": 1,
      "agent": "builder:task",
      "dependencies": []
    },
    {
      "id": "US-002",
      "title": "Create API endpoints",
      "priority": 2,
      "agent": "builder:task",
      "dependencies": ["US-001"]
    },
    {
      "id": "US-003",
      "title": "Build UI components",
      "priority": 2,
      "agent": "builder:task",
      "dependencies": ["US-001"]
    },
    {
      "id": "US-004",
      "title": "Add filter dropdown",
      "priority": 3,
      "agent": "builder:task",
      "dependencies": ["US-003"]
    }
  ]
}
```

### Execution Batches

```
Batch 1 (Sequential):
  - US-001 (no deps)

Batch 2 (PARALLEL!):
  - US-002 (dep: US-001) ⚡
  - US-003 (dep: US-001) ⚡

Batch 3 (Sequential):
  - US-004 (dep: US-003)

Result: 3 batches vs 4 sequential = 25% faster
```

---

## 🔄 WORKFLOW

### Step 1: Parse PRD

```typescript
// Read prd.json
const prd = readPRD(".smite/prd.json");

// Extract user stories
const stories = prd.userStories.filter(s => !s.passes);
```

### Step 2: Build Dependency Graph

```typescript
// Analyze dependencies
const graph = buildDependencyGraph(stories);

// Create execution batches
const batches = optimizeExecution(graph);

// Example output:
batches = [
  { stories: [US-001], parallel: false },
  { stories: [US-002, US-003], parallel: true },  // ⚡
  { stories: [US-004], parallel: false }
];
```

### Step 3: Execute Batches

**For parallel batches:**

```typescript
// Batch 2: Launch 2 agents in parallel
Task(
  subagent_type="builder:task",
  prompt="Implement US-002: Create API endpoints"
);

Task(
  subagent_type="explorer:task",
  prompt="Implement US-003: Build UI components"
);

// Both run simultaneously! ⚡
```

**For sequential batches:**

```typescript
// Single agent
Task(
  subagent_type="architect:task",
  prompt="Implement US-001: Setup project structure"
);
```

### Step 4: Track Progress

```typescript
// Update prd.json after each story
story.passes = true;
writePRD(".smite/prd.json", prd);

// Append to progress.txt
appendProgress(`
## US-002 Complete
- Implemented API endpoints
- Tests passing
- Committed: feat: US-002 - API endpoints
`);
```

---

## 📝 PRD FORMAT

### Extended PRD Schema

```json
{
  "project": "ProjectName",
  "branchName": "ralph/feature-name",
  "description": "Feature description",
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "As a user, I want...",
      "acceptanceCriteria": [
        "Criterion 1",
        "Typecheck passes"
      ],
      "priority": 1,
      "agent": "builder:task",
      "tech": "nextjs",
      "dependencies": [],
      "passes": false,
      "notes": ""
    }
  ]
}
```

### Fields

- **id**: Unique story identifier (US-001, US-002, ...)
- **title**: Short descriptive title
- **description**: User story format
- **acceptanceCriteria**: Verifiable criteria (must include "Typecheck passes")
- **priority**: Execution order (lower = earlier)
- **agent**: Which agent to use (smite-builder, smite-finalize, etc.)
- **tech**: Tech specialization if applicable (nextjs, rust, python)
- **dependencies**: Array of story IDs this story depends on
- **passes**: Set to true when complete
- **notes**: Learnings and issues

---

## 🎯 BEST PRACTICES

### 1. Story Size (CRITICAL)

Each story must fit in **ONE iteration** (one context window).

**Right-sized:**
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic

**Too big (split these):**
- "Build the entire dashboard"
- "Add authentication"
- "Refactor the API"

### 2. Dependency Management

**Explicit dependencies:**
```json
{
  "id": "US-004",
  "dependencies": ["US-001", "US-003"]
}
```

**Priority order (implicit deps):**
Stories execute in priority order. Earlier stories are implicit dependencies.

### 3. Agent Selection

Match agent to story type:

- **architect**: Design, strategy, initialization → `architect:task`
- **builder**: Implementation (Next.js, Rust, Python) → `builder:task`
- **finalize**: QA, documentation → `finalize:task`
- **explorer**: Codebase analysis → `explorer:task`
- **simplifier**: Code refactoring → `simplifier:task`

### 4. Verifiable Criteria

**Good:**
```json
"acceptanceCriteria": [
  "Add status column: 'pending' | 'in_progress' | 'done'",
  "Filter dropdown has options: All, Active, Completed",
  "Typecheck passes"
]
```

**Bad:**
```json
"acceptanceCriteria": [
  "Works correctly",  // ❌ Vague
  "Good UX",          // ❌ Subjective
  "Handles edge cases" // ❌ Not verifiable
]
```

---

## 📈 PERFORMANCE GAINS

### Example: 10 User Stories

**Sequential:**
```
10 stories × 3 min = 30 minutes
```

**Parallel (typical optimization):**
```
Batch 1: [US-001] → 3 min
Batch 2: [US-002,003,004] → 3 min (parallel)
Batch 3: [US-005,006] → 3 min (parallel)
Batch 4: [US-007,008,009] → 3 min (parallel)
Batch 5: [US-010] → 3 min

Total: 15 minutes (2x faster)
```

**Real-world gains:**
- Simple projects: 20-30% faster
- Medium projects: 40-50% faster
- Complex projects: 50-60% faster

---

## 🔧 LOOP SYSTEM

Ralph supports two execution modes:

### 1. Single-Pass Execution (`/ralph execute`)

Execute PRD once with parallel optimization, no looping.

### 2. Auto-Iterating Loop (`/ralph-loop`) ⚡ NEW

Uses hook-based system for automatic iteration until completion.

**How it works:**
1. Creates `.claude/ralph-loop.local.md` with loop configuration
2. Stop hook intercepts exit and re-feeds prompt if not complete
3. Iterates until `<promise>COMPLETE</promise>` detected or max iterations

**Documentation:** See `RALPH-LOOP.md` for complete guide on loop system.

---

## 📚 EXAMPLE PRDS

See `plugins/smite-ralph/examples/` for complete examples:

- `simple-todo-prd.json` - Basic CRUD app
- `complex-saas-prd.json` - Full SaaS platform
- `refactor-prd.json` - Code refactoring workflow

---

## ✅ CHECKLIST

**Before executing Ralph:**
- [ ] PRD exists with valid format
- [ ] Stories are small enough (fit in one iteration)
- [ ] Dependencies are correct
- [ ] Acceptance criteria are verifiable
- [ ] Agent assignments are appropriate

**After execution:**
- [ ] All stories pass
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Progress.txt complete
- [ ] Ready for merge

---

## 🔗 INTEGRATION

**Works with:**
- architect (design & strategy)
- builder (implementation)
- finalize (QA & docs)
- explorer (analysis)

**Automatic triggers:**
- Manual invocation
- CI/CD workflows
- Feature development

---

## 🎓 KEY CONCEPTS

### 1. Parallel Execution

Multiple agents run simultaneously via Task tool:

```typescript
// Launch 3 agents in ONE message
Task(subagent_type="builder:task", prompt="US-001...");
Task(subagent_type="builder:task", prompt="US-002...");
Task(subagent_type="builder:task", prompt="US-003...");

// Result: 🚀 Running 3 Agents in parallel...
```

### 2. Dependency Graph

Automatic analysis of story dependencies creates optimal execution batches.

### 3. State Persistence

Progress tracked in:
- `.smite/prd.json` - Story status
- `.smite/progress.txt` - Learnings
- Git history - Code changes

### 4. Iterative Improvement

Same prompt fed back until completion, with context from previous iterations.

---

**🔄 SMITE RALPH v3.0**
_"Multi-Agent Parallel Orchestration - 2-3x Faster Than Sequential"_
