# @smite/implement - Unified Implementation Agent

> **UNIFIED** implementation agent - consollates ALL implementation approaches (internal workflows included)

## 🎯 Purpose

Provides THE unified entry point for ALL implementation tasks with **BUILT-IN WORKFLOWS** (no external plugins needed):

- **Quick Mode** (`--quick`) - Like `/oneshot` - Ultra-fast implementation
- **EPCT Mode** (`--epct`) - 4 phases structurées
- **Builder Mode** (`--builder`) - 5 steps with technical subagents
- **Predator Mode** (`--predator`) - 8 modular steps (internal workflow)
- **Ralph Mode** (`--ralph`) - Parallel orchestration (internal workflow)

**Goal:** ONE command (`/implement`) with ALL workflows built-in - no external dependencies.

## 🚀 Quick Start

```bash
# 1. Install plugin
/plugin install implement@smite

# 2. Quick implementation (like /oneshot)
/implement --quick "Add user profile page"

# 3. Structured 4-phase (like /epct)
/implement --epct "Build a complete dashboard"

# 4. Technical 5-step (like /builder)
/implement --builder --tech=nextjs "Add authentication"

# 5. Modular 8-step (like /predator)
/implement --predator "Implement shopping cart"

# 6. Parallel orchestration (like /ralph)
/implement --ralph "Build full SaaS platform"
```

## 📖 Usage

### Mode Selection

| Mode | Description | Like | Best For | Speed |
|------|-------------|-------|----------|-------|
| `--quick` | Ultra-fast, no planning | `/oneshot` | Quick features, bug fixes | ⚡⚡⚡ |
| `--epct` | 4 phases: Explore → Plan → Code → Test | `/epct` | Complex features, thorough | ⚡⚡ |
| `--builder` | 5 steps: Explore → Design → Implement → Test → Verify | `/builder` | Tech-specific implementation | ⚡ |
| `--predator` | 8 modular steps (internal workflow) | `/predator` | Systematic workflow, quality gates | ⚡ |
| `--ralph` | Parallel orchestration (internal workflow) | `/ralph/feature` | Large projects, multiple stories | ⚡⚡ |

### --quick (Quick Mode)

**Like:** `/oneshot` - Ultra-fast implementation

**Workflow:**
```
EXPLORE (5-10 min max)
  - 1-2 parallel subagents max
  - Be surgical - know exactly what to search for
  - NO PLANNING PHASE

CODE (implement immediately)
  - Start coding as soon as basic context available
  - Follow existing codebase patterns
  - STRICTLY in scope
  - NO comments unless necessary
  - NO refactoring beyond requirements
  - Run autoformatting

TEST (validate quality)
  - Run: lint + typecheck (or equivalent)
  - Fix errors immediately
  - Stay in scope
```

**Best for:** Well-defined, small features, bug fixes, UI tweaks

**Time:** 5-10 minutes max

### --epct (4-Phase Structured Mode)

**Like:** `/epct` - Systematic 4-phase implementation

**Workflow:**
```
1. EXPLORE (15-20 min)
   - Deep codebase exploration
   - Multi-source research
   - Parallel subagents
   - Output: exploration.md

2. PLAN (20-30 min)
   - Detailed implementation plan
   - File structure
   - Types and interfaces
   - Testing strategy
   - Output: plan.md

3. CODE (30-60 min)
   - Implement following plan
   - Best practices
   - Barrel exports
   - Output: implementation

4. TEST (15-30 min)
   - Full test suite
   - Unit, integration, E2E
   - Coverage measurement
   - Output: test-results.md
```

**Best for:** Complex features (3-5 files), thorough implementation

**Time:** 60-90 minutes

### --builder (Technical 5-Step Mode)

**Like:** `/builder` - 5 steps with technical specialization

**Workflow:**
```
1. EXPLORE (5-10 min)
   - Use /explore --mode=quick
   - Document patterns
   - Output: builder-exploration.md

2. DESIGN (15-20 min)
   - File structure
   - Type definitions
   - Zod validation schemas
   - Data flow
   - Architecture
   - Output: builder-design.md

3. IMPLEMENT (30-45 min)
   - Follow tech-specific subagent:
     - impl-nextjs - React 19, RSC, Prisma
     - impl-rust - Ownership, async/await
     - impl-python - Type hints, FastAPI
     - impl-go - Goroutines, interfaces
   - Barrel exports
   - Output: implementation

4. TEST (15-30 min)
   - Unit tests
   - Integration tests
   - Coverage 80%+
   - Output: test suite

5. VERIFY (10-15 min)
   - Linting
   - Type checking
   - Build verification
   - Smoke tests
   - Output: builder-verification.md
```

