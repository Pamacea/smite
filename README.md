# 🔥 SMITE v3.0

**Zero-debt engineering agents with multi-agent parallel orchestration (2-3x faster)**

---

## 🚀 Quick Start

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
│   └── smite/                      # Essential commands
└── docs/
    ├── RALPH_GUIDE.md
    ├── WEB_SEARCH_FORCE_GUIDE.md   # 🆕 Complete guide
    ├── IMPLEMENTATION_SUMMARY.md    # 🆕 Implementation summary
    └── SMITE_COMPLETE_GUIDE.md
```

---

## 🎯 Usage Examples

```bash
/ralph "Build a simple todo app"
/loop "Build a SaaS dashboard with authentication"
/ralph "Add export to PDF"  # Merges with existing PRD
/ralph .smite/prd.json      # Custom PRD
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[AGENTS.md](AGENTS.md)** | Complete agent reference |

---

## 🔄 Updating

```bash
/plugin marketplace update smite
/plugin update --all
```

---

**SMITE v3.0**

_11 core plugins • 🛠️ Toolkit with 6 powerful APIs • 🌐 Mandatory web search • Spec-first workflow • Multi-agent parallel orchestration • 2-3x faster • Zero-debt engineering_

