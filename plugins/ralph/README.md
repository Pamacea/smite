# 🔥 SMITE Ralph - Multi-Agent Parallel Orchestrator

The revolution in autonomous coding: **2-3x faster** than traditional Ralph through intelligent parallel execution.

## 🚀 What is Ralph?

Ralph is an autonomous AI agent orchestrator that coordinates multiple agents to complete complex tasks. **SMITE Ralph** enhances this with:

- ⚡ **Parallel Execution**: Multiple agents running simultaneously
- 🧠 **Smart Dependency Analysis**: Automatic batching and optimization
- 🎯 **Multi-Agent Coordination**: 5 specialized agents working together
- 📊 **Progress Tracking**: Real-time state management and logging
- 🔄 **Auto-Iteration**: Loop until task completion (NEW!)

## 📦 Installation

```bash
# From SMITE marketplace
/plugin install ralph@smite
```

## 🎯 Quick Start

### Mode 1: Auto-Iterating Loop ⚡ RECOMMENDED

```bash
# Auto-generate PRD and loop until complete
/ralph-loop "Build a todo app with authentication and real-time updates"

# With custom options
/ralph-loop "Create REST API" --max-iterations 100 --completion-promise "API_DEPLOYED"
```

**How it works:**
1. Generates detailed PRD from your prompt
2. Creates `.claude/ralph-loop.local.md` with loop configuration
3. You execute stories systematically using agents
4. Continues until `<promise>COMPLETE</promise>` or max iterations

**Best for:** Complex features, multi-step tasks, when you want autonomous execution

**Documentation:** See `RALPH-LOOP.md` for complete guide

### Mode 2: Single-Pass Execution

```bash
# Auto-generate PRD and execute once
/ralph "Build a simple component"

# Use existing PRD
/ralph execute .smite/prd.json
```

**Best for:** Quick tasks, when you want full control, single-pass execution

## 📊 Execution Flow

```
Input Prompt
    ↓
Generate PRD
    ↓
Analyze Dependencies
    ↓
┌─────────────────────────┐
│  Batch 1: US-001        │ ← Sequential (no dependencies)
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Batch 2: US-002        │
│  Batch 2: US-003  ⚡⚡⚡ │ ← PARALLEL! (both depend on US-001)
│  Batch 2: US-004  ⚡⚡⚡ │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│  Batch 3: US-005        │
│  Batch 3: US-006  ⚡⚡⚡ │ ← PARALLEL!
└─────────────────────────┘
    ↓
Finalize: QA + Docs
    ↓
✅ COMPLETE
```

## 🎨 PRD Format

```json
{
  "project": "TodoApp",
  "branchName": "ralph/todo-app",
  "description": "Task management application",
  "userStories": [
    {
      "id": "US-001",
      "title": "Setup Next.js project",
      "description": "Initialize Next.js with TypeScript",
      "acceptanceCriteria": [
        "Next.js installed",
        "TypeScript configured",
        "Build working"
      ],
      "priority": 10,
      "agent": "architect:task",
      "dependencies": [],
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Build UI components",
      "description": "Create task list and form",
      "acceptanceCriteria": [
        "TaskList component",
        "AddTaskForm component",
        "Responsive design"
      ],
      "priority": 9,
      "agent": "builder:task",
      "dependencies": ["US-001"],
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-003",
      "title": "Run QA and docs",
      "description": "Test and document everything",
      "acceptanceCriteria": [
        "All tests passing",
        "No linting errors",
        "Documentation complete"
      ],
      "priority": 1,
      "agent": "finalize:task",
      "dependencies": ["US-001", "US-002"],
      "passes": false,
      "notes": ""
    }
  ]
}
```

## 🛠️ Commands

### `/ralph execute` - Single-Pass Execution

Execute a PRD once with parallel optimization (no looping).

```bash
# From PRD file
/ralph execute .smite/prd.json

# Auto-generate PRD from prompt
/ralph "Build a REST API"
```

### `/ralph-loop` - Auto-Iterating Execution ⚡ NEW