**Tech Stacks:**
- `--tech=nextjs` - React 19, RSC, Prisma, Server Actions
- `--tech=rust` - Ownership, async/await, zero-copy
- `--tech=python` - Type hints, FastAPI, SQLAlchemy 2.0
- `--tech=go` - Goroutines, interfaces, standard library

**Best for:** Tech-specific implementation, framework best practices

**Time:** 60-90 minutes

### --predator (Modular 8-Step Mode)

**Internal workflow - 8 modular steps loaded on-demand**

**Workflow:**
```
00_INIT → 01_ANALYZE → 02_PLAN → 03_EXECUTE → 04_VALIDATE → 05_EXAMINE → 06_RESOLVE → 07_FINISH

Steps loaded on-demand for token optimization
```

**Best for:** Systematic workflow, quality gates, comprehensive validation

**Time:** 60-120 minutes

### --ralph (Parallel Orchestration Mode)

**Internal workflow - Parallel execution of independent stories**

**Workflow:**
```
1. Generate PRD from natural language
2. Parse into user stories
3. Build dependency graph
4. Execute independent stories in parallel (2-3x speedup)
5. Track progress and commit
```

**Best for:** Large projects, multiple independent components, SaaS platforms

**Time:** Variable (2-3x faster than sequential)

## 🔧 Technical Subagents

| Subagent | Tech Stack | Purpose |
|----------|-----------|---------|
| `impl-nextjs` | React 19, RSC, Prisma, Server Actions | Next.js implementation |
| `impl-rust` | Ownership, async/await, zero-copy | Rust implementation |
| `impl-python` | Type hints, FastAPI, SQLAlchemy 2.0 | Python implementation |
| `impl-go` | Goroutines, interfaces, standard library | Go implementation |

## 🔍 Integration

### With Explore

All modes use `/explore` for context gathering:

```bash
# Quick exploration
/implement --quick
  -> Uses: /explore --mode=quick

# Deep exploration
/implement --epct
  -> Uses: /explore --mode=deep

# Pattern search
/implement --builder
  -> Uses: /explore --type=code
```

### With Refactor

After implementation, use `/refactor` for quality:

```bash
# Quick refactor
/refactor --quick

# Full refactor
/refactor --full
```

## 📊 Comparison Table

| Aspect | Quick | EPCT | Builder | Predator | Ralph |
|--------|-------|------|---------|----------|-------|
| Planning | None | Detailed | Detailed | Steps 1-2 | Auto-PRD |
| Exploration | Surgical | Deep | Pattern | Steps 1-2 | Per story |
| Implementation | Immediate | Structured | Tech-specific | Step 3 | Parallel |
| Testing | Lint+Typecheck | Full suite | 80%+ | Step 4 | Per story |
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡ | ⚡ | ⚡ |
| Quality | Good | Excellent | High | High | High |
| Scope | Small | Medium | Large | Large | Very Large |

## 📝 Examples

### Quick Implementation

```bash
# Like /oneshot
/implement --quick "Add dark mode toggle to settings"

# Bug fix
/implement --quick "Fix login button alignment"
```

### Structured 4-Phase

```bash
# Like /epct
/implement --epct "Build a complete dashboard with charts and filters"
```

### Technical Implementation

```bash
# Like /builder with Next.js
/implement --builder --tech=nextjs "Add authentication"

# Like /builder with Rust
/implement --builder --tech=rust "Build high-performance processor"
```

### Modular 8-Step

```bash
# Like /predator
/implement --predator "Implement shopping cart with persistence"

# With adversarial review
/implement --predator --examine "Critical payment system"
```

### Parallel Orchestration

```bash
# Like /ralph
/implement --ralph "Build full SaaS platform"
```

## 🔧 Configuration

Config file: `.claude/.smite/implement.json`

