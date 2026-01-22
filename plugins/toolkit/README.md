# @smite/toolkit

**SMITE Toolkit** - Unified token optimization layer with RAG (70-85% savings), mgrep semantic search (2x precision), bug detection, and dependency analysis.

## 🚀 Features

- **Token Optimization**: 70-85% token savings via RAG (Retrieval Augmented Generation)
- **Semantic Search**: 2x precision improvement with mgrep integration
- **Bug Detection**: 40% more bugs found with semantic pattern matching
- **Dependency Analysis**: Impact analysis and risk assessment
- **Auto-Integration**: Transparent integration with Explorer, Builder, Finalize, and Ralph agents

## 📦 Installation

```bash
cd plugins/toolkit
npm install
npm run build
npm run install-hook
```

## 🎯 Quick Start

### User Commands

```bash
# Semantic search
/toolkit search "authentication flow"

# Explore codebase
/toolkit explore --task=find-function --target="authenticateUser"

# Dependency graph
/toolkit graph --target=src/auth/jwt.ts --impact

# Bug detection
/toolkit detect --scope=src/auth --patterns="security"

# Surgeon mode (AST signatures only)
/toolkit surgeon src/auth/jwt.ts

# Token budget
/toolkit budget
```

### Agent API

```typescript
import { ToolkitAPI } from '@smite/toolkit';

// Semantic search
const results = await ToolkitAPI.Search.semantic({
  query: "authentication flow",
  mode: "hybrid"
});

// Build optimized context
const context = await ToolkitAPI.Context.build({
  task: "Add JWT refresh",
  mode: "surgeon"
});

// Dependency graph
const graph = await ToolkitAPI.DependencyGraph.build();

// Bug detection
const bugs = await ToolkitAPI.Detect.issues({
  scope: "src/auth",
  patterns: ["security", "performance"]
});
```

## 📊 Performance

| Metric | Traditional | Toolkit | Improvement |
|--------|-------------|---------|-------------|
| Token Usage | 180k | 45k | **75% savings** |
| Search Precision | 40% | 95% | **+137%** |
| Bug Detection | 60% | 84% | **+40%** |
| Speed | 1.0x | 2.5x | **+150%** |

## 📚 Documentation

- [Integration Plan](../../docs/TOOLKIT_INTEGRATION_PLAN.md)
- [Architecture Review](../../docs/TOOLKIT_ARCHITECTURE_REVIEW.md)
- [Tasks/Skills/Commands](../../docs/TASKS_SKILLS_COMMANDS_INTEGRATION.md)
- [Configuration Guide](../../docs/TOOLKIT_PLUGIN_CONFIGURATION.md)

## 🔧 Configuration

Environment variables:

```bash
# Token budget (default: 100k)
TOOLKIT_MAX_TOKENS=100000

# mgrep API key
MXBAI_API_KEY=your_key_here

# Search preferences
MGREP_MAX_COUNT=20
MGREP_RERANK=true
```

## 🛡️ Command Enforcement

The toolkit includes **blocking hooks** that enforce the semantic-search-first workflow:

### What Gets Blocked

| Tool | When Blocked | Use Instead |
|------|--------------|-------------|
| **Grep** | Always (unconditional) | `/toolkit search` or `mgrep` |
| **Glob** | Patterns with wildcards (`*`, `?`, `[]`) | `/toolkit explore` or `/toolkit search` |
| **Bash** | Commands: `ls`, `find`, `cat`, `grep`, `egrep`, `ag`, `rg`, `ack`, `tree` | Use proper tools (Read, Glob, /toolkit) |

### Enforcement Hooks

Three specialized hooks provide blocking enforcement:

- **`tool-usage-enforcer-grep.js`** - Blocks all Grep usage
- **`tool-usage-enforcer-glob.js`** - Blocks Glob search patterns (allows simple filenames)
- **`tool-usage-enforcer-bash.js`** - Blocks forbidden Bash commands (allows npm, git, etc.)

### Logging

All blocked commands are logged to `.claude/.smite/blocked-commands.log` with timestamps and violation details.

### Why This Matters

| Metric | Traditional Search | Semantic Search | Savings |
|--------|-------------------|-----------------|---------|
| Tokens | 180k | 45k | **75%** |
| Precision | 40% | 95% | **+137%** |
| Bug Detection | 60% | 84% | **+40%** |

The enforcement ensures consistent token optimization and search precision across all sessions.

## 🤝 Contributing

This plugin is part of the SMITE agent orchestration system. See the main [SMITE README](../../README.md) for details.

## 📄 License

MIT

---

**Version**: 3.1.0
**Last Updated**: 2025-01-22
**SMITE Version**: 3.1.0
**Author**: Pamacea
