# 🔥 SMITE v3.0

**Zero-debt engineering agents with multi-agent parallel orchestration (2-3x faster)**

---

## ⚡ QUICK START - LIRE AVANT TOUT

```bash
# ÉTAPE 1 : Toujours RECHERCHE SÉMANTIQUE (OBLIGATOIRE)
/toolkit search "votre recherche"    # 1er choix : 75% économie, 2x précision
mgrep "votre recherche"              # 2e choix : Alternative sémantique

# ÉTAPE 2 : Si échec, demander permission pour Grep/Glob
# "Toolkit et mgrep indisponibles, puis-je utiliser Grep ?"

# ÉTAPE 3 : Pour workflows complexes
/ralph "votre tâche complexe"
```

**Pourquoi la recherche sémantique en priorité ?**
- ✅ **75% d'économie de tokens** (180k → 45k)
- ✅ **2x plus précis** que grep (40% → 95%)
- ✅ **Compréhension naturelle** vs regex compliqués
- ✅ **Fonctionne sur code + PDFs + images** (mgrep)

**Voir :** [`docs/DECISION_TREE.md`](docs/DECISION_TREE.md) | [`AGENTS.md`](AGENTS.md) | [mgrep.dev](https://www.mgrep.dev/)

---

## 🚀 Installation

```bash
# Install (2 commands)
/plugin marketplace add Pamacea/smite
/plugin install ralph@smite

# Execute
/loop "Build a todo app with authentication"
```

---

## 🎯 What's New in v3.0

### 🌐 Mandatory Web Search & Documentation Reading 🆕

**Agents MUST verify knowledge before coding** - eliminates hallucinations and outdated code.

**Features:**
- 🔍 Automatic web search for libraries released after January 2024
- 📚 Mandatory official documentation reading
- ✅ Source citation in all responses
- 🛡️ 3-layer defense system (Rules → Agents → Hooks)

**Impact:**
- 70-90% reduction in bugs from outdated knowledge
- 100% verification of recent library versions
- Code matches current best practices

**See:** [docs/WEB_SEARCH_FORCE_GUIDE.md](docs/WEB_SEARCH_FORCE_GUIDE.md)

### 🧠 Spec-First Pattern ⭐

Agents think before coding - generate spec → validate logic → execute.

**Workflow:**
1. 📋 Generate `.smite/current_spec.md`
2. ✅ Validate coherence
3. 🔨 Execute with approved spec
4. 🔒 Lock on logic gaps

**Manual usage:** `/spec "Implement user authentication"`

### 🔥 PRD Accumulation

`/ralph` adds stories instead of overwriting - never lose progress!

### ⚡ Multi-Agent Parallel

```
Story 1 → (Story 2 + Story 3) → Story 4 = 25% faster (2-3x with 10+ stories)
```

---

## 🤖 Core Agents

### **ralph** - Multi-Agent Orchestrator ⭐

```bash
/ralph "Build a REST API with Node.js and PostgreSQL"
/loop "Build a full SaaS platform"  # Auto-iterating
```

**Features:** Auto-PRD • Spec-first ⭐ • Spec-validation ⭐ • Lock mechanism ⭐ • PRD accumulation • Parallel batches • Auto-loop

**See:** [docs/RALPH_GUIDE.md](docs/RALPH_GUIDE.md)

### **explorer** - Codebase Analysis

```bash
/explorer --task=map-architecture
/explorer --task=find-patterns
```

### **architect** - Design & Strategy

```bash
/architect --mode=init "Setup Next.js project"
/architect --mode=strategy "Product roadmap"
/architect --mode=design "Design system spec"
/architect --mode=brainstorm "Solve X problem"
```

### **builder** - Implementation

```bash
/builder "Implement user authentication"  # Auto-detects
/builder --tech=nextjs "Build dashboard"
```

### **finalize** - QA & Documentation

```bash
/finalize                    # Full QA + Docs
/finalize --mode=qa --type=test
/finalize --mode=docs --type=readme
```

### **simplifier** - Code Simplification ⭐

```bash
/simplifier                   # Recent changes
/simplifier --scope=file src/components/Button.tsx
/simplifier --scope=all       # Entire project
```

### **statusline** - Auto-Configuring Statusline 🎨

```bash
/plugin install statusline@smite
```

Display: `main • $0.15 • 3m0s • [████████░░] 11%`

### **toolkit** - Code Analysis & Optimization 🛠️ 🆕

```bash
/plugin install toolkit@smite
```

**Powerful tools for intelligent code analysis:**

- 🔍 **Unified Search Router** - Auto-selects best search strategy (semantic, literal, hybrid, RAG)
- 📊 **Code Search API** - Search codebases with multiple output formats
- 🧠 **Semantic Analysis** - Similarity scoring, clustering, pattern detection
- 🐛 **Bug Detection** - Automated pattern matching with severity classification
- ✨ **Refactoring** - Code simplification, dead code elimination, structure optimization
- 📝 **Documentation Generation** - Auto-generate JSDoc, README, and API docs

**Features:**
- Token optimization with RAG
- AST-based code extraction
- Semantic caching with similarity matching
- Multi-strategy search routing
- Type-safe APIs throughout

**User Commands:**
```bash
# Semantic search (60-87% token savings)
/toolkit search "authentication flow" --mode=hybrid

# Explore codebase intelligently
/toolkit explore --task=find-function --target="authenticateUser"

# Analyze dependencies
/toolkit graph --target=src/auth/jwt.ts --impact

# Detect bugs (40% more bugs found)
/toolkit detect --scope=src/auth --patterns="security"

# Check token budget
/toolkit budget
```

### **quality-gate** - Code Quality Validation 🛡️ 🆕

```bash
/quality-gate:quality-check              # Check all files
/quality-gate:quality-check --staged     # Only staged files
/quality-gate:quality-check --changed    # Only modified files
/quality-gate:docs-sync                  # Update documentation
```

**Automated code quality validation with complexity, security, and semantic checks:**

- 🔍 **Complexity Analysis** - Cyclomatic & cognitive complexity, nesting depth, function length
- 🛡️ **Security Scanning** - SQL injection, XSS, weak crypto, hardcoded secrets
- 📝 **Semantic Checks** - Type consistency, naming conventions, duplicate code
- ✅ **Test Validation** - Integrated test runner with Jest, Vitest, Mocha, pytest
- 📚 **Documentation Automation** - Auto-sync OpenAPI specs, README, JSDoc

**Features:**
- Pre-commit hook integration
- Configurable thresholds per project
- Batch processing for large codebases
- Memory-efficient (8GB default, scalable)
- Excludes node_modules, .next, dist, build artifacts

**Configuration:** `.claude/.smite/quality.json`
```json
{
  "enabled": true,
  "exclude": ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  "complexity": {
    "maxCyclomaticComplexity": 10,
    "maxCognitiveComplexity": 15
  },
  "performance": {
    "maxMemoryMB": 8192,
    "batchSize": 10
  }
}
```

**See:** [docs/plugins/quality-gate/](docs/plugins/quality-gate/)

### **smite** - Essential Commands ⚡

```bash
/plugin install smite@smite
/oneshot "Add user login"     # Ultra-fast (Explore → Code → Test)
/spec "Implement feature"     # Spec-first workflow ⭐
/explore "How does auth work?"
/debug "Fix memory leak"
/commit
```

---

## 📊 Ralph PRD Format

```json
{
  "project": "TodoApp",
  "userStories": [
    {
      "id": "US-001",
      "title": "Setup Next.js project",
      "agent": "architect:task",
      "dependencies": [],
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Build task list UI",
      "agent": "builder:task",
      "dependencies": ["US-001"],
      "passes": false
    }
  ]
}
```

**Execution Flow:** `Batch 1: [US-001] → Batch 2: [US-002, US-003] ← PARALLEL! → Batch 3: [US-004]`

---

## 📁 File Structure

```
smite/
├── .claude/
│   ├── rules/
│   │   └── knowledge-verification.md  # 🆕 Mandatory search protocol
│   └── settings.global.json           # 🆕 System hooks
├── .smite/
│   ├── prd.json                    # Current PRD
│   ├── current_spec.md             # Active spec ⭐
│   ├── spec-lock.json              # Lock state ⭐
│   ├── specs/                      # Archived specs ⭐
│   └── ralph-state.json            # Execution state
├── plugins/
│   ├── ralph/                      # Orchestrator
│   ├── explorer/                   # Codebase analysis
│   ├── architect/                  # Design + strategy
│   ├── builder/                    # Implementation
│   ├── simplifier/                 # Code simplification
│   ├── finalize/                   # QA + docs
│   ├── statusline/                 # Statusline
│   ├── toolkit/                    # 🆕 Code analysis & optimization
│   ├── smite/                      # Essential commands
│   ├── quality-gate/               # 🆕 Code quality validation
│   └── docs-editor-mcp/            # 🆕 Documentation automation
└── docs/                           # 📖 Central documentation
    ├── INDEX.md                    # Documentation hub
    ├── plugins/                    # Plugin documentation
    │   ├── ralph/
    │   ├── explorer/
    │   ├── architect/
    │   ├── builder/
    │   ├── finalize/
    │   ├── simplifier/
    │   ├── smite/
    │   ├── toolkit/
    │   ├── statusline/
    │   ├── quality-gate/
    │   └── docs-editor-mcp/
    ├── architecture/               # System architecture
    │   ├── architecture-code-critiquer.md
    │   └── architecture-docs-editor-mcp.md
    ├── DECISION_TREE.md            # Tool selection guide
    └── RALPH_GUIDE.md              # Ralph orchestrator guide
```

---

## 🎯 Usage Examples

```bash
/ralph "Build a simple todo app"
/loop "Build a SaaS dashboard with authentication"
/ralph "Add export to PDF"  # Merges with existing PRD
/ralph .claude/.smite/prd.json      # Custom PRD
```

---

## 📚 Documentation

**📖 [Documentation Hub](docs/INDEX.md)** - Complete documentation index

| Document | Description |
|----------|-------------|
| **[AGENTS.md](AGENTS.md)** | Complete agent reference |
| **[docs/INDEX.md](docs/INDEX.md)** | All documentation organized by topic |

---

## 🔄 Updating

```bash
/plugin marketplace update smite
/plugin update --all
```

---

**SMITE v3.0**

_13 core plugins • 🛠️ Toolkit with 6 powerful APIs • 🌐 Mandatory web search • Spec-first workflow • Multi-agent parallel orchestration • 2-3x faster • Zero-debt engineering_
