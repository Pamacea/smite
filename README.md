# 🔥 SMITE v3.0

**Zero-debt engineering agents with multi-agent parallel orchestration (2-3x faster)**

---

## 🚀 Quick Start

### Installation (2 commands)

```bash
# Add the SMITE Marketplace
/plugin marketplace add Pamacea/smite

# Install Ralph (multi-agent orchestrator)
/plugin install ralph@smite

# Optional: Install statusline plugin
/plugin install statusline@smite

# Optional: Install essential commands (oneshot, explore, debug, commit, etc.)
/plugin install smite@smite
```

### One-Shot Execution

```bash
# Ralph auto-generates PRD and executes in parallel
/ralph "Build a todo app with authentication and real-time updates"

# That's it! Ralph handles:
# ✅ PRD generation
# ✅ Dependency analysis
# ✅ Parallel execution (2-3x faster)
# ✅ QA & documentation
# ✅ Auto-looping until completion
```

---

## 🎯 What's New in v3.0

### ⚡ Multi-Agent Parallel Execution

**Before (Sequential):**
```
Story 1 → Story 2 → Story 3 → Story 4
= 12 minutes
```

**After (Parallel):**
```
Story 1 → (Story 2 + Story 3) → Story 4
= 9 minutes (25% faster!)

With 10+ stories: 2-3x speedup!
```

### 📦 Simplified Architecture (13 → 6 agents)

| Old (13 agents) | New (6 agents) | Description |
|-----------------|----------------|-------------|
| smite-initializer, smite-strategist, smite-aura, smite-brainstorm | **architect** | Design, strategy, init, creative thinking |
| smite-constructor, smite-router | **builder** | Implementation with auto-detection |
| smite-gatekeeper, smite-surgeon, linter-sentinel, smite-handover, doc-maintainer | **finalize** | QA + documentation unified |
| smite-explorer | **explorer** | Codebase analysis |
| — | **simplifier** | Code simplification & refactoring (NEW!) |
| — | **ralph** | Multi-agent orchestrator (NEW!) |

**Result:** 62% reduction in complexity, 2-3x faster execution!

---

## 📋 Agent Convention

SMITE agents follow a simple, intuitive naming convention:

```bash
# Direct usage (interactive, sequential)
/explorer
/builder
/architect
/finalize

# Ralph PRD usage (orchestrated, parallel)
explorer:task
builder:task
architect:task
finalize:task
```

**When to use:**
- `/agent-name` → Interactive development, one-off tasks
- `agent:task` → Ralph PRD orchestration, parallel execution

**See:** [AGENTS.md](AGENTS.md) for complete agent reference.

---

## 🤖 Core Agents

### 1. **ralph** - Multi-Agent Orchestrator ⭐

The revolution: autonomous coding with parallel execution.

```bash
# Quick start
/ralph "Build a REST API with Node.js, Express, and PostgreSQL"

# From PRD file
/ralph .smite/prd.json

# With custom iterations
/ralph "your task" --iterations 100
```

**Features:**
- 🧠 Auto-generates PRD from prompt
- 📊 Analyzes dependencies
- ⚡ Executes in parallel batches
- 🔄 Auto-loops until completion
- 📝 QA & documentation included

**See:** [docs/RALPH_GUIDE.md](docs/RALPH_GUIDE.md)

### 2. **explorer** - Codebase Analysis

```bash
/explorer --task=map-architecture     # Map codebase structure
/explorer --task=find-patterns        # Find design patterns
/explorer --task=analyze-dependencies # Dependency analysis
```

### 3. **architect** - Design & Strategy

```bash
/architect --mode=init "Setup Next.js project"      # Initialize
/architect --mode=strategy "Product roadmap"        # Strategy
/architect --mode=design "Design system spec"       # Design
/architect --mode=brainstorm "Solve X problem"      # Brainstorm
```

### 4. **builder** - Implementation

```bash
# Auto-detects tech stack
/builder "Implement user authentication"

# Or specify explicitly
/builder --tech=nextjs "Build dashboard"
/builder --tech=rust "Create API endpoint"
/builder --tech=python "Add data processing"
```

### 5. **finalize** - QA & Documentation

```bash
# Full QA + Docs
/finalize

# QA only
/finalize --mode=qa --type=test
/finalize --mode=qa --type=lint
/finalize --mode=qa --type=performance

# Docs only
/finalize --mode=docs --type=readme
/finalize --mode=docs --type=api
```

