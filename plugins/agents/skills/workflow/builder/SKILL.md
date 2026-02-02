# Builder Skill

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

Systematic feature implementation through a 5-step workflow with technology-specific best practices, following Spec-Lock Policy to prevent architecture drift.

## Core Workflow

1. **Explore** - Search codebase for patterns using semantic search
2. **Design** - Define structure, types, and architecture
3. **Implement** - Write production code with tech-specific patterns
4. **Test** - Comprehensive testing (unit, integration, coverage)
5. **Verify** - Linting, typecheck, build validation

## Key Principles

- **Spec-Lock**: Implement EXACTLY what Architect specified, no more/no less
- **Toolkit-first**: Always use semantic search before implementing (75% token savings)
- **Type-safe**: Zod validation, TypeScript strict mode, no `any` types
- **Framework patterns**: Follow tech stack best practices
- **Clean code**: DRY, immutable, pure functions, barrel exports

## Workflow Steps

### Step 1: Explore (`-e`)
Search the codebase using semantic search:
- `/toolkit search` for similar features
- `grepai` for pattern matching
- Document reusable components and utilities
- Identify codebase conventions

**Output**: `.claude/.smite/builder-exploration.md`

### Step 2: Design (`-d`)
Design the implementation:
- File structure and organization
- Type definitions and interfaces
- Validation schemas (Zod)
- Data flow and architecture
- Testing strategy

**Output**: `.claude/.smite/builder-design.md`

### Step 3: Implement (`-i`)
Write production code:
- Launch tech-specific subagent
- Follow design document
- Implement core logic, UI, API
- Add proper error handling
- Create barrel exports

**Subagents**:
- `impl-nextjs` - React 19, RSC, Prisma, Server Actions
- `impl-rust` - Ownership, async/await, zero-copy
- `impl-python` - Type hints, FastAPI, SQLAlchemy
- `impl-go` - Goroutines, interfaces, stdlib

### Step 4: Test (`-t`)
Write comprehensive tests:
- Unit tests for all functions
- Integration tests for workflows
- Component tests for UI
- Target: 80%+ coverage

**Output**: Complete test suite

### Step 5: Verify (`-v`)
Run comprehensive verification:
- Linting (ESLint/Clippy/flake8)
- Type checking (TypeScript/mypy)
- All tests (Vitest/cargo test/pytest)
- Build verification
- Smoke tests

**Output**: `.claude/.smite/builder-verification.md`

## Subagent Collaboration

### impl-nextjs Subagent
**Purpose**: Next.js implementation specialist

**Launched by**: Step 3 (`-i --tech=nextjs`)

**Capabilities**:
- React Server Components (RSC)
- Server Actions for mutations
- Prisma database operations
- TanStack Query for server state
- Shadcn UI components
- Tailwind CSS styling

**Patterns**:
- `app/` directory for routing
- `components/ui/` for Shadcn
- `lib/` for utilities
- `validation/` for Zod schemas
- Barrel exports (`index.ts`)

### impl-rust Subagent
**Purpose**: Rust implementation specialist

**Launched by**: Step 3 (`-i --tech=rust`)

**Capabilities**:
- Ownership and borrowing patterns
- Async/await with tokio
- Error handling with Result<T, E>
- Zero-copy parsing
- Derive macros for serialization

**Patterns**:
- `src/models/` for data structures
- `src/services/` for business logic
- `src/handlers/` for HTTP handlers
- `src/repositories/` for database
- Error types in `src/error.rs`

### impl-python Subagent
**Purpose**: Python implementation specialist

**Launched by**: Step 3 (`-i --tech=python`)

**Capabilities**:
- Type hints everywhere
- Pydantic for validation
- FastAPI for REST API
- SQLAlchemy 2.0 for database
- Async/await for I/O

**Patterns**:
- `src/models/` for Pydantic models
- `src/services/` for business logic
- `src/api/` for FastAPI routes
- `src/repositories/` for database
- `src/main.py` for application entry

### impl-go Subagent
**Purpose**: Go implementation specialist

**Launched by**: Step 3 (`-i --tech=go`)

**Capabilities**:
- Interfaces for abstraction
- Goroutines for concurrency
- Context propagation
- Standard library preference
- Explicit error handling

**Patterns**:
- `src/models/` for data structures
- `src/services/` for business logic
- `src/handlers/` for HTTP handlers
- `src/repository/` for database
- `src/main.go` for application entry

## Modes

### Quick Mode (`--quick`)
Automatically run all steps:
- Execute Explore → Design → Implement → Test → Verify
- No pauses between steps
- Full automation

### Full Mode (`-e -d -i -t -v`)
Complete workflow with control:
- Run each step sequentially
- Pause for review between steps
- Full control over implementation

### Step Mode
Execute individual steps:
- `-e` - Explore only
- `-d` - Design only
- `-i` - Implement only
- `-t` - Test only
- `-v` - Verify only

## Configuration

- **Spec location**: `.claude/.smite/current_spec.md`
- **Tech stack**: Auto-detect or `--tech` flag
- **Test framework**: Vitest (Next.js), cargo test (Rust), pytest (Python), go test (Go)
- **Coverage target**: 80%+

## Spec-Lock Policy

**CRITICAL**: When implementing from spec:

1. **Read spec completely** before writing code
2. **Follow steps EXACTLY** in order
3. **DO NOT deviate** - If spec is incomplete:
   - STOP coding immediately
   - Report the gap clearly
   - Wait for spec to be updated
   - Only resume after spec is corrected

## Integration

- **Requires**: architect (spec), toolkit (semantic search)
- **Reads from**: `.claude/.smite/current_spec.md`
- **Works with**: refactor (optimization), ralph (orchestration)
- **Best used after**: /architect
- **Best used before**: /refactor

## Toolkit Integration

When toolkit plugin is available:
- **Context Building** - 70-85% token savings via surgeon mode
- **Semantic Search** - Find existing patterns
- **Impact Analysis** - Understand change impact
- **AST Signature Extraction** - Fast code understanding

## Error Handling

- **Spec incomplete**: Stop and request Architect update
- **Tech stack unclear**: Auto-detect or use `--tech` flag
- **Pattern not found**: Use `/toolkit search` to find patterns
- **Typecheck fails**: Fix all errors before proceeding
- **Tests fail**: Fix all failures before verification

## Output Files

- `builder-exploration.md` - Codebase patterns and context
- `builder-design.md` - Architecture and structure plan
- `builder-verification.md` - Quality and verification report

## Success Criteria

- ✅ All steps completed
- ✅ Linting passes
- ✅ Type checking passes
- ✅ All tests passing
- ✅ Coverage 80%+
- ✅ Build successful
- ✅ No regressions

## Best Practices

1. **Always explore first** - Use semantic search to find patterns
2. **Design before coding** - Plan structure and types
3. **Follow tech patterns** - Use framework best practices
4. **Test thoroughly** - Unit, integration, component tests
5. **Verify everything** - Lint, typecheck, build, smoke tests

---
*Builder Skill v2.0.0 - Systematic implementation with 5-step workflow*
