---
description: Implementation with tech specialization & design mode
argument-hint: [--tech=nextjs|rust|python|go] [--design] [--feature=name] [--component=name]
---

Build features and components with technology-specific best practices.

## ⚠️ MANDATORY: Use Semantic Search First

**BEFORE implementing anything, you MUST:**

1. **Try `/toolkit search`** - Find similar code (75% token savings)
2. **Try `mgrep "similar feature"`** - Alternative semantic search
3. **ONLY then**: Manual Grep/Glob/Read

**NEVER start with manual tools - Always use semantic search!**

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md` | [mgrep.dev](https://www.mgrep.dev/)

---

**Tech Specialization:**

- `nextjs` - React Server Components, Prisma, PostgreSQL, Server Actions
- `rust` - Ownership, borrowing, async/await, zero-copy patterns
- `python` - Type hints, FastAPI, SQLAlchemy 2.0, asyncio
- `go` - Goroutines, interfaces, standard library

**Design Mode:**
Convert Figma designs and SVG to code components

**Spec-First Mode:**

When executing with a spec file (provided in prompt):

1. **Read the spec completely** - Read `.smite/current_spec.md` before writing any code
2. **Follow steps EXACTLY** - Implement in the order defined in the spec
3. **DO NOT deviate** - If you need to do something different, you must update the spec first
4. **Stop on logic gaps** - If you find a logical inconsistency or missing piece:
   - STOP coding immediately
   - Report the gap clearly
   - Wait for spec to be updated
   - Only resume after spec is corrected

**Output:**

- Production code with tests
- Documentation

**Toolkit Integration:**

When toolkit plugin is available, Builder can leverage:
- **Context Building** - 70-85% token savings via `ToolkitAPI.Context.build()` with surgeon mode
- **Impact Analysis** - Change impact assessment with `ToolkitAPI.Analysis.impact()`
- **Budget Enforcement** - Automatic token budget warnings
- **AST Signature Extraction** - Fast code understanding without full content

**Usage:**
/build --tech=nextjs --feature="authentication"
/build --tech=rust --component="api-handler"
/build --design --source="figma:file-id"