### 6. **simplifier** - Code Simplification ⭐

```bash
# Simplify recent changes
/simplifier

# Simplify specific file
/simplifier --scope=file src/components/Button.tsx

# Simplify directory
/simplifier --scope=directory src/components

# Simplify entire project
/simplifier --scope=all
```

**Features:**
- 🧹 Automatic code refactoring
- 📊 Complexity reduction
- ✅ Functionality preservation
- 🎯 Project standards integration
- 🚫 Anti-pattern detection

**See:** [plugins/simplifier/README.md](plugins/simplifier/README.md)

### 7. **statusline** - Auto-Configuring Statusline 🎨

```bash
# Install (auto-configures itself!)
/plugin install statusline@smite

# Manual configuration if needed
/statusline install
/statusline config
/statusline reset
```

**Features:**
- 🌿 Git branch detection (300ms timeout, no hangs)
- 💰 Session cost tracking
- ⏱️ Session duration display
- 🧩 Context usage with visual progress bar
- 🚀 Zero-configuration setup
- ✅ Cross-platform (Windows, macOS, Linux)
- 🔧 Reliable Node.js implementation (no Bun dependency)

**Display Example:**
```
main • $0.15 • 3m0s • [████████░░] 11%
```

**How it works:**
- Installs `~/.claude/statusline.js` script
- Uses synchronous stdin reading (no async hangs)
- 300ms timeout on all git operations
- Falls back gracefully on errors

**See:** [plugins/statusline/README.md](plugins/statusline/README.md)

### 8. **smite** - Essential Development Commands ⚡

```bash
# Install all essential commands
/plugin install smite@smite

# After installation, commands are available:
/oneshot "Add user login"
/explore "How does auth work?"
/debug "Fix memory leak"
/commit
```

**Installed Commands:**
- 🚀 `/oneshot` - Ultra-fast feature implementation (Explore → Code → Test)
- 🔍 `/explore` - Deep codebase exploration with parallel agents
- 🐛 `/debug` - Systematic bug debugging with root cause analysis
- 📝 `/commit` - Quick commit & push with conventional format
- 🧠 `/claude-memory` - CLAUDE.md management and best practices
- 📋 `/epct` - Systematic implementation (Explore → Plan → Code → Test)
- 🎯 `/apex` - Quality-focused workflow (Analyze → Plan → Execute → eXamine)
- 🏗️ `/explain-architecture` - Architecture analysis and pattern documentation
- 🧹 `/cleanup-context` - Memory bank optimization and token reduction
- 🔀 `/create-pull-request` - PR creation with auto-generated descriptions
- 📋 `/run-tasks` - GitHub issue execution with full EPCT workflow

**Features:**
- ⚡ Proven workflows for rapid development
- 🎯 Clear purpose and use cases for each command
- 📊 Structured methodologies (oneshot, epct, apex)
- 🔧 Seamless integration with SMITE agents
- 📚 Comprehensive documentation included

**Workflow Guide:**
```
Quick feature     → /oneshot
Complex feature   → /epct
Production code   → /apex
Understand code   → /explore
Fix bug           → /debug
Commit changes    → /commit
```

**See:** [plugins/smite/README.md](plugins/smite/README.md)

---

## 📊 Ralph PRD Format

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
      "title": "Build task list UI",
      "description": "Create task list component",
      "acceptanceCriteria": [
        "TaskList component",
        "Display tasks",
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
      "title": "Add task form",
      "description": "Create add task form",
      "acceptanceCriteria": [
        "Form component",
        "Validation",
        "Adds to list"
      ],
      "priority": 9,
      "agent": "builder:task",
      "dependencies": ["US-001"],
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-004",
      "title": "QA & Documentation",
      "description": "Test and document",
      "acceptanceCriteria": [
        "All tests passing",
        "No lint errors",
        "Docs complete"
      ],
      "priority": 1,
      "agent": "finalize:task",
      "dependencies": ["US-002", "US-003"],
      "passes": false,
      "notes": ""
    }
  ]
}
```

**Execution Flow:**
```
Batch 1: [US-001] (sequential)
    ↓
Batch 2: [US-002, US-003] ← PARALLEL!
    ↓
