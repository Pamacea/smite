# 🏪 SMITE for Claude Code

**Zero-debt engineering agents and specialized development tools for Claude Code**

---

## 🚀 Quick Start

### Installation (2 commands)

```bash
# Add the SMITE Marketplace to Claude Code
/plugin marketplace add Pamacea/smite-marketplace

# List all available plugins
/plugin list --marketplace=smite-marketplace

# Install individual plugins based on your needs
/plugin install smite-initializer@smite-marketplace
/plugin install linter-sentinel@smite-marketplace
```

### Or Install All Plugins

```bash
# Install all SMITE agents (11 specialized agents)
/plugin install smite-initializer@smite-marketplace
/plugin install smite-explorer@smite-marketplace
/plugin install smite-strategist@smite-marketplace
/plugin install smite-aura@smite-marketplace
/plugin install smite-constructor@smite-marketplace
/plugin install smite-gatekeeper@smite-marketplace
/plugin install smite-handover@smite-marketplace
/plugin install smite-surgeon@smite-marketplace
/plugin install smite-orchestrator@smite-marketplace
/plugin install smite-brainstorm@smite-marketplace
/plugin install smite-router@smite-marketplace

# Install quality assurance plugins
/plugin install linter-sentinel@smite-marketplace
/plugin install doc-maintainer@smite-marketplace
```

---

## 📦 Available Plugins

### 🤖 SMITE Agents (10 Specialized Agents)

| Plugin | Description | Category | Command |
|--------|-------------|----------|---------|
| **smite-initializer** | Project initialization and technical stack definition | Development | `/smite-init` |
| **smite-explorer** | Codebase exploration, dependency mapping & pattern discovery | Development | `/smite:explorer` |
| **smite-strategist** | Business strategy, market analysis & revenue optimization | Development | `/smite:strategist` |
| **smite-aura** | Design system and UI/UX component creation | Development | `/smite-aura` |
| **smite-constructor** | Implementation with tech specialization & design mode | Development | `/smite-constructor --tech=[nextjs\|rust\|python]` |
| **smite-gatekeeper** | Code review, QA, testing & performance validation | Development | `/smite-gatekeeper --mode=[test\|coverage\|perf\|security]` |
| **smite-handover** | Documentation and knowledge transfer | Development | `/smite-handover` |
| **smite-surgeon** | Surgical code refactoring and optimization | Development | `/smite-surgeon` |
| **smite-brainstorm** | Creative thinking, ideation & problem-solving partner | Development | `/smite:brainstorm --mode=[explore\|plan\|solve]` |
| **smite-router** ⭐ NEW | Intelligent agent routing based on project context detection | Development | `*start-s_router` |

### 🔍 Quality & Documentation Plugins

| Plugin | Description | Category | Command |
|--------|-------------|----------|---------|
| **linter-sentinel** | Auto-fix ESLint, TypeScript, and Prettier violations | Quality | `*start-linter-sentinel --mode=fix` |
| **doc-maintainer** | Synchronize documentation with code changes | Documentation | `*start-doc-maintainer --mode=sync` |

**Total:** 12 plugins with dual execution mode (Skill + Task)

---

## 🤖 Auto-Orchestration System

The **smite-orchestrator** plugin provides intelligent workflow coordination through **Claude Code 2.1.0 native hooks**:

### Features

- **🎯 Claude Code 2.1.0 Hooks Integration**: Uses native PostToolUse, SubagentStop, and PreToolUse hooks
- **📊 Workflow State Tracking**: Automatically tracks agent execution and artifacts
- **🔍 Automatic Technical Debt Detection**: Scans code for anti-patterns after every file write
- **💡 Smart Agent Suggestions**: Suggests next agent in workflow based on current state
- **📝 Documentation Validation**: Auto-detects docs changes and suggests Gatekeeper
- **🔄 Session Persistence**: Maintains workflow state across sessions
- **⚡ Zero Overhead**: No daemon required, hooks run only when needed
- **🛡️ Non-Intrusive**: Provides suggestions without forcing actions

### Hook Types

| Hook | Trigger | Action |
|------|---------|--------|
| **PostToolUse** | After Edit/Write | Detects technical debt in code, suggests Gatekeeper for docs |
| **SubagentStop** | After agent completes | Updates state, suggests next agent in workflow |
| **PreToolUse** | Before smite agent | Validates workflow order, warns on violations |

### Technical Debt Detection

