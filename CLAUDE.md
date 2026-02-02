# 🚀 SMITE - Quick Reference

## 🎯 I'm here to...

- **Build features**: `/implement --epct` or `/implement --ralph`
- **Fix bugs**: `/refactor --scope=bug`
- **Explore code**: `/explore --mode=semantic` or `/toolkit search`
- **Design architecture**: `/architect`
- **Systematic implementation**: `/builder`
- **Note taking**: `/note write`

## 🔍 Mandatory Workflow

**CRITICAL: ALWAYS use semantic search before ANY code exploration.**

1. **ALWAYS** use `/toolkit search "query"` first (75% token savings, 2x precision)
2. **NEVER** use Grep/Glob first (wastes tokens)
3. **Spec-first**: Architect → Builder → Verify

**Why?** Traditional search: 180k tokens. Toolkit: 45k tokens. **75% savings.**

## 🛠️ Quick Commands

| Command | Purpose | When to use |
|---------|---------|-------------|
| `/architect "prompt"` | Architecture design | Design new systems/features |
| `/builder --tech=nextjs` | Tech-specific implementation | Systematic implementation |
| `/implement --epct` | 4-phase implementation | Complex features |
| `/implement --ralph` | Multi-agent orchestration | Large projects (2-3x speedup) |
| `/implement --quick` | Ultra-fast implementation | Small tasks |
| `/refactor --quick` | Quick refactoring | Code improvements |
| `/refactor --scope=bug` | Bug fixing | Any bug/issue |
| `/explore --mode=semantic` | Semantic code search | ALWAYS before exploring |
| `/note write inbox` | Quick note | Capture ideas/tasks |

## 📚 Documentation

- **All docs**: [docs/INDEX.md](docs/INDEX.md)
- **Plugins**: [plugins/README.md](plugins/README.md)
- **Agents**: [plugins/agents/README.md](plugins/agents/README.md)

## 🎯 Key Principles

- **Type-Safe**: Zod schemas, strict TypeScript
- **Clean Code**: DRY, immutable, pure functions
- **Barrel Exports**: One `index.ts` per folder
- **Zero-Debt**: Fix issues as you create them

## 📂 Project Standards

```
src/
├── validation/    # Zod schemas
├── components/ui/ # Shadcn atoms
├── core/          # Business logic
└── **/index.ts    # Barrels required
```

---
**Version**: 3.6.0 | **Last updated**: 2026-02-02
