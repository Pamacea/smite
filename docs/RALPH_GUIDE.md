# 🚀 SMITE v3.0 - Quick Start

**Zero-debt engineering agents with multi-agent parallel orchestration**

---

## ⚡ Quick Start (3 commands)

```bash
# Add the marketplace
/plugin marketplace add Pamacea/smite

# Install all agents
/plugin install explorer@smite architect@smite builder@smite finalize@smite ralph@smite

# Start building
/ralph "Build a task management app with authentication and real-time updates"
```

---

## 🎯 What is SMITE?

**SMITE** is a collection of 5 specialized agents for Claude Code that automate development workflows with **2-3x speedup** through parallel execution.

### Key Innovation: Ralph Multi-Agent

Unlike traditional tools that run sequentially, SMITE Ralph executes **multiple agents in parallel**:
- **Traditional:** Story 1 → Story 2 → Story 3 (12 min)
- **SMITE:** Story 1 → (Story 2 + Story 3) (9 min) **⚡ 25% faster**

---

## 📦 The 5 Agents

### 1. 🗺️ Explorer
**Codebase exploration and pattern discovery**

```bash
/explorer --task=map-architecture
```

**Use for:**
- Understanding existing codebases
- Finding dependencies
- Discovering patterns

---

### 2. 🏛️ Architect
**Design, strategy, initialization, and creative thinking**

```bash
/architect --mode=init "Build a SaaS dashboard"
/architect --mode=strategy "Define pricing strategy"
/architect --mode=design "Create modern minimalist UI"
/architect --mode=brainstorm "Improve user engagement"
```

**Use for:**
- Starting new projects
- Business strategy
- Design systems
- Creative problem-solving

---

### 3. 🔨 Builder
**Implementation with auto-detection**

```bash
/builder                # Auto-detects tech stack
/builder --tech=nextjs   # Force Next.js mode
/builder --tech=rust     # Force Rust mode
/builder --tech=python   # Force Python mode
```

**Use for:**
- Feature implementation
- Full-stack development
- API creation
- UI components

---

### 4. ✅ Finalize
**Unified QA, code review, refactoring, linting, and documentation**

```bash
/finalize                    # Full QA + Docs
/finalize --mode=qa           # QA only
/finalize --mode=qa --type=test|review|lint|perf|security
/finalize --mode=docs         # Docs only
```

**Use for:**
- Before commits
- Before PRs
- Quality assurance
- Documentation updates

---

### 5. 🔄 Ralph
**Multi-agent orchestrator with parallel execution**

```bash
/ralph execute .smite/prd.json
/ralph "Build a todo app with auth and filters"
/ralph status
/ralph cancel
```

**Use for:**
- Complete feature development
- Automated workflows
- Parallel execution
- PRD-based development

---

## 🚀 Usage Examples

### Example 1: New Project (Automated)

```bash
/ralph "Build a project management SaaS with:
- User authentication (JWT)
- Real-time collaboration (WebSocket)
- File attachments
- Email notifications
- Export to PDF"

→ Ralph automatically:
1. Generates PRD
2. Splits into user stories
3. Executes in parallel:
   - architect (design + strategy)
   - builder (backend + frontend)
   - finalize (QA + docs)
4. Complete in ~20 minutes
```

### Example 2: Feature Development

```bash
# Step 1: Design
/architect --mode=design "Create a modern dashboard layout"

# Step 2: Build
/builder --tech=nextjs

# Step 3: QA
/finalize
```

### Example 3: Quick Refactor

```bash
# Explore codebase
/explorer --task=find-debt

# Fix issues
/finalize --mode=qa --type=review
```

---

## 📊 What's New in v3.0

### Major Changes

- **13 agents → 5 agents** (62% reduction)
- **Multi-agent parallel execution** (2-3x faster)
- **Simplified naming** (explorer, architect, builder, finalize, ralph)
- **Unified workflows** (less confusion, more speed)

### Agent Mergers

| New Agent | Merged From |
|-----------|-------------|
| **architect** | initializer + strategist + aura + brainstorm |
| **builder** | constructor + router |
| **finalize** | gatekeeper + surgeon + linter-sentinel + handover + doc-maintainer |
| **ralph** | orchestrator (enhanced with parallel execution) |
| **explorer** | (unchanged) |

---

## 🎓 Best Practices

### 1. Use Ralph for Complete Features

```bash
# ✅ Good - Ralph handles everything
/ralph "Build a complete user authentication system"

# ❌ Bad - Manual sequencing
/architect --mode=init
/builder
/finalize
```

### 2. Use Specific Agents for Targeted Tasks

```bash
# ✅ Good - Specific task
/explorer --task=find-bottlenecks

# ❌ Bad - Overkill
/ralph "Find performance issues"
```

### 3. Always Finalize Before Commits

```bash
/builder
/finalize    # Always run this before committing
git commit
```

---

## 📚 Documentation

### Detailed Guides

- **[COMPLETE_GUIDE.md](./docs/COMPLETE_GUIDE.md)** - Full documentation
- **[RALPH_GUIDE.md](./docs/RALPH_GUIDE.md)** - Ralph deep dive
- **[AGENT_REFERENCE.md](./docs/AGENT_REFERENCE.md)** - All agents details

### Legacy Planning Docs

- `docs/legacy/RENOVATION_PLAN.md` - Original renovation plan
- `docs/legacy/FUSION_PLAN.md` - Agent fusion details
- `docs/legacy/RALPH_MULTI_AGENT_ARCHITECTURE.md` - Ralph architecture

---

## 🛠️ Installation

### From Marketplace

```bash
# Add marketplace
/plugin marketplace add Pamacea/smite

# List available plugins
/plugin list --marketplace=smite

# Install all agents
/plugin install explorer@smite
/plugin install architect@smite
/plugin install builder@smite
/plugin install finalize@smite
/plugin install ralph@smite
```

### Manual Installation

Clone this repository and copy plugins to your Claude Code plugins directory.

---

## 🤝 Contributing

SMITE is an open-source project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built by **Pamacea** for zero-debt engineering with Claude Code

**Inspired by:**
- Geoffrey Huntley's Ralph Wiggum technique
- Anthropic's Claude Code hooks system
- The smite-marketplace community

---

## 🎯 Quick Reference

| Task | Agent | Command |
|------|-------|---------|
| **New project** | Ralph | `/ralph "Build X"` |
| **Feature** | Builder | `/builder` |
| **Design** | Architect | `/architect --mode=design` |
| **Strategy** | Architect | `/architect --mode=strategy` |
| **QA** | Finalize | `/finalize` |
| **Docs** | Finalize | `/finalize --mode=docs` |
| **Explore** | Explorer | `/explorer` |

---

**SMITE v3.0**

_5 agents • Multi-agent parallel execution • 2-3x speedup • Zero-debt engineering_

📖 **[Complete Guide](./docs/COMPLETE_GUIDE.md)** for detailed usage.