Automatically detects these patterns in `.ts`, `.tsx`, `.js`, `.jsx` files:

- 🔴 **High**: `@ts-ignore`, debugger statements
- 🟡 **Medium**: `any` types, `@ts-expect-error`, empty interfaces
- 🟢 **Low**: TODO/FIXME comments, console statements, hardcoded strings

### Custom Workflow Mode

Create personalized agent sequences:

```bash
# Quick feature development
/smite-orchestrator --workflow=custom --agents=explorer,constructor,gatekeeper

# Business focus
/smite-orchestrator --workflow=custom --agents=strategist,brainstorm,handover

# Full refactoring
/smite-orchestrator --workflow=custom --agents=explorer,surgeon,constructor,gatekeeper
```

### Standard Workflow Order

```
initializer → explorer → strategist → aura → constructor → gatekeeper → handover
```

### How It Works

```
User edits file → PostToolUse hook fires
  ↓
  ├─ Code file? → detect-debt.js scans for patterns
  │                → Creates .smite/suggestions/fix-surgeon.md
  │                → Prompt hook suggests Surgeon
  │
  └─ Docs file? → Prompt hook suggests Gatekeeper

Agent completes → SubagentStop hook fires
  ↓
  ├─ agent-complete.js updates state
  ├─ Adds agent to agents_called list
  ├─ Determines next agent in workflow
  └─ Creates .smite/suggestions/next-action.md
      → Prompt hook suggests next agent

Before agent → PreToolUse hook fires
  ↓
  └─ Validates workflow order
     → Warns if order violated
     → Suggests correct sequence
```

### Generated Artifacts

The orchestrator creates these files automatically:

- `.smite/orchestrator-state.json` - Current workflow state and progress
- `.smite/suggestions/next-action.md` - Next agent recommendation
- `.smite/suggestions/fix-surgeon.md` - Technical debt alerts with line numbers
- `.smite/workflow/session-info.md` - Workflow progress and artifacts (optional)

### Configuration

Hooks are configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write.*\\.(ts|tsx|js|jsx)$",
        "hooks": [
          {
            "type": "command",
            "command": "node plugins/smite-orchestrator/dist/detect-debt.js file $FILE_PATH",
            "statusMessage": "🔪 Detecting technical debt..."
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "smite-",
        "hooks": [
          {
            "type": "command",
            "command": "node plugins/smite-orchestrator/dist/agent-complete.js $AGENT_NAME",
            "statusMessage": "🎯 Updating workflow state..."
          }
        ]
      }
    ]
  }
}
```

### Performance

- **RAM Overhead**: 0MB (uses Claude Code process)
- **CPU Overhead**: Minimal (hooks only fire on tool use)
- **Detection Speed**: <50ms for technical debt scanning
- **State Management**: <10ms for JSON operations

### Documentation

- **[docs/SMITE_HOOKS_ARCHITECTURE.md](./docs/SMITE_HOOKS_ARCHITECTURE.md)** - Complete guide to hooks implementation

---

## 🔀 Intelligent Agent Routing with smite-router ⭐ NEW

**smite-router** automatically detects your project context and routes to the best agent with correct parameters - no manual configuration needed!

### Features

- **🎯 Automatic Framework Detection**: Detects TypeScript, Rust, Python, Go from project files
- **📦 Automatic Framework Detection**: Identifies Next.js, Axum, FastAPI, and more
- **🔧 Zero Configuration**: No need to specify `--tech=nextjs` - router handles it
- **📚 Documentation Links**: Provides official documentation links for detected technologies
- **⚙️ Custom Framework Support**: Works with any framework via custom mode
- **🔄 Multi-Project Support**: Automatically adapts when switching between projects

### How It Works

```
You: "Implement a feature"
  ↓
smite-router analyzes project
  ↓
Detects: Next.js + TypeScript + Tailwind
  ↓
Routes to: smite-constructor --tech=nextjs
  ↓
Provides relevant docs links:
  - https://nextjs.org/docs
  - https://react.dev/
  - https://zustand.docs.pmnd.rs/
  ↓
Agent implements with correct flags!
```

### Detection Capabilities

**Languages:**
- TypeScript (tsconfig.json)
- Rust (Cargo.toml)
- Python (pyproject.toml)
- Go (go.mod)

**Frameworks:**
- **Web**: Next.js, React, Angular, Vue, Svelte
- **Rust**: Axum, Actix, Rocket
- **Python**: FastAPI, Django, Flask

### Usage

```bash
# Auto mode (recommended)
*start-s_router

