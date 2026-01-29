---
description: Systematic implementation with tech specialization and step-based workflow
argument-hint: [-e -d -i -t -v] [--tech=nextjs|rust|python|go] [--spec=<path>]
---

# /builder - Systematic Feature Implementation

Implement production-ready features with technology-specific best practices through a systematic 5-step workflow.

## 🎯 Builder Workflow

Systematic 5-step process for building production features:

```bash
# Complete workflow
/builder -e -d -i -t -v --tech=nextjs

# Step-by-step
/builder -e              # Step 1: Explore codebase
/builder -d              # Step 2: Design structure
/builder -i              # Step 3: Implement code
/builder -t              # Step 4: Write tests
/builder -v              # Step 5: Verify & validate

# Quick mode (all steps)
/builder --quick --tech=nextjs "Add user authentication"

# With spec file
/builder --spec=.claude/.smite/current_spec.md
```

## ⚠️ MANDATORY: Use Semantic Search First

**BEFORE implementing anything, you MUST:**

1. **Try `/toolkit search`** - Find similar code (75% token savings)
2. **Try `grepai search "similar feature"`** - Alternative semantic search
3. **ONLY then**: Manual Grep/Glob/Read

**NEVER start with manual tools - Always use semantic search!**

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md` | [github.com/yoanbernabeu/grepai](https://github.com/yoanbernabeu/grepai)

---

## Workflow Steps

### Step 1: Explore (`-e` or `--explore`)

Search the codebase for existing patterns and context.

**What it does:**
- Semantic search for similar features
- Identifies reusable components
- Documents codebase conventions
- Builds comprehensive context

**Output**: `.claude/.smite/builder-exploration.md`

```bash
/builder -e --tech=nextjs
```

### Step 2: Design (`-d` or `--design`)

Design the implementation structure and types.

**What it does:**
- Define file structure
- Create type definitions
- Design validation schemas
- Plan data flow and architecture

**Output**: `.claude/.smite/builder-design.md`

```bash
/builder -d
```

### Step 3: Implement (`-i` or `--implement`)

Write production code following the design.

**What it does:**
- Implement core logic
- Create components/UI
- Build API endpoints
- Add proper error handling

**Subagents**:
- `impl-nextjs` - React Server Components, Prisma, Server Actions
- `impl-rust` - Ownership patterns, async/await, zero-copy
- `impl-python` - Type hints, FastAPI, SQLAlchemy, asyncio
- `impl-go` - Goroutines, interfaces, standard library

```bash
/builder -i --tech=nextjs
```

### Step 4: Test (`-t` or `--test`)

Write comprehensive tests.

**What it does:**
- Unit tests for all functions
- Integration tests for workflows
- Component tests for UI
- Coverage targets (80%+)

**Output**: Comprehensive test suite

```bash
/builder -t
```

### Step 5: Verify (`-v` or `--verify`)

Run comprehensive verification.

**What it does:**
- Linting (ESLint/Clippy/flake8)
- Type checking (TypeScript/mypy)
- All tests (Vitest/cargo test/pytest)
- Build verification
- Smoke tests

**Output**: `.claude/.smite/builder-verification.md`

```bash
/builder -v
```

---

## Option Flags

### Workflow Flags

| Flag | Long Form | Purpose |
|------|-----------|---------|
| `-e` | `--explore` | Search codebase for patterns |
| `-d` | `--design` | Design structure and types |
| `-i` | `--implement` | Write production code |
| `-t` | `--test` | Write comprehensive tests |
| `-v` | `--verify` | Run verification checks |
| `--quick` | None | Run all steps automatically |
| `--full` | None | Complete workflow with pauses |

### Tech Stack Flags

| Flag | Purpose |
|------|---------|
| `--tech=nextjs` | React 19, Next.js 15, RSC, Prisma, Server Actions |
| `--tech=rust` | Tokio, Axum, SQLx, Serde, async/await |
| `--tech=python` | FastAPI, Pydantic, SQLAlchemy 2.0, asyncio |
| `--tech=go` | Goroutines, interfaces, standard library |

### Input Flags

| Flag | Purpose |
|------|---------|
| `--spec=<path>` | Use Architect spec file |
| `--feature=<name>` | Feature name for context |
| `--component=<name>` | Component name for context |

---

## Tech Specialization

### Next.js

**Patterns:**
- React Server Components (RSC) by default
- Server Actions for mutations
- Prisma for database
- TanStack Query for server state
- Shadcn UI for components
- Tailwind CSS for styling

**Example:**
```bash
/builder -e -d -i -t -v --tech=nextjs "Add user authentication"
```

### Rust

**Patterns:**
- Ownership and borrowing
- Async/await with tokio
- Error handling with Result<T, E>
- Zero-copy parsing where possible
- Derive macros for serialization

**Example:**
```bash
/builder -e -d -i -t -v --tech=rust "Implement async API handler"
```

### Python

**Patterns:**
- Type hints everywhere
- Pydantic for validation
- FastAPI for REST API
- SQLAlchemy 2.0 for database
- Async/await for I/O

**Example:**
```bash
/builder -e -d -i -t -v --tech=python "Create user endpoint"
```

### Go

**Patterns:**
- Interfaces for abstraction
- Goroutines for concurrency
- Context propagation
- Standard library preference
- Error handling with explicit checks

**Example:**
```bash
/builder -e -d -i -t -v --tech=go "Build WebSocket handler"
```

---

## Spec-First Mode

When `--spec` flag is provided:

1. **Read spec completely** - Load `.claude/.smite/current_spec.md`
2. **Follow steps EXACTLY** - Implement in order defined in spec
3. **DO NOT deviate** - If you need to do something different, update spec first
4. **Stop on logic gaps**:
   - STOP coding immediately
   - Report the gap clearly
   - Wait for spec to be updated
   - Only resume after spec is corrected

**Example:**
```bash
/builder -i --spec=.claude/.smite/current_spec.md
```

---

## Usage Examples

### Complete Workflow

```bash
# Next.js feature
/builder -e -d -i -t -v --tech=nextjs "Add user authentication"

# Step by step with review
/builder -e              # Explore patterns
/builder -d              # Design structure
/builder -i              # Implement code
/builder -t              # Write tests
/builder -v              # Verify everything
```

### Quick Mode

```bash
# Automatically run all steps
/builder --quick --tech=nextjs "Create blog post component"

# Equivalent to
/builder -e -d -i -t -v --tech=nextjs "Create blog post component"
```

### With Spec

```bash
# Implement from Architect spec
/builder --spec=.claude/.smite/current_spec.md
```

---

## Output Files

| File | Location | Purpose |
|------|----------|---------|
| Exploration | `.claude/.smite/builder-exploration.md` | Codebase patterns |
| Design | `.claude/.smite/builder-design.md` | Architecture plan |
| Verification | `.claude/.smite/builder-verification.md` | Quality report |

---

## Integration

**Works with:**
- /architect (spec generation)
- /refactor (code optimization)
- ralph (orchestration)

**Best used after:**
- /architect (for spec)

**Best used before:**
- /refactor (for optimization)
- /finalize (for QA)

---

## Documentation

See [docs/builder/](docs/builder/) for:
- [Complete Workflow Guide](docs/builder/BUILDER_WORKFLOW.md)
- [Step-by-Step Details](docs/builder/INDEX.md)
- [Tech Stack Patterns](steps/builder/)
- [Subagent Skills](skills/impl-*/)

---

## Version

**Version**: 2.0.0 | **Last Updated**: 2025-01-22
