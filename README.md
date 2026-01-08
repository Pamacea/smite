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
# Install all SMITE agents (10 specialized agents)
/plugin install smite-initializer@smite-marketplace
/plugin install smite-analyst@smite-marketplace
/plugin install smite-architect@smite-marketplace
/plugin install smite-economist@smite-marketplace
/plugin install smite-aura@smite-marketplace
/plugin install smite-constructor@smite-marketplace
/plugin install smite-gatekeeper@smite-marketplace
/plugin install smite-handover@smite-marketplace
/plugin install smite-surgeon@smite-marketplace
/plugin install smite-orchestrator@smite-marketplace

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
| **smite-analyst** | Code analysis and technical debt detection | Development | `/smite-analyst` |
| **smite-architect** | Software architecture and system design | Development | `/smite-architect` |
| **smite-economist** | Business model, profitability & revenue strategy | Development | `/smite-economist` |
| **smite-aura** | Design system and UI/UX component creation | Development | `/smite-aura` |
| **smite-constructor** | Implementation and coding | Development | `/smite-constructor` |
| **smite-gatekeeper** | Code review and quality assurance | Development | `/smite-gatekeeper` |
| **smite-handover** | Documentation and knowledge transfer | Development | `/smite-handover` |
| **smite-surgeon** | Surgical code refactoring and optimization | Development | `/smite-surgeon` |
| **smite-orchestrator** | Auto-orchestration, workflow tracking & technical debt detection | Development | `/smite-orchestrator` |

### 🔍 Quality & Documentation Plugins

| Plugin | Description | Category | Command |
|--------|-------------|----------|---------|
| **linter-sentinel** | Auto-fix ESLint, TypeScript, and Prettier violations | Quality | `*start-linter-sentinel --mode=fix` |
| **doc-maintainer** | Synchronize documentation with code changes | Documentation | `*start-doc-maintainer --mode=sync` |

---

## 🤖 Auto-Orchestration System

The **smite-orchestrator** plugin provides intelligent workflow coordination through automatic hooks:

### Features

- **Workflow State Tracking**: Automatically tracks agent execution and artifacts
- **Technical Debt Detection**: Scans code for anti-patterns (any types, console logs, TODOs, etc.)
- **Smart Suggestions**: Suggests next agent in workflow based on current state
- **Session Persistence**: Maintains workflow state across sessions
- **Non-Intrusive**: Provides suggestions without forcing actions

### How It Works

```
User executes agent → Hook detects completion → State updated → Next agent suggested
                        ↓
                   Technical debt scanned → Issues detected → Surgeon suggested
```

### Generated Artifacts

The orchestrator creates these files automatically:

- `.smite/orchestrator-state.json` - Current workflow state
- `.smite/workflow/session-info.md` - Workflow progress and artifacts
- `.smite/suggestions/next-action.md` - Next agent recommendation
- `.smite/suggestions/fix-surgeon.md` - Technical debt alerts
- `docs/MISSION_BRIEF_{AGENT}.md` - Handoff documents between agents

### Workflow Order

```
initializer → analyst → architect → economist → aura → constructor → gatekeeper → handover
```

### Performance

- **Overhead**: <0.1% per operation
- **Detection Speed**: <50ms for technical debt scanning
- **State Management**: <10ms for JSON operations

---

## 📖 Usage

### Starting a New Project with Auto-Orchestration

```bash
# 1. Start with initializer (auto-orchestration begins)
/smite-init

# After completion, orchestrator suggests next agent:
# "Next: /smite-analyst"

# 2. Continue with suggested agent
/smite-analyst

# Orchestrator tracks artifacts and suggests:
# "Next: /smite-architect"

# 3. Follow the workflow
/smite-architect
/smite-economist
/smite-aura
/smite-constructor
/smite-gatekeeper
/smite-handover

# Technical debt detected? Orchestrator suggests:
# "⚠️ Technical debt detected - run /smite-surgeon"
```

### Individual Plugin Installation

Install only what you need:

```bash
# For new projects
/plugin install smite-initializer@smite-marketplace

# For architecture decisions
/plugin install smite-architect@smite-marketplace

# For code quality
/plugin install linter-sentinel@smite-marketplace

# For documentation
/plugin install doc-maintainer@smite-marketplace
```

---

## 🔧 Orchestrator Scripts

The auto-orchestration system is built with **TypeScript** and includes:

### Core Scripts (scripts/)

- **state-manager.ts** - Workflow state management
- **session-init.ts** - Session initialization
- **track-artifacts.ts** - Artifact tracking and logging
- **agent-complete.ts** - Agent completion handler
- **detect-debt.ts** - Technical debt pattern detection
- **suggest-next.ts** - Next agent suggestion engine
- **generate-handoff.ts** - Handoff document generation
- **suggest-display.ts** - Suggestion display system

### Build System

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npm run watch
```

Compiled scripts are in `dist/` and used by hooks.

---

## 🏗️ Repository Structure

```
smite-marketplace/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace configuration
│
├── plugins/
│   ├── smite-initializer/            # Project initialization agent
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/initializer.md
│   │
│   ├── smite-analyst/                # Code analysis agent
│   ├── smite-architect/              # Architecture agent
│   ├── smite-economist/              # Technical debt management
│   ├── smite-aura/                   # Design system agent
│   ├── smite-constructor/            # Implementation agent
│   ├── smite-gatekeeper/             # Code review agent
│   ├── smite-handover/               # Documentation agent
│   ├── smite-surgeon/                # Refactoring agent
│   ├── smite-orchestrator/           # Auto-orchestration system
│   │   ├── scripts/                   # TypeScript source
│   │   ├── dist/                      # Compiled JavaScript
│   │   ├── tsconfig.json              # TypeScript config
│   │   └── package.json               # Build scripts
│   │
│   ├── linter-sentinel/              # Auto-fix linting agent
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/linter-sentinel.md
│   │
│   └── doc-maintainer/               # Documentation sync agent
│       ├── .claude-plugin/plugin.json
│       └── skills/doc-maintainer.md
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
- Specialized agents for each phase of software development
- From initialization to deployment
- **Auto-orchestrated workflow** with intelligent suggestions
- Automatic technical debt detection and tracking

### Quality
- Automated linting and type-safety enforcement
- Zero-debt code quality maintenance
- Real-time violation detection and fixing

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

**SMITE Marketplace v1.1.0**
*12 plugins available*
*Modular installation*
*Zero-debt development*
*Auto-orchestration with TypeScript*
*<0.1% performance overhead*