# Custom framework
*start-s_router --framework=custom

# Manual override
*start-s_router --agent=constructor --mode=custom
```

### Documentation Integration

All agents now include **official documentation links** for their respective technologies:

- **React Ecosystem**: Next.js, React, Zustand, TanStack Query, Prisma
- **Rust Ecosystem**: The Rust Book, Tokio, Axum, SQLx, Diesel
- **Python Ecosystem**: FastAPI, Pydantic, SQLAlchemy
- **Build Tools**: Vite, Turbopack, esbuild
- **Testing**: Vitest, Jest, Playwright
- **Styling**: Tailwind CSS, Emotion, styled-components

### Knowledge Base

Centralized documentation hub: `.smite/knowledge-base.md`

**Quick Links:**
- [React 18](https://react.dev/)
- [Next.js 14](https://nextjs.org/docs)
- [TypeScript 5](https://www.typescriptlang.org/docs/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Prisma](https://www.prisma.io/docs/)
- [The Rust Book](https://doc.rust-lang.org/book/)
- [Tokio](https://tokio.rs/)
- [Axum](https://docs.rs/axum/latest/axum/)
- [SQLx](https://docs.rs/sqlx/latest/sqlx/)
- [FastAPI](https://fastapi.tiangolo.com/)

### Example: Multi-Language Project

```bash
# Morning: Working on Next.js
User: "Add a profile page"
Router: "Next.js detected → smite-constructor --tech=nextjs"
Docs: Next.js docs + React docs + Zustand docs

# Afternoon: Working on Rust
User: "Add an API endpoint"
Router: "Rust + Axum detected → smite-constructor --tech=rust"
Docs: Rust Book + Axum docs + Tokio docs

# Router adapts automatically!
```

### Documentation

- **[docs/SMITE_ROUTER_GUIDE.md](./docs/SMITE_ROUTER_GUIDE.md)** - Complete router guide with examples

---

## ⚡ Parallel Execution with Task Tool

**Run multiple SMITE agents simultaneously with real-time progress tracking**

### Skill vs Task Tool

| Tool | Purpose | Progress UI | Usage |
|------|---------|-------------|-------|
| **Skill** | Load agent prompt from file | None | `Skill(skill="smite-explorer:explorer")` |
| **Task** | Create parallel subagents | "Running X Agents" | `Task(subagent_type="general-purpose", prompt="...")` |

### Running Agents in Parallel

To execute multiple agents simultaneously with the "Running X Agents" UI:

```typescript
// Launch 3 agents in parallel
Task(subagent_type="general-purpose", prompt="Explore the codebase and map architecture")
Task(subagent_type="general-purpose", prompt="Check for lint errors and fix them")
Task(subagent_type="general-purpose", prompt="Update documentation with recent changes")

// Result:
// 🚀 Running 3 Agents in parallel...
// [Real-time progress tracking for each agent]
// ✅ All 3 Agents completed
```

### Sequential Execution (Commands)

For single-agent workflows, use CLI commands:

```bash
# Run single agent
/smite-gatekeeper --mode=commit-validation

# Or via Skill tool (no parallel UI)
Skill(skill="smite-gatekeeper:gatekeeper")
```

### When to Use Each Mode

**Use Task Tool (Parallel):**
- Multiple independent tasks
- Need real-time progress tracking
- Different agents working simultaneously
- Example: "Explore code, check lint, and update docs in parallel"

**Use Skill Tool or Commands (Sequential):**
- Single agent tasks
- Chained workflows (output of one → input of next)
- Simple one-off tasks

### Documentation

- **[docs/DUAL_MODE_GUIDE.md](./docs/DUAL_MODE_GUIDE.md)** - Complete guide for Task tool usage

**Backwards compatible:** All existing `/smite-[agent]` commands still work exactly as before!

---

## 📖 Usage

### Starting a New Project with Auto-Orchestration

```bash
# 1. Start with initializer (auto-orchestration begins)
/smite-init

# After completion, orchestrator suggests next agent:
# "Next: /smite:explorer"

# 2. Explore the codebase (if applicable)
/smite:explorer --task=map-architecture

# 3. Continue with business strategy
/smite:strategist --workflow=market-analysis
/smite:strategist --workflow=business-model

# Orchestrator tracks artifacts and suggests:
# "Next: /smite-aura"