Batch 3: [US-004] (sequential)
```

---

## 🛠️ Scripts (Cross-Platform)

### Windows (PowerShell)

```powershell
.\ralph-loop.ps1 -Prompt "Build a todo app"
.\ralph-status.ps1
.\ralph-cancel.ps1
```

### macOS/Linux (Bash)

```bash
./ralph-loop.sh --prompt "Build a todo app"
./ralph-status.sh
./ralph-cancel.sh
```

### Universal (Node.js)

```bash
node plugins/ralph/dist/index.js --prompt "Build a todo app"
```

---

## 📁 File Structure

```
smite/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace config
├── plugins/
│   ├── explorer/                     # Codebase analysis
│   ├── architect/                    # Design + strategy + init
│   ├── builder/                      # Implementation
│   ├── simplifier/                   # Code simplification
│   ├── finalize/                     # QA + docs
│   ├── statusline/                   # Auto-configuring statusline ⭐
│   └── ralph/                        # Multi-agent orchestrator
│       ├── src/                      # TypeScript source
│       ├── dist/                     # Compiled JavaScript
│       ├── scripts/                  # Shell scripts
│       ├── hooks/                    # Stop hooks
│       └── examples/                 # PRD examples
├── .smite/                           # Ralph state
│   ├── prd.json                      # Current PRD
│   ├── ralph-state.json              # Execution state
│   ├── progress.txt                  # Activity log
│   └── original-prompt.txt           # For looping
└── docs/
    ├── RALPH_GUIDE.md                # Complete Ralph guide
    ├── SMITE_COMPLETE_GUIDE.md       # Legacy guide
    └── legacy/                       # Old planning docs
```

---

## 🎯 Usage Examples

### Example 1: Todo App (One-Shot)

```bash
/ralph "Build a simple todo app with create, complete, and delete tasks"
```

Ralph auto-generates:
1. ✅ PRD with 4 user stories
2. ✅ Dependency graph
3. ✅ Optimized batches
4. ✅ Parallel execution
5. ✅ QA + docs

### Example 2: SaaS Dashboard

```bash
/ralph "Build a SaaS dashboard with authentication, analytics, and user profiles"
```

Optimized batches:
```
Batch 1: [US-001] Setup project
Batch 2: [US-002, US-003, US-004] Auth + DB + UI  ← PARALLEL!
Batch 3: [US-005, US-006] Dashboard + Analytics  ← PARALLEL!
Batch 4: [US-007] Finalize
```

### Example 3: Custom PRD

```bash
# Create PRD manually
cat > .smite/prd.json << EOF
{
  "project": "MyAPI",
  ...
}
EOF

# Execute
/ralph .smite/prd.json
```

---

## 🔄 Updating

```bash
# Update marketplace
/plugin marketplace update smite

# Update all plugins
/plugin update --all
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[AGENTS.md](AGENTS.md)** | Complete agent reference & convention guide |
| **[RALPH_GUIDE.md](docs/RALPH_GUIDE.md)** | Complete Ralph usage guide |
| **[SMITE_COMPLETE_GUIDE.md](docs/SMITE_COMPLETE_GUIDE.md)** | Legacy SMITE guide |
| **[plugins/statusline/README.md](plugins/statusline/README.md)** | Statusline plugin guide |
| **plugins/ralph/README.md** | Ralph technical documentation |

---

## 🎯 Categories

### Development
- **explorer**: Codebase analysis & pattern discovery
- **architect**: Design, strategy, initialization
- **builder**: Full-stack implementation

### Quality
- **simplifier**: Code simplification & refactoring
- **finalize**: QA, testing, documentation

### Orchestration
- **ralph**: Multi-agent parallel execution (2-3x speedup)

### Tools
- **statusline**: Cross-platform statusline with git, cost, and context tracking ⭐

---

## 🤝 Contributing

To add a new plugin:

1. Create plugin directory: `plugins/your-plugin/`
2. Add `.claude-plugin/plugin.json`
3. Add skill in `skills/your-agent/SKILL.md`
4. Update `.claude-plugin/marketplace.json`
5. Submit pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built by **Pamacea** for zero-debt engineering with Claude Code

Inspired by:
- [Anthropics Ralph Wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [Snarktank Ralph](https://github.com/snarktank/ralph)

---

**SMITE v3.0**

_7 core plugins • Multi-agent parallel orchestration • 2-3x faster execution • Zero-debt engineering_

📖 **[RALPH_GUIDE.md](docs/RALPH_GUIDE.md)** for complete Ralph documentation and examples.
