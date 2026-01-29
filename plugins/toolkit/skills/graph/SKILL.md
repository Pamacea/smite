---
name: graph
description: Dependency analysis and impact graph for understanding code relationships
version: 1.1.0
---

# Graph Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Build and analyze dependency graphs to understand code relationships, assess change impact, and identify architectural patterns through AST-based analysis.

## Core Workflow

1. **Input**: Target file, directory, or pattern
2. **Process**:
   - Parse AST to extract imports/exports
   - Build dependency graph
   - Analyze transitive dependencies
   - Generate impact report
3. **Output**: Dependency graph with risk assessment

## Key Principles

- **AST-Based**: Uses actual code parsing, not text search
- **Transitive**: Follows dependency chains completely
- **Risk Assessment**: Quantifies impact of changes
- **Visual**: Provides clear relationship visualization

## Graph Types

| Type | Description | Use Case |
|------|-------------|----------|
| **dependencies** | What this file depends on | "What do I need to test?" |
| **dependents** | What depends on this file | "Who will break if I change this?" |
| **impact** | Full impact analysis | "What's the blast radius?" |
| **cycle** | Detect circular dependencies | "Find architectural issues" |

## Usage

```bash
# Show what a file depends on
/toolkit graph --target=src/auth/jwt.ts

# Show impact analysis
/toolkit graph --target=src/auth/jwt.ts --impact

# Find circular dependencies
/toolkit graph --target=src/ --cycle

# Graph a directory
/toolkit graph --target=src/services --depth=2

# Export as JSON
/toolkit graph --target=src/auth --output=json
```

## Output Format

### Dependency Graph (default)
```
┌─────────────────────────────────────────────────────────┐
│ Dependency Graph: src/auth/jwt.ts                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  src/auth/jwt.ts                                       │
│     │                                                   │
│     ├─→ jsonwebtoken (external)                        │
│     ├─→ src/config/env.ts                              │
│     │     └─→ dotenv (external)                        │
│     └─→ src/types/user.ts                              │
│           └─→ zod (external)                           │
│                                                         │
│  Depth: 3 levels                                       │
│  External deps: 3                                      │
│  Internal deps: 2                                      │
└─────────────────────────────────────────────────────────┘
```

### Impact Analysis
```
┌─────────────────────────────────────────────────────────┐
│ Impact Analysis: src/auth/jwt.ts                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  RISK LEVEL: 🔴 HIGH (12 dependents)                   │
│                                                         │
│  Direct Dependents (4):                                │
│  • src/middleware/auth.ts - requireAuth()              │
│  • src/controllers/user.ts - login(), refresh()        │
│  • src/controllers/session.ts - validateSession()       │
│  • src/tests/auth.test.ts - test suite                 │
│                                                         │
│  Transitive Dependents (8):                            │
│  • src/routes/user.routes.ts                           │
│  • src/routes/api.routes.ts                            │
│  • src/handlers/profile.handler.ts                     │
│  • ... (4 more)                                        │
│                                                         │
│  Recommended Actions:                                  │
│  • Run full test suite after changes                   │
│  • Check middleware integration                         │
│  • Verify session handling                             │
└─────────────────────────────────────────────────────────┘
```

## Integration

- **Works with**: refactor for safe code changes
- **Required by**: architect for impact assessment
- **Requires**: TypeScript/JavaScript AST parser
- **Best used before**: Any refactoring or deletion

## Configuration

- `--depth <n>` - Maximum dependency depth (default: 5)
- `--output <format>` - Output format: tree, table, json, dot
- `--scope <dir>` - Limit graph to directory
- `--include-external` - Include npm dependencies

## Error Handling

- **File not found**: Suggests similar files
- **Parse error**: Reports syntax issues and location
- **Circular dependency**: Highlights cycle and suggests resolution
- **Too large**: Suggestes limiting depth or scope

## Performance

| Project Size | Traditional | Graph | Speedup |
|--------------|-------------|-------|---------|
| Small (<100 files) | 5 min | 30 sec | 10x |
| Medium (100-500) | 20 min | 2 min | 10x |
| Large (>500) | 60 min | 5 min | 12x |

## Use Cases

### Before Refactoring
```bash
/toolkit graph --target=src/services/user.ts --impact
```
Know exactly what will be affected before changing code.

### After Adding Feature
```bash
/toolkit graph --target=src/ --cycle
```
Ensure no circular dependencies were introduced.

### For Documentation
```bash
/toolkit graph --target=src/modules/payment --output=dot
```
Generate visual diagrams for architecture docs.

---
*Graph Skill v1.1.0 - Dependency analysis and impact assessment*