Execute with automatic looping using hook-based iteration (inspired by Ralph Wiggum).

```bash
# Basic usage
/ralph-loop "Build a todo app with authentication"

# With custom options
/ralph-loop "Create REST API" --max-iterations 100 --completion-promise "API_DEPLOYED"
```

**How it works:**
1. Generates PRD from your prompt
2. Creates `.claude/ralph-loop.local.md` with loop configuration
3. Executes user stories iteratively
4. Hook intercepts exit and re-feeds prompt if not complete
5. Stops when `<promise>COMPLETE</promise>` is detected

**Documentation:** See `RALPH-LOOP.md` for complete guide.

### Check Status

```bash
/ralph status

# Shows:
# - Session ID
# - Current status (running/completed/failed)
# - Progress (completed/failed stories)
# - Recent progress log
```

### Cancel Session

```bash
/ralph cancel

# Gracefully stops Ralph
# Saves progress for resumption
```

## 📁 File Structure

```
.smite/
├── prd.json              # Current PRD
├── ralph-state.json      # Execution state
└── progress.txt          # Activity log
```

## 🎯 Agents Used

| Agent      | Purpose                          | Used For               |
|------------|----------------------------------|------------------------|
| `explorer` | Codebase analysis               | Understanding patterns |
| `architect` | Design & strategy               | Project setup          |
| `builder`  | Implementation                  | Feature development    |
| `simplifier` | Code simplification            | Refactoring & cleanup  |
| `finalize` | QA + Documentation              | Testing & docs         |

### Using Simplifier in Ralph

The simplifier agent can be used for code refactoring tasks:

```json
{
  "id": "US-005",
  "title": "Simplify and refactor code",
  "description": "Apply code simplification to recent changes",
  "acceptanceCriteria": [
    "Code complexity reduced",
    "Functionality preserved",
    "All tests passing"
  ],
  "priority": 2,
  "agent": "simplifier:task",
  "dependencies": ["US-002", "US-003"],
  "passes": false,
  "notes": ""
}
```

The simplifier will automatically:
- Analyze code for complexity and inconsistencies
- Apply project-specific best practices
- Reduce nesting and redundancy
- Improve clarity and maintainability
- Preserve exact functionality

## ⚡ Performance

### Traditional Ralph (Sequential)
```
US-001 (3 min) → US-002 (3 min) → US-003 (3 min) → US-004 (3 min)
= 12 minutes
```

### SMITE Ralph (Parallel)
```
US-001 (3 min) → (US-002 + US-003) (3 min, parallel!) → US-004 (3 min)
= 9 minutes (25% faster!)

With 10+ stories: 2-3x speedup!
```

## 🔧 Advanced Usage

### Custom Agents

Override default agent per story:

```json
{
  "id": "US-002",
  "agent": "builder:task",  // Use builder instead of default
  ...
}
```

### Complex Dependencies

```json
{
  "id": "US-005",
  "dependencies": ["US-001", "US-002", "US-003"],
  ...
}
```

Ralph automatically:
- Validates all dependencies exist
- Detects circular dependencies
- Optimizes execution order
- Creates parallel batches when possible

## 🐛 Troubleshooting

### Ralph not starting

```bash
# Check .smite directory
ls -la .smite/

# Remove old state
rm -rf .smite/

# Start fresh
/ralph "your prompt"
```

### Stories failing

```bash
# Check progress log
cat .smite/progress.txt

# See which stories failed
cat .smite/ralph-state.json | grep failedStories
```

### Dependencies not resolving

```bash
# Validate PRD
node plugins/ralph/dist/prd-validator.js .smite/prd.json
```

## 📚 Examples

See `examples/` directory for complete PRDs:

- `simple-todo-prd.json` - Basic todo app
- `dashboard-with-auth.json` - SaaS dashboard
- `ecommerce.json` - E-commerce platform

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE for details.

---

**Built with ❤️ by the SMITE team**

*Zero-debt engineering with multi-agent parallel orchestration*
