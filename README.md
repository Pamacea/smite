# 🏪 SMITE for Claude Code

**Zero-debt engineering agents and specialized development tools for Claude Code**

---

## 🚀 Quick Start

### Installation (2 commands)

```bash
# Add the SMITE Marketplace
/plugin marketplace add Pamacea/smite-marketplace

# List all available plugins
/plugin list --marketplace=smite-marketplace

# Install individual plugins
/plugin install smite-initializer@smite-marketplace
/plugin install linter-sentinel@smite-marketplace
```

### Install All Plugins

```bash
# SMITE agents (10 specialized agents)
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

# Quality assurance plugins
/plugin install linter-sentinel@smite-marketplace
/plugin install doc-maintainer@smite-marketplace
```

---

## 📦 Available Plugins

### 🤖 SMITE Agents

| Plugin | Description | Command |
|--------|-------------|---------|
| **smite-initializer** | Project initialization & tech stack | `/smite-init` |
| **smite-explorer** | Codebase exploration & pattern discovery | `/smite:explorer` |
| **smite-strategist** | Business strategy & market analysis | `/smite:strategist` |
| **smite-aura** | Design system & UI/UX components | `/smite-aura` |
| **smite-constructor** | Implementation with tech specialization | `/smite-constructor --tech=[nextjs\|rust\|python]` |
| **smite-gatekeeper** | Code review, QA & testing | `/smite-gatekeeper --mode=[test\|coverage\|perf\|security]` |
| **smite-handover** | Documentation & knowledge transfer | `/smite-handover` |
| **smite-surgeon** | Surgical refactoring & optimization | `/smite-surgeon` |
| **smite-brainstorm** | Creative thinking & problem-solving | `/smite:brainstorm --mode=[explore\|plan\|solve]` |
| **smite-router** ⭐ | Intelligent agent routing | `*start-s_router` |

### 🔍 Quality & Documentation

| Plugin | Description | Command |
|--------|-------------|---------|
| **linter-sentinel** | Auto-fix ESLint, TypeScript, Prettier | `*start-linter-sentinel --mode=fix` |
| **doc-maintainer** | Sync documentation with code changes | `*start-doc-maintainer --mode=sync` |

**Total:** 12 plugins with dual execution mode (Skill + Task)

---

## 🎯 Key Features

### 🤖 Auto-Orchestration (Claude Code 2.1.0 Hooks)

- **Smart Workflow Coordination**: Tracks agent execution and suggests next steps
- **Technical Debt Detection**: Auto-scans code for anti-patterns after every edit
- **Zero Overhead**: No daemon required, hooks run only when needed
- **Session Persistence**: Maintains workflow state across sessions

**Detection Patterns:**
- 🔴 High: `@ts-ignore`, debugger statements
- 🟡 Medium: `any` types, `@ts-expect-error`, empty interfaces
- 🟢 Low: TODO/FIXME comments, console statements

**Standard Workflow:** `initializer → explorer → strategist → aura → constructor → gatekeeper → handover`

### 🔀 Intelligent Agent Routing ⭐ NEW

**smite-router** automatically detects your project context and routes to the best agent:

- **Automatic Detection**: TypeScript, Rust, Python, Go frameworks
- **Zero Configuration**: No need to specify `--tech=nextjs`
- **Smart Routing**: Analyzes project structure and selects appropriate agent
- **Documentation Links**: Provides official docs for detected technologies

```bash
# Auto mode (recommended)
*start-s_router

# Detects: Next.js + TypeScript + Tailwind
# Routes to: smite-constructor --tech=nextjs
# Provides relevant docs links
```

### ⚡ Parallel Execution

Run multiple agents simultaneously with real-time progress:

```typescript
// Launch 3 agents in parallel
Task(subagent_type="general-purpose", prompt="Explore codebase")
Task(subagent_type="general-purpose", prompt="Check lint errors")
Task(subagent_type="general-purpose", prompt="Update docs")

// Result: 🚀 Running 3 Agents in parallel...
```

**When to use:**
- **Task Tool** (Parallel): Multiple independent tasks
- **Skill Tool** (Sequential): Single agent or chained workflows

### 🛠️ Tech Specialization

