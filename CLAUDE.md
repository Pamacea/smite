# 🤖 SMITE Agents Convention

Standardized naming and usage conventions for SMITE agents.

## 📋 Table of Contents

- [Installation](#installation)
- [Convention Overview](#convention-overview)
- [Available Agents](#available-agents)
- [Usage Comparison](#usage-comparison)
- [Typical Workflows](#typical-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Agent Details](#agent-details)

---

## 🚀 Installation

### Quick Start (2 commands)

```bash
# Add the SMITE Marketplace
/plugin marketplace add Pamacea/smite

# Install Ralph (multi-agent orchestrator)
/plugin install ralph@smite

# Optional: Install individual agents
/plugin install explorer@smite
/plugin install builder@smite
/plugin install architect@smite
/plugin install finalize@smite
/plugin install simplifier@smite

# Recommended: Install Toolkit (code analysis & optimization)
/plugin install toolkit@smite
```

### Verify Installation

```bash
# Check installed plugins
/plugin list

# Test agent
/explorer --help
```

### Update Plugins

```bash
# Update all SMITE plugins
/plugin update --all

# Update specific plugin
/plugin update ralph@smite
```

---

## 📋 Convention Overview

SMITE agents follow a simple, intuitive naming convention:

```bash
# Direct usage (interactive, sequential)
/agent-name

# Ralph PRD usage (orchestrated, parallel)
agent-name:task
```

### Two Modes of Operation

1. **Interactive Mode** (`/agent-name`)
   - Direct conversational interaction
   - Best for: One-off tasks, exploratory work, quick fixes
   - Example: `/explorer --task=find-function --target="getUserData"`

2. **Orchestrated Mode** (`agent-name:task`)
   - Used by Ralph for PRD-driven execution
   - Best for: Complex workflows, parallel execution, repetitive tasks
   - Example: In PRD.json: `"agent": "builder:task"`

## 🎯 Available Agents

### 1. Explorer - `/explorer`

**Role:** Codebase exploration, dependency mapping, and pattern discovery

#### Tasks Available
- `find-function` - Locate specific functions and their usage across the codebase
- `find-component` - Find React/Vue/Angular components and their relationships
- `find-bug` - Investigate potential bugs or error patterns
- `find-deps` - Map dependencies and imports between modules
- `map-architecture` - Create a visual map of the codebase architecture
- `analyze-impacts` - Analyze impact of changes (blast radius)

#### Direct Usage Examples

```bash
# Find a specific function
/explorer --task=find-function --target="getUserData"

# Find components in a module
/explorer --task=find-component --scope=module

# Map entire architecture
/explorer --task=map-architecture

# Investigate a bug
/explorer --task=find-bug --target="memory leak"

# Analyze change impact
/explorer --task=analyze-impacts --target="API changes"
```

#### Ralph PRD Usage
```json
{
  "id": "US-001",
  "title": "Explore codebase structure",
  "agent": "explorer:task",
  "tech": "explorer",
  "dependencies": [],
  "passes": false
}
```

#### Output Files
- `docs/explorer-findings.md` - Exploration results
- `docs/explorer-dependencies.md` - Dependency mapping
- `docs/explorer-architecture.md` - Architecture overview

#### Use when
- Understanding an existing codebase
- Finding where a function is used
- Mapping module dependencies
- Investigating bug patterns
- Planning refactoring (impact analysis)

---

### 2. Builder - `/builder`

**Role:** Implementation with technology specialization and design mode

#### Tech Specialization
- `nextjs` - React Server Components, Prisma, PostgreSQL, Server Actions
- `rust` - Ownership, borrowing, async/await, zero-copy patterns
- `python` - Type hints, FastAPI, SQLAlchemy 2.0, asyncio
- `go` - Goroutines, interfaces, standard library

#### Direct Usage Examples

```bash
# Auto-detect tech stack (recommended)
/builder "Implement user authentication with JWT"

# Specify tech stack explicitly
/builder --tech=nextjs --feature="user authentication"
/builder --tech=rust --component="API handler"
/builder --tech=python --feature="data processing pipeline"

# Design mode: Convert Figma/SVG to code
/builder --design --source="figma:file-id"
/builder --design --component="Button" --source="design.svg"
```

#### Ralph PRD Usage
```json
{
  "id": "US-002",
  "title": "Build authentication system",
  "agent": "builder:task",
  "tech": "nextjs",
  "dependencies": ["US-001"],
  "passes": false
}
```

#### Output
- Production code with tests
- Component documentation
- Type definitions (TypeScript)

#### Use when
- Building new features
- Implementing components
- Writing API endpoints
- Converting designs to code
- Following architect specifications

---

### 3. Architect - `/architect`

**Role:** Unified design, strategy, initialization, and creative thinking

#### Modes Available
- `init` - Initialize new projects with tech stack and tooling
- `strategy` - Develop business and market strategy
- `design` - Create comprehensive design system and UI specifications
- `brainstorm` - Facilitate creative problem-solving and ideation

#### Direct Usage Examples

```bash
# Initialize new project
/architect --mode=init "Build a real-time chat application with WebSocket support"

# Define business strategy
/architect --mode=strategy "Analyze project management market, define pricing tiers"

# Create design system
/architect --mode=design "Create a modern design system for a mobile fitness app"

# Brainstorm solutions
/architect --mode=brainstorm "Innovative features to increase user engagement"
```

#### Ralph PRD Usage
```json
{
  "id": "US-001",
  "title": "Initialize project",
  "agent": "architect:task",
  "tech": "architect",
  "dependencies": [],
  "passes": false
}
```

#### Output Files
- `docs/INIT_PLAN.md` - Initialization plan
- `docs/TECH_STACK.md` - Technology decisions
- `docs/STRATEGY_ANALYSIS.md` - Market analysis
- `docs/BUSINESS_MODEL.md` - Revenue model
- `docs/PRICING_STRATEGY.md` - Pricing tiers
- `docs/DESIGN_SYSTEM.md` - Complete design specs
- `docs/DESIGN_TOKENS.json` - Design tokens
- `docs/BRAINSTORM_SESSION.md` - Ideas and solutions

#### Use when
- Starting a new project (mode=init)
- Planning business strategy (mode=strategy)
- Creating design system (mode=design)
- Solving complex problems (mode=brainstorm)
- Defining specifications before building

#### Workflow Example
```bash
# Step 1: Initialize
/architect --mode=init "Build a project management SaaS"

# Step 2: Strategy
/architect --mode=strategy "Define pricing and revenue model"

# Step 3: Design
/architect --mode=design "Create professional enterprise design system"

# Step 4: Brainstorm
/architect --mode=brainstorm "Innovative collaboration features"
```

---

### 4. Finalize - `/finalize`

**Role:** Unified quality assurance, code review, refactoring, linting & documentation

#### Modes Available
- `full` (default) - Comprehensive QA + documentation
- `qa` - Quality assurance only
- `docs` - Documentation updates only

#### QA Types
- `test` - Generate & run tests (unit, integration, E2E)
- `review` - Code review & refactoring
- `lint` - Fix linting issues (ESLint, Prettier, TypeScript)
- `perf` - Performance audit
- `security` - Security audit
- `coverage` - Test coverage analysis

#### Docs Types
- `readme` - Update README.md
- `agents` - Update AGENTS.md with patterns
- `api` - Generate API documentation
- `sync` - Synchronize all documentation

#### Direct Usage Examples

```bash
# Full finalize (QA + Docs) - DEFAULT
/finalize

# QA only
/finalize --mode=qa

# Specific QA type
/finalize --mode=qa --type=test       # Generate & run tests
/finalize --mode=qa --type=review    # Code review & refactor
/finalize --mode=qa --type=lint      # Fix linting issues
/finalize --mode=qa --type=perf      # Performance audit
/finalize --mode=qa --type=security  # Security audit
/finalize --mode=qa --type=coverage  # Coverage analysis

# Docs only
/finalize --mode=docs

# Specific doc type
/finalize --mode=docs --type=readme  # Update README
/finalize --mode=docs --type=agents  # Update AGENTS.md
/finalize --mode=docs --type=api     # Generate API docs
/finalize --mode=docs --type=sync    # Sync all docs

# Automatic (by Ralph)
/finalize --auto --artifact="src/components/Button.tsx"
```

#### Ralph PRD Usage
```json
{
  "id": "US-004",
  "title": "QA & Documentation",
  "agent": "finalize:task",
  "tech": "finalize",
  "dependencies": ["US-002", "US-003"],
  "passes": false
}
```

#### What It Does (Full Mode)
1. **Quality Assurance**
   - Run all tests (unit, integration, E2E)
   - Code review for best practices
   - Fix all linting issues
   - Performance audit
   - Security scan

2. **Documentation**
   - Update README.md
   - Update AGENTS.md with patterns
   - Generate JSDoc/API docs
   - Create knowledge base

3. **Commit**
   - Create commit: `chore: finalize - QA & documentation updates`
   - Ready for PR/merge

#### Use when
- After feature implementation
- Before git commits
- Before PR creation
- Need comprehensive QA
- Updating documentation
- Ensuring code quality

---

### 5. Simplifier - `/simplifier`

**Role:** Simplify and refactor code for clarity and maintainability

#### What It Does
- Reduces complexity and nesting
- Eliminates redundant code
- Improves readability
- Consolidates related logic
- Applies project standards
- Follows CLAUDE.md best practices

#### Flags Available
- `--scope=file` - Simplify specific file
- `--scope=directory` - Simplify entire directory
- `--scope=all` - Simplify entire codebase
- `--focus=recent` - Focus on recently modified code (default)

#### Direct Usage Examples

```bash
# Simplify recent changes (default)
/simplifier

# Simplify specific file
/simplifier --scope=file src/components/ComplexComponent.tsx

# Simplify entire directory
/simplifier --scope=directory src/components

# Simplify entire project
/simplifier --scope=all

# Focus on specific patterns
/simplifier --focus=recent --target="authentication logic"
```

#### Ralph PRD Usage
```json
{
  "id": "US-005",
  "title": "Simplify authentication code",
  "agent": "simplifier:task",
  "tech": "simplifier",
  "dependencies": ["US-002"],
  "passes": false
}
```

#### How It Works
1. Analyzes code for complexity and inconsistencies
2. Applies project-specific best practices
3. Preserves exact functionality
4. Improves readability and maintainability
5. Avoids over-simplification

#### Use when
- Code is too complex
- Need refactoring
- Reducing technical debt
- After feature implementation
- Improving code maintainability
- Before major releases

---

### 6. Ralph - `/ralph`

**Role:** Multi-agent orchestration with parallel execution (2-3x speedup)

#### What Ralph Does
- Auto-generates PRD from natural language prompt
- Analyzes dependencies between user stories
- Creates parallel execution batches
- Executes agents simultaneously
- Tracks progress and commits changes
- Auto-loops until all stories complete

#### Direct Usage Examples

```bash
# Auto-generate PRD and execute (recommended)
/ralph "Build a todo app with authentication, filters, and export to CSV"

# Execute existing PRD file
/ralph execute .claude/.smite/prd.json

# Show workflow progress
/ralph status

# Cancel running workflow
/ralph cancel

# Execute with custom iterations
/ralph "Build a REST API" --iterations 100
```

#### Ralph PRD Format
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
      "agent": "architect:task",
      "tech": "architect",
      "dependencies": [],
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Build task list UI",
      "description": "Create task list component",
      "acceptanceCriteria": [
        "TaskList component",
        "Display tasks",
        "Responsive design"
      ],
      "priority": 9,
      "agent": "builder:task",
      "tech": "nextjs",
      "dependencies": ["US-001"],
      "passes": false,
      "notes": ""
    }
  ]
}
```

#### Parallel Execution Example

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

#### Performance
- Simple projects: 20-30% faster
- Medium projects: 40-50% faster
- Complex projects: 50-60% faster

#### Use when
- Executing full PRD
- Complex multi-agent workflows (4+ agents)
- Need state persistence
- Repetitive workflows
- Complex dependency management
- Parallel execution needed

---

## 📊 Usage Comparison

| Scenario | Recommended Approach | Why |
|----------|---------------------|-----|
| Quick task (1-2 agents) | `/agent-name` | Direct, faster, conversational |
| Medium workflow (3 agents) | Native Task tool | Manual orchestration is straightforward |
| Complex workflow (4+ agents) | `/ralph` | State tracking, parallel execution |
| Interactive development | `/agent-name` | Real-time feedback and iteration |
| Automated execution | `agent-name:task` | Ralph PRD orchestration |
| Session with interruptions | `/ralph` | Persistent state enables resumption |

---

## 🔄 Typical Workflows

### Complete Project Flow (Interactive)

```bash
# 1. Initialize project
/architect --mode=init "Build a task management app"

# 2. Define strategy
/architect --mode=strategy "Productivity tools market"

# 3. Create design system
/architect --mode=design "Modern minimalist design"

# 4. Explore existing code (if applicable)
/explorer --task=map-architecture

# 5. Implement features
/builder --tech=nextjs "Implement task CRUD operations"

# 6. Simplify code
/simplifier --scope=directory src/features/tasks

# 7. Finalize
/finalize
```

### Ralph PRD Flow (Automated)

```json
{
  "project": "TaskManager",
  "branchName": "ralph/task-manager",
  "description": "Productivity task management application",
  "userStories": [
    {
      "id": "US-001",
      "title": "Initialize project",
      "description": "Setup Next.js with TypeScript",
      "acceptanceCriteria": ["Next.js 14 installed", "TypeScript configured"],
      "priority": 10,
      "agent": "architect:task",
      "dependencies": [],
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Build task list UI",
      "description": "Create task list component",
      "acceptanceCriteria": ["TaskList component", "Responsive design"],
      "priority": 9,
      "agent": "builder:task",
      "dependencies": ["US-001"],
      "passes": false
    },
    {
      "id": "US-003",
      "title": "Add task form",
      "description": "Create add task form",
      "acceptanceCriteria": ["Form component", "Validation"],
      "priority": 9,
      "agent": "builder:task",
      "dependencies": ["US-001"],
      "passes": false
    },
    {
      "id": "US-004",
      "title": "Simplify code",
      "description": "Refactor and simplify implementation",
      "acceptanceCriteria": ["Reduced complexity", "Clean code"],
      "priority": 5,
      "agent": "simplifier:task",
      "dependencies": ["US-002", "US-003"],
      "passes": false
    },
    {
      "id": "US-005",
      "title": "QA & Docs",
      "description": "Test and document",
      "acceptanceCriteria": ["Tests passing", "Docs complete"],
      "priority": 1,
      "agent": "finalize:task",
      "dependencies": ["US-004"],
      "passes": false
    }
  ]
}
```

Execute with:
```bash
/ralph execute .claude/.smite/prd.json
```

**Execution Flow:**
```
Batch 1: [US-001] Initialize (sequential)
    ↓
Batch 2: [US-002, US-003] Task List + Task Form (parallel) ⚡
    ↓
Batch 3: [US-004] Simplify (sequential)
    ↓
Batch 4: [US-005] Finalize (sequential)
```

---

## 🎓 Best Practices

### 1. Agent Selection
- **Start with Architect** - Define before building
- **Use Explorer** - Understand existing codebase first
- **Build with Builder** - Implement following architect specs
- **Simplify regularly** - Reduce complexity incrementally
- **Finalize before commits** - Ensure quality and documentation
- **Orchestrate with Ralph** - For complex multi-story workflows

### 2. Workflow Optimization
- **Small Stories** - Each user story should fit in one iteration
- **Explicit Dependencies** - Use `dependencies` array in PRD
- **Verifiable Criteria** - Include "Typecheck passes" in acceptance criteria
- **Parallel Execution** - Structure PRD to maximize parallel batches

### 3. Code Quality
- **Zero-Debt Engineering** - Never accumulate technical debt
- **Type-Safe Everywhere** - Proper types, no `any`
- **Follow Patterns** - Match existing codebase conventions
- **Test Coverage** - Aim for 90%+ coverage
- **Documentation** - Keep docs in sync with code

### 4. Common Patterns

#### Pattern 1: New Feature
```bash
/architect --mode=design "Design user profile feature"
/builder "Implement user profile with avatar upload"
/simplifier --scope=directory src/features/profile
/finalize
```

#### Pattern 2: Bug Investigation
```bash
/explorer --task=find-bug --target="memory leak in auth"
/debug "Fix authentication memory leak"  # if using smite commands
/finalize --mode=qa --type=test
```

#### Pattern 3: Code Refactoring
```bash
/explorer --task=analyze-impacts --target="API refactoring"
/builder "Refactor API to use new endpoints"
/simplifier --scope=all
/finalize --mode=qa --type=review
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Issue: Agent Not Found
**Error:** `Command not found: /agent-name`

**Solutions:**
```bash
# Check if plugin is installed
/plugin list

# Install the missing agent
/plugin install agent-name@smite

# Update marketplace
/plugin marketplace update smite
```

#### Issue: Ralph Not Executing
**Error:** PRD execution stalls or loops infinitely

**Solutions:**
```bash
# Check Ralph status
/ralph status

# Cancel stuck workflow
/ralph cancel

# Verify PRD format
cat .claude/.smite/prd.json

# Check for circular dependencies
# Ensure no story depends on itself or creates a loop
```

#### Issue: Builder Type Errors
**Error:** TypeScript errors after builder implementation

**Solutions:**
```bash
# Run finalize to fix linting
/finalize --mode=qa --type=lint

# Check CLAUDE.md for type safety rules
# Ensure proper TypeScript types

# Re-run builder with explicit tech stack
/builder --tech=nextjs "Re-implement with types"
```

#### Issue: Tests Failing
**Error:** Test failures after finalize

**Solutions:**
```bash
# Check specific test type
/finalize --mode=qa --type=test

# Review test coverage
/finalize --mode=qa --type=coverage

# Update tests manually if needed
# Then run finalize again
/finalize
```

#### Issue: Documentation Out of Sync
**Error:** AGENTS.md or README not updated

**Solutions:**
```bash
# Sync all documentation
/finalize --mode=docs --type=sync

# Update specific doc
/finalize --mode=docs --type=readme
/finalize --mode=docs --type=agents
```

#### Issue: Simplifier Breaking Code
**Error:** Functionality changed after simplification

**Solutions:**
```bash
# Use git to revert changes
git checkout -- .

# Run simplifier with smaller scope
/simplifier --scope=file specific-file.ts

# Review changes before committing
git diff

# Test thoroughly before accepting changes
npm test
```

#### Issue: Ralph State Corruption
**Error:** Ralph state file corrupted or invalid

**Solutions:**
```bash
# Check state file
cat .claude/.smite/ralph-state.json

# Remove corrupted state
rm .claude/.smite/ralph-state.json

# Restart Ralph workflow
/ralph execute .claude/.smite/prd.json
```

### Getting Help

```bash
# Check agent documentation
/explorer --help
/builder --help
/architect --help
/finalize --help
/simplifier --help
/ralph --help

# See individual plugin docs
ls plugins/*/commands/*.md
```

### Debug Mode

```bash
# Enable verbose output
/ralph "Build feature" --verbose

# Check logs
cat .claude/.smite/progress.txt
cat .claude/.smite/original-prompt.txt
```

---

## 📚 Agent Details

For complete technical documentation, see individual plugin documentation:

- **Explorer:** `plugins/explorer/commands/explorer.md`
- **Builder:** `plugins/builder/commands/builder.md`
- **Architect:** `plugins/architect/commands/architect.md`
- **Finalize:** `plugins/finalize/commands/finalize.md`
- **Simplifier:** `plugins/simplifier/commands/simplifier.md`
- **Ralph:** `plugins/ralph/README.md`

### Additional Documentation

- **Ralph Guide:** `docs/RALPH_GUIDE.md` - Complete Ralph usage guide
- **Complete Guide:** `docs/SMITE_COMPLETE_GUIDE.md` - Legacy SMITE guide
- **Statusline:** `plugins/statusline/README.md` - Statusline configuration

---

**Version:** 2.0.0
**Updated:** 2025-01-14
**SMITE Version:** 3.0