```json
{
  "defaults": {
    "mode": "builder",
    "techStack": "detect",
    "timeLimit": "60m",
    "autoCommit": true
  },
  "modes": {
    "quick": {
      "timeLimit": "10m",
      "skipPlanning": true
    },
    "epct": {
      "phases": ["explore", "plan", "code", "test"],
      "timePerPhase": "20m"
    },
    "builder": {
      "steps": ["explore", "design", "implement", "test", "verify"],
      "techStacks": ["nextjs", "rust", "python", "go"]
    },
    "predator": {
      "steps": ["init", "analyze", "plan", "execute", "validate", "examine", "resolve", "finish"],
      "loadOnDemand": true
    },
    "ralph": {
      "parallel": true,
      "maxParallel": 3,
      "autoGeneratePRD": true
    }
  },
  "techStacks": {
    "nextjs": {
      "description": "React 19, RSC, Prisma, Server Actions",
      "patterns": ["app/", "components/ui/", "lib/", "validation/"]
    },
    "rust": {
      "description": "Ownership, async/await, zero-copy",
      "patterns": ["src/models/", "src/services/", "src/handlers/", "src/repositories/", "src/error.rs"]
    },
    "python": {
      "description": "Type hints, FastAPI, SQLAlchemy 2.0",
      "patterns": ["src/models/", "src/services/", "src/api/", "src/repositories/", "src/main.py"]
    },
    "go": {
      "description": "Goroutines, interfaces, standard library",
      "patterns": ["src/models/", "src/services/", "src/handlers/", "src/repository/", "src/main.go"]
    },
    "detect": {
      "description": "Auto-detect from package.json and file patterns",
      "patterns": {
        "nextjs": ["package.json", "next.config.js", "src/app/", "components/"],
        "rust": ["Cargo.toml", "src/main.rs", "src/lib.rs"],
        "python": ["requirements.txt", "setup.py", "src/main.py", "src/api/"],
        "go": ["go.mod", "src/main.go", "src/lib/"]
      }
    }
  }
}
```

## 📝 Migration Guide

### From /oneshot

**Old:**
```bash
/oneshot "Add user profile page"
```

**New:**
```bash
/implement --quick "Add user profile page"
```

### From /epct

**Old:**
```bash
/epct "Build a complete dashboard"
```

**New:**
```bash
/implement --epct "Build a complete dashboard"
```

### From /builder

**Old:**
```bash
/builder --tech=nextjs --feature="authentication"
```

**New:**
```bash
/implement --builder --tech=nextjs "Add authentication"
```

### From /predator

**Old:**
```bash
/predator "Implement shopping cart"
```

**New:**
```bash
/implement --predator "Implement shopping cart"
```

### From /ralph/feature

**Old:**
```bash
/ralph "Build full SaaS platform"
```

**New:**
```bash
/implement --ralph "Build full SaaS platform"
```

## 🚨 Removed Plugins

The following plugins have been **DELETED** as they are now fully integrated into `/implement`:

| Plugin | Reason | Replacement |
|--------|--------|------------|
| `/oneshot` | Simple quick implementation | `/implement --quick` |
| `/epct` | 4-phase structured implementation | `/implement --epct` |
| `/builder` | Technical 5-step implementation | `/implement --builder` |
| `/predator` | Modular 8-step workflow | `/implement --predator` |
| `/ralph` | Parallel orchestration | `/implement --ralph` |

## 🎯 Decision Guide

### Quick Decision Tree

```
Need to implement?
├─ Quick fix/small feature? → /implement --quick
├─ Complex feature (3-5 files)? → /implement --epct
├─ Tech-specific implementation? → /implement --builder --tech=nextjs|rust|python|go
├─ Quality-critical feature? → /implement --predator
└─ Large project (multiple stories)? → /implement --ralph
```

## 📚 Documentation

- **[Complete Guide](../../docs/IMPLEMENT_GUIDE.md)** - Complete implementation guide
- **[Mode Documentation](MODES.md)** - Detailed mode documentation
- **[Examples](examples/)** - Sample implementations
- **[Migration Guide](MIGRATION.md)** - Migrating from all old agents

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue at:
https://github.com/Pamacea/smite/issues

## 📄 License

MIT License - see LICENSE file for details.

---

**Version:** 1.0.0
**Last Updated:** 2025-02-01
**SMITE Version:** 3.2.0
**Author:** Pamacea