# 4. Follow the workflow
/smite-aura
/smite-constructor --tech=nextjs
/smite-gatekeeper --mode=test
/smite-handover

# Technical debt detected? Orchestrator suggests:
# "⚠️ Technical debt detected - run /smite-surgeon"
```

### Tech-Specialized Development

```bash
# Next.js full-stack development
/smite-constructor --tech=nextjs
  → React 18, TypeScript, Server Components, Prisma, PostgreSQL

# Rust systems programming
/smite-constructor --tech=rust
  → Cargo, Tokio, Sqlx, async/await, zero-copy patterns

# Python backend
/smite-constructor --tech=python
  → FastAPI, SQLAlchemy 2.0, Pydantic, asyncio

# Design implementation
/smite-constructor --design --source="figma:file-id"
  → Figma to code, SVG components, design tokens
```

### Quality Assurance & Testing

```bash
# Generate test suite
/smite-gatekeeper --mode=test --tech=nextjs
  → Unit tests, integration tests, E2E (Playwright)

# Analyze coverage gaps
/smite-gatekeeper --mode=coverage
  → Identify untested code, prioritize tests

# Performance testing
/smite-gatekeeper --mode=performance
  → Lighthouse CI, Web Vitals, database queries

# Security audit
/smite-gatekeeper --mode=security
  → OWASP Top 10, security headers, vulnerability scan
```

### Creative Problem-Solving

```bash
# Explore ideas deeply
/smite:brainstorm --mode=explore --topic="microservices architecture"

# Create implementation plan
/smite:brainstorm --mode=plan --topic="implement authentication system"

# Solve specific problem
/smite:brainstorm --mode=solve --topic="performance bottleneck"

# Configure tools
/smite:brainstorm --mode=configure --topic="setup ESLint"
```

### Individual Plugin Installation

Install only what you need:

```bash
# For new projects
/plugin install smite-initializer@smite-marketplace

# For codebase exploration
/plugin install smite-explorer@smite-marketplace

# For tech-specialized implementation
/plugin install smite-constructor@smite-marketplace

# For quality assurance & testing
/plugin install smite-gatekeeper@smite-marketplace

# For creative thinking & planning
/plugin install smite-brainstorm@smite-marketplace

# For code quality
/plugin install linter-sentinel@smite-marketplace

