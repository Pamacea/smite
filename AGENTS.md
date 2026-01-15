# 🤖 SMITE Agents Convention

Standardized naming and usage conventions for SMITE agents.

## 📋 Convention Overview

SMITE agents follow a simple, intuitive naming convention:

```bash
# Direct usage (interactive, sequential)
/agent-name

# Ralph PRD usage (orchestrated, parallel)
agent-name:task
```

## 🎯 Available Agents

### 1. Explorer - `/explorer`

**Role:** Codebase exploration, dependency mapping, and pattern discovery

**Direct Usage:**
```bash
/explorer --task=find-function --target="getUserData"
/explorer --task=map-architecture
```

**Ralph PRD Usage:**
```json
{
  "agent": "explorer:task"
}
```

**Use when:**
- Finding functions/components
- Mapping dependencies
- Analyzing architecture
- Investigating bugs

---

### 2. Builder - `/builder`

**Role:** Implementation and coding

**Direct Usage:**
```bash
/builder --tech=nextjs --feature="user authentication"
/builder --design --component="Button"
```

**Ralph PRD Usage:**
```json
{
  "agent": "builder:task",
  "tech": "nextjs"
}
```

**Use when:**
- Building features
- Implementing components
- Writing code
- Following specs

---

### 3. Architect - `/architect`

**Role:** Design, strategy, initialization, and creative thinking

**Direct Usage:**
```bash
/architect --mode=init "Build a SaaS dashboard"
/architect --mode=strategy "Define pricing strategy"
/architect --mode=design "Modern fintech design system"
/architect --mode=brainstorm "Improve user engagement"
```

**Ralph PRD Usage:**
```json
{
  "agent": "architect:task",
  "mode": "init"
}
```

**Use when:**
- Starting new projects
- Planning strategy
- Creating design systems
- Brainstorming solutions

---

### 4. Finalize - `/finalize`

**Role:** Quality assurance, code review, and documentation

**Direct Usage:**
```bash
/finalize                           # Full QA + docs
/finalize --mode=qa                 # QA only
/finalize --mode=qa --type=test     # Tests only
/finalize --mode=docs               # Docs only
```

**Ralph PRD Usage:**
```json
{
  "agent": "finalize:task",
  "mode": "full"
}
```

**Use when:**
- After development completion
- Before git commits
- Need comprehensive QA
- Updating documentation

---

### 5. Simplifier - `/simplifier`

**Role:** Code simplification and refactoring

**Direct Usage:**
```bash
/simplifier --file="src/components/ComplexComponent.tsx"
```

**Ralph PRD Usage:**
```json
{
  "agent": "simplifier:task"
}
```

**Use when:**
- Code is too complex
- Need refactoring
- Reducing technical debt

---

### 6. Ralph - `/ralph`

**Role:** Multi-agent orchestrator for PRD-driven development

**Direct Usage:**
```bash
/ralph execute .smite/prd.json
/ralph "Build a todo app with auth"
/ralph status
/ralph cancel
```

**Use when:**
- Executing full PRD
- Complex multi-agent workflows
- Need state persistence
- Repetitive workflows

---

### 7. Statusline - `/statusline`

**Role:** Auto-configuring statusline for Claude Code

**Direct Usage:**
```bash
/statusline install               # Install and auto-configure
/statusline config                # View configuration
/statusline reset                 # Reset to defaults
/statusline help                  # Show help
```

**Use when:**
- Installing plugin (auto-configures)
- Viewing current configuration
- Resetting to defaults
- Manual configuration needed

**Features:**
- 🌿 Git branch with changes (+added -deleted ~modified)
- 💰 Session cost and duration tracking
- 🧩 Context tokens used with percentage
- 📊 Visual progress bars
- ⏱️ Usage limits (5-hour, weekly)
- 📈 Daily spend tracking
- 🚀 Zero-configuration setup

**Display Example:**
```
main • Sonnet 4.5 • $0.15 • 5m23s • 45.2K/200K ⣿⣿⣧⣀⣀⣀⣀⣀⣀⣀ 23%
smite-marketplace • /Users/username/Projects/smite
```

**See:** [plugins/statusline/README.md](plugins/statusline/README.md)

---

## 📊 Usage Comparison

| Scenario | Recommended Approach | Why |
|----------|---------------------|-----|
| Quick task (1-2 agents) | `/agent-name` | Direct, faster |
| Medium workflow (3 agents) | Native Task tool | Manual orchestration |
| Complex workflow (4+ agents) | `/ralph` | State tracking |
| Interactive development | `/agent-name` | Conversational |
| Automated execution | `agent-name:task` | Ralph PRD |

## 🔄 Typical Workflow

### Complete Project Flow

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
/builder --tech=nextjs --feature="task CRUD"

# 6. Finalize
/finalize
```

### Ralph PRD Flow

```json
{
  "project": "TaskManager",
  "userStories": [
    {
      "id": "US-001",
      "title": "Initialize project",
      "agent": "architect:task",
      "mode": "init"
    },
    {
      "id": "US-002",
      "title": "Build UI",
      "agent": "builder:task",
      "dependencies": ["US-001"]
    },
    {
      "id": "US-003",
      "title": "QA & Docs",
      "agent": "finalize:task",
      "dependencies": ["US-002"]
    }
  ]
}
```

Execute with:
```bash
/ralph execute prd.json
```

## 🎓 Best Practices

1. **Start with Architect** - Define before building
2. **Use Explorer** - Understand existing code
3. **Build with Builder** - Implement following specs
4. **Finalize with Finalize** - Ensure quality
5. **Simplify when needed** - Reduce complexity
6. **Orchestrate with Ralph** - For complex workflows
7. **Install Statusline** - Track your session metrics

## 📚 Agent Details

See individual plugin documentation for detailed usage:

- `plugins/explorer/commands/explore.md`
- `plugins/builder/commands/build.md`
- `plugins/architect/commands/design.md`
- `plugins/finalize/commands/finalize.md`
- `plugins/simplifier/commands/simplify.md`
- `plugins/statusline/README.md`
- `plugins/ralph/README.md`

---

**Version:** 1.0.0
**Updated:** 2025-01-13
