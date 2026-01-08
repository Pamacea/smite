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
| **smite-economist** | Technical debt optimization and cost management | Development | `/smite-economist` |
| **smite-aura** | Design system and UI/UX component creation | Development | `/smite-aura` |
| **smite-constructor** | Implementation and coding | Development | `/smite-constructor` |
| **smite-gatekeeper** | Code review and quality assurance | Development | `/smite-gatekeeper` |
| **smite-handover** | Documentation and knowledge transfer | Development | `/smite-handover` |
| **smite-surgeon** | Surgical code refactoring and optimization | Development | `/smite-surgeon` |
| **smite-orchestrator** | Multi-agent coordination and workflow management | Development | `/smite-orchestrator` |

### 🔍 Quality & Documentation Plugins

| Plugin | Description | Category | Command |
|--------|-------------|----------|---------|
| **linter-sentinel** | Auto-fix ESLint, TypeScript, and Prettier violations | Quality | `*start-linter-sentinel --mode=fix` |
| **doc-maintainer** | Synchronize documentation with code changes | Documentation | `*start-doc-maintainer --mode=sync` |

---

## 📖 Usage

### Starting a New Project

```bash
# 1. Initialize a new project with SMITE
/smite-init

# 2. Define your architecture
/smite-architect

# 3. Create your design system
/smite-aura

# 4. Implement features
/smite-constructor

# 5. Review code quality
/smite-gatekeeper

# 6. Maintain documentation
/smite--doc-maintainer --mode=sync

# 7. Fix linting issues
/smite-linter-sentinel --mode=fix
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
│   ├── smite-orchestrator/           # Workflow orchestration
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
- Coordinate together for complete project lifecycle

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

**SMITE Marketplace v1.0.0**
*12 plugins available*
*Modular installation*
*Zero-debt development*
