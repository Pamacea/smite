# 🔥 SMITE Ralph - Multi-Agent Parallel Orchestrator

The revolution in autonomous coding: **2-3x faster** than traditional Ralph through intelligent parallel execution.

## 🚀 What is Ralph?

Ralph is an autonomous AI agent loop that iterates until task completion. **SMITE Ralph** enhances this with:

- ⚡ **Parallel Execution**: Multiple agents running simultaneously
- 🧠 **Smart Dependency Analysis**: Automatic batching and optimization
- 🎯 **Multi-Agent Coordination**: 5 specialized agents working together
- 📊 **Progress Tracking**: Real-time state management and logging

## 📦 Installation

```bash
# From SMITE marketplace
/plugin install ralph@smite
```

## 🎯 Quick Start

### Option 1: Natural Language

```bash
# Ralph auto-generates PRD and executes
/ralph "Build a todo app with authentication and real-time updates"

# Ralph will:
# 1. Generate PRD with user stories
# 2. Analyze dependencies
# 3. Execute in parallel batches
# 4. Run QA and documentation
# 5. Done in 50% of the time!
```

### Option 2: From PRD File

```bash
# Use existing PRD
/ralph .smite/prd.json

# Or specify custom path
/ralph examples/simple-todo-prd.json
```

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
      "agent": "architect",
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
      "agent": "builder",
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
      "agent": "finalize",
      "dependencies": ["US-001", "US-002"],
      "passes": false,
      "notes": ""
    }
  ]
}
```

## 🛠️ Commands

### Start Ralph

```bash
# From prompt
ralph-loop --prompt "Build a REST API"

# From PRD file
ralph-loop --file .smite/prd.json

# With custom max iterations
ralph-loop --prompt "..." --iterations 100
```

### Check Status

```bash
ralph-status

# Shows:
# - Session ID
# - Current status (running/completed/failed)
# - Progress (completed/failed stories)
# - Recent progress log
```

### Cancel Session

```bash
ralph-cancel

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
  "agent": "simplifier",
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
  "agent": "builder",  // Use builder instead of default
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