# For documentation
/plugin install doc-maintainer@smite-marketplace
```

---

## 🔧 Orchestrator Architecture

The auto-orchestration system uses **Claude Code 2.1.0 PROMPT-ONLY hooks** - zero external script dependencies:

### Design Philosophy

- **🎯 100% Prompt-Based**: All hook logic is defined as prompts, no external scripts
- **🌍 Universal Compatibility**: Works on any OS without JavaScript runtime requirements
- **⚡ Zero Setup**: No build steps, no compilation, no dependencies
- **🔄 State Managed In-Place**: Orchestrator state stored in `.smite/orchestrator-state.json`

### Hook Implementation

All hooks are defined in `.claude/settings.local.json`:

| Hook Type | Matcher | Implementation |
|-----------|---------|----------------|
| **PostToolUse** | `Edit|Write.*\\.(ts\|tsx\|js\|jsx)$` | Prompt-based technical debt detection |
| **PostToolUse** | `Edit|Write.*docs/.*\\.md$` | Prompt-based documentation validation |
| **SubagentStop** | `smite-` | Prompt-based workflow state management |
| **PreToolUse** | `Task.*smite-\|Skill.*smite-` | Prompt-based workflow validation |

### State Management

The orchestrator maintains state in `.smite/orchestrator-state.json`:

```json
{
  "session_id": "uuid",
  "created_at": "ISO-timestamp",
  "updated_at": "ISO-timestamp",
  "current_agent": null,
  "last_completed_agent": "explorer",
  "agents_called": ["initializer", "explorer"],
  "workflow_complete": false,
  "artifacts": []
}
```

This state is:
- ✅ Automatically created by hooks when needed
- ✅ Updated after each agent completion
- ✅ Used to suggest next agent in workflow
- ✅ Persistent across sessions

---

## 🏗️ Repository Structure

```
smite-marketplace/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace configuration
│
├── .claude/
│   ├── settings.local.json           # Claude Code 2.1.0 hooks configuration ⭐ NEW
│   └── hooks.json                    # Alternative hooks format
│
├── .smite/                            # Orchestrator state
│   ├── orchestrator-state.json       # Current workflow state
│   └── suggestions/                  # Auto-generated suggestions
│       ├── next-action.md            # Next agent recommendation
│       └── fix-surgeon.md            # Technical debt alerts
│
├── plugins/
│   ├── smite-initializer/            # Project initialization agent
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/initializer.md     # Skill mode (sequential)
│   │   └── agents/initializer.task.md # Task mode (parallel) ⭐ NEW
│   │
│   ├── smite-explorer/               # Codebase exploration agent
│   │   ├── skills/explorer.md
│   │   └── agents/explorer.task.md   # ⭐ NEW
│   │
│   ├── smite-strategist/             # Business strategy agent
│   │   ├── skills/strategist.md
│   │   └── agents/strategist.task.md # ⭐ NEW
│   │
│   ├── smite-aura/                   # Design system agent
│   │   ├── skills/aura.md
│   │   └── agents/aura.task.md       # ⭐ NEW
│   │
│   ├── smite-constructor/            # Implementation agent
│   │   ├── skills/constructor.md
│   │   ├── skills/constructor/SKILL.md # With hooks frontmatter ⭐ NEW
│   │   └── agents/constructor.task.md # ⭐ NEW
│   │
│   ├── smite-gatekeeper/             # Code review & QA agent
│   │   ├── skills/gatekeeper.md
│   │   ├── skills/gatekeeper/SKILL.md # With hooks frontmatter ⭐ NEW
│   │   └── agents/gatekeeper.task.md # ⭐ NEW
│   │
│   ├── smite-handover/               # Documentation agent
│   │   ├── skills/handover.md
│   │   └── agents/handover.task.md   # ⭐ NEW
│   │
│   ├── smite-surgeon/                # Refactoring agent
│   │   ├── skills/surgeon.md
│   │   └── agents/surgeon.task.md    # ⭐ NEW
│   │
│   ├── smite-orchestrator/           # Auto-orchestration system (PROMPT-ONLY)
│   │   └── skills/orchestrator.md    # Orchestrator interface
│   │
│   ├── smite-router/                # Intelligent agent routing ⭐ NEW
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/router/SKILL.md    # Routing logic
│   │   ├── commands/smite-router.md  # Router interface
│   │   ├── scripts/detect-framework.ts # Framework detection
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── smite-brainstorm/             # Creative thinking agent
│   │   ├── skills/brainstorm.md
│   │   └── agents/brainstorm.task.md # ⭐ NEW
│   │
│   ├── linter-sentinel/              # Auto-fix linting agent
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/linter-sentinel.md
│   │   └── agents/linter-sentinel.task.md # ⭐ NEW
│   │
│   └── doc-maintainer/               # Documentation sync agent
│       ├── .claude-plugin/plugin.json
│       ├── skills/doc-maintainer.md
│       └── agents/doc-maintainer.task.md # ⭐ NEW
│
├── .smite/                            # Orchestrator runtime state & knowledge ⭐ NEW
│   ├── orchestrator-state.json       # Session state & workflow progress
│   ├── knowledge-base.md             # Centralized documentation hub
│   └── suggestions/                  # Auto-generated recommendations
│       ├── next-action.md            # Next agent suggestion
│       └── fix-surgeon.md            # Technical debt alerts
│
├── plugins/
│   ├── smite-initializer/            # Project initialization agent
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/initializer.md     # Skill mode (sequential)
│   │   └── agents/initializer.task.md # Task mode (parallel) ⭐ NEW
│   │
│   ├── smite-explorer/               # Codebase exploration agent
│   │   ├── skills/explorer.md
│   │   └── agents/explorer.task.md   # ⭐ NEW
│   │
│   ├── smite-strategist/             # Business strategy agent
│   │   ├── skills/strategist.md
│   │   └── agents/strategist.task.md # ⭐ NEW
│   │
│   ├── smite-aura/                   # Design system agent
│   │   ├── skills/aura.md
│   │   └── agents/aura.task.md       # ⭐ NEW
│   │
│   ├── smite-constructor/            # Implementation agent
│   │   ├── skills/constructor.md
│   │   ├── skills/constructor/SKILL.md # With docs links ⭐ NEW
│   │   └── agents/constructor.task.md # ⭐ NEW
│   │
│   ├── smite-gatekeeper/             # Code review & QA agent
│   │   ├── skills/gatekeeper.md
│   │   ├── skills/gatekeeper/SKILL.md # With hooks frontmatter ⭐ NEW
│   │   └── agents/gatekeeper.task.md # ⭐ NEW
│   │
│   ├── smite-handover/               # Documentation agent
│   │   ├── skills/handover.md
│   │   └── agents/handover.task.md   # ⭐ NEW
│   │
│   ├── smite-surgeon/                # Refactoring agent
│   │   ├── skills/surgeon.md
│   │   └── agents/surgeon.task.md    # ⭐ NEW
│   │
│   ├── smite-orchestrator/           # Auto-orchestration system (PROMPT-ONLY)
│   │   └── skills/orchestrator.md    # Orchestrator interface
│   │
│   ├── smite-router/                # Intelligent agent routing ⭐ NEW
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/router/SKILL.md    # Routing logic
│   │   ├── commands/smite-router.md  # Router interface
│   │   ├── scripts/detect-framework.ts # Framework detection
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── smite-brainstorm/             # Creative thinking agent
│   │   ├── skills/brainstorm.md
│   │   └── agents/brainstorm.task.md # ⭐ NEW
│   │
│   ├── linter-sentinel/              # Auto-fix linting agent
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/linter-sentinel.md
│   │   └── agents/linter-sentinel.task.md # ⭐ NEW
│   │
│   └── doc-maintainer/               # Documentation sync agent
│       ├── .claude-plugin/plugin.json
│       ├── skills/doc-maintainer.md
│       └── agents/doc-maintainer.task.md # ⭐ NEW
│
├── docs/                             # Documentation
│   ├── SMITE_HOOKS_ARCHITECTURE.md  # Complete hooks guide ⭐ NEW
│   ├── SMITE_ROUTER_GUIDE.md        # Router guide with examples ⭐ NEW
│   ├── DUAL_MODE_GUIDE.md           # Complete dual mode guide ⭐
│   └── COMPLETION_REPORT.md         # Implementation summary
│
├── README.md                          # This file
└── LICENSE
```

---

## 🔄 Updating Plugins

```bash
# Update the marketplace
/plugin marketplace update smite-marketplace