```bash
# Next.js full-stack
/smite-constructor --tech=nextjs
→ React 18, TypeScript, Server Components, Prisma, PostgreSQL

# Rust systems
/smite-constructor --tech=rust
→ Cargo, Tokio, Sqlx, async/await, zero-copy patterns

# Python backend
/smite-constructor --tech=python
→ FastAPI, SQLAlchemy 2.0, Pydantic, asyncio
```

### 🧪 Quality Assurance

```bash
/smite-gatekeeper --mode=test        # Unit, integration, E2E tests
/smite-gatekeeper --mode=coverage    # Coverage gap analysis
/smite-gatekeeper --mode=performance # Lighthouse, Web Vitals
/smite-gatekeeper --mode=security    # OWASP Top 10, vulnerability scan
```

### 💡 Creative Problem-Solving

```bash
/smite:brainstorm --mode=explore --topic="microservices architecture"
/smite:brainstorm --mode=plan --topic="implement authentication"
/smite:brainstorm --mode=solve --topic="performance bottleneck"
```

---

## 📖 Quick Usage Examples

### New Project with Auto-Orchestration

```bash
/smite-init
→ Orchestrator suggests: /smite:explorer

/smite:explorer --task=map-architecture
→ Orchestrator suggests: /smite:strategist

/smite:strategist --workflow=market-analysis
→ Orchestrator suggests: /smite-aura

# Continue workflow...
/smite-aura
/smite-constructor --tech=nextjs
/smite-gatekeeper --mode=test
/smite-handover

# Technical debt detected? Orchestrator suggests Surgeon
```

### Tech-Specialized Development

```bash
# Auto-routing with smite-router ⭐
*start-s_router
# Automatically detects your tech stack and routes correctly

# Manual specification
/smite-constructor --tech=nextjs  # or rust, python, go
/smite-constructor --design --source="figma:file-id"
```

---

## 🏗️ Repository Structure

```
smite-marketplace/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace config
├── .claude/
│   └── settings.local.json           # Claude Code 2.1.0 hooks
├── .smite/                            # Orchestrator state
│   ├── orchestrator-state.json       # Workflow progress
│   ├── knowledge-base.md             # Documentation hub
│   └── suggestions/                  # Auto-generated recommendations
├── plugins/
│   ├── smite-*/                      # 10 specialized agents
│   ├── linter-sentinel/              # Auto-fix linting
│   └── doc-maintainer/               # Documentation sync
└── docs/
    ├── SMITE_COMPLETE_GUIDE.md       # 📖 Complete guide
    ├── SMITE_HOOKS_ARCHITECTURE.md   # Hooks deep dive
    ├── SMITE_ROUTER_GUIDE.md         # Router guide
    └── DUAL_MODE_GUIDE.md            # Skill vs Task
```

---

## 🔄 Updating

```bash
# Update marketplace
/plugin marketplace update smite-marketplace

# Update all plugins
/plugin update --all
```

---

## 📚 Detailed Documentation

| Document | Description |
|----------|-------------|
| **[SMITE_COMPLETE_GUIDE.md](./docs/SMITE_COMPLETE_GUIDE.md)** | Installation, configuration & complete usage |
| **[SMITE_HOOKS_ARCHITECTURE.md](./docs/SMITE_HOOKS_ARCHITECTURE.md)** | Deep dive into Claude Code 2.1.0 hooks |
| **[SMITE_ROUTER_GUIDE.md](./docs/SMITE_ROUTER_GUIDE.md)** | Intelligent routing with examples |
| **[DUAL_MODE_GUIDE.md](./docs/DUAL_MODE_GUIDE.md)** | Skill vs Task execution modes |

---

## 🎯 Categories

### Development (SMITE Agents)
- 10 specialized agents covering all development phases
- Tech specialization: Next.js, Rust, Python, Go
- Design implementation: Figma to code
- Auto-orchestrated workflows with intelligent suggestions

### Quality
- Comprehensive testing (unit, integration, E2E)
- Performance analysis (Lighthouse, Web Vitals)
- Security audits (OWASP Top 10)
- Automated linting and type-safety

### Documentation
- Automatic documentation synchronization
- JSDoc, README, and API docs
- Zero documentation debt

---

## 🤝 Contributing

To add a new plugin:

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

_12 plugins • 10 specialized agents • Dual execution mode • Parallel workflows • Tech specialization • Auto-orchestration • Intelligent routing_

📖 **[Complete Guide](./docs/SMITE_COMPLETE_GUIDE.md)** for detailed installation, configuration, and usage examples.