# Update all installed plugins
/plugin update --all
```

---

## 🎯 Categories

### Development (SMITE Agents)
- **10 specialized agents** covering all development phases
- **Tech specialization modes**: Next.js, Rust, Python, Go
- **Design implementation mode**: Figma to code, SVG components
- **Custom workflows**: Build your own agent sequences
- **Auto-orchestrated workflow** with intelligent suggestions
- **Automatic technical debt detection** and tracking

### Quality
- **Comprehensive testing**: Unit, integration, E2E generation
- **Performance analysis**: Lighthouse, Web Vitals, database queries
- **Security audits**: OWASP Top 10, vulnerability scanning
- Automated linting and type-safety enforcement
- Zero-debt code quality maintenance

### Documentation
- Automatic documentation synchronization
- JSDoc, README, and API documentation
- Zero documentation debt

---

## 🛠️ Configuration

Each plugin can be configured after installation:

```bash
# Configure linter rules
Edit: agent/configs/linter-sentinel.json

# Configure documentation sync
Edit: agent/configs/doc-maintainer.json
```

---

## 📚 Resources

- **Claude Code**: [https://claude.com/claude-code](https://claude.com/claude-code)

---

## 🤝 Contributing

To add a new plugin to the marketplace:

1. Create plugin directory: `plugins/your-plugin/`
2. Add `.claude-plugin/plugin.json`
3. Add skill definition in `skills/your-agent.md`
4. Update `.claude-plugin/marketplace.json`
5. Submit pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built by **Pamacea** for zero-debt engineering with Claude Code

---

**SMITE Marketplace v2.2.0**
*12 plugins available*
*10 specialized development agents*
*2 quality & documentation plugins*
*Dual execution mode (Skill + Task)*
*Parallel agent workflows with real-time tracking*
*Tech specialization modes (Next.js, Rust, Python)*
*Custom workflows & design implementation*
*Comprehensive QA (test, coverage, performance, security)*
*Modular installation*
*Zero-debt development*
*Auto-orchestration with Claude Code 2.1.0 native hooks*
*Automatic technical debt detection*
*Zero-overhead workflow coordination*
*Intelligent agent routing with smite-router* ⭐ NEW
*Automatic framework & language detection* ⭐ NEW
*Centralized documentation knowledge base* ⭐ NEW
*Official docs links integration (80+ references)* ⭐ NEW
