# Build Skill - Reference Documentation

**Version:** 3.1.0 | **Complete flag documentation**

---

## Table of Contents

- [Flag Details](#flag-details)
- [Auto-Detection System](#auto-detection-system)
- [Subagent Auto-Activation](#subagent-auto-activation)
- [Flag Combinations](#flag-combinations)
- [Memory Integration](#memory-integration)
- [Progress Tracking](#progress-tracking)
- [Best Practices Checklist](#best-practices-checklist)
- [Technical Subagents](#technical-subagents)
- [Integration with Other Skills](#integration-with-other-skills)
- [Legacy Compatibility](#legacy-compatibility)

---

## Flag Details

### --clean (Delete-First Mode)

**Philosophy:** Best code is no code - delete before adding

**Workflow:**
```
EXPLORE (delete-focused, 10 min)
  - Search for existing implementations
  - Count occurrences of similar code
  - Identify what can be removed
  - Find components to compose

PLAN (minimal)
  - List deletions planned
  - List additions after deletions
  - Verify nothing breaks

CODE (delete-first, 20-30 min)
  1. DELETE first:
     - Remove duplicated code
     - Delete unused components
     - Simplify abstractions
  2. THEN add:
     - Implement new feature
     - Compose existing components
     - Use variant props

TEST (verify)
  - Verify nothing broke
  - Test new implementation
  - Measure code reduction
```

**Success Criteria:**
- Net code reduction (removed > added)
- Zero duplication
- Tests passing
- No regressions

---

### --test (TDD Mode)

**Philosophy:** Tests first, implementation second

**Workflow:**
```
PLAN (test specs)
  - Define test scenarios
  - Specify acceptance criteria
  - Set coverage targets

CODE - RED (5-10 min)
  - Write failing tests first
  - Describe behavior, not implementation
  - Test edge cases

CODE - GREEN (15-30 min)
  - Implement minimum to pass tests
  - No extra code
  - Make tests pass one by one

CODE - REFACTOR (if needed)
  - Clean up implementation
  - Keep tests green
  - Extract abstractions

TEST (coverage)
  - Verify coverage >= 80%
  - All tests passing
```

**Success Criteria:**
- Tests written before implementation
- All tests passing
- Coverage >= 80% (or >= 95% with --quality)

---

### --debug (Debug Mode)

**Philosophy:** Understand before fixing - fix root cause

**Workflow:**
```
EXPLORE (error investigation, 10 min)
  - Search for error message in code
  - Find stack trace source
  - Identify code path

ANALYZE (root cause, 10 min)
  - Reproduce the bug
  - Identify root cause
  - Understand why it happens

FIX (implementation, 15-30 min)
  - Implement fix
  - Add regression test
  - Check for similar bugs

VERIFY (validation)
  - Test fix works
  - Regression test passes
  - Edge cases covered
```

**Success Criteria:**
- Root cause identified
- Fix implemented
- Regression test added
- Bug cannot recur

---

### --docs (Documentation Mode)

**Philosophy:** Code is truth, docs are reflection

**Output Structure:**
```
docs/
├── README.md       # Hook, quick start, examples
├── API.md          # All public APIs with types
├── GUIDE.md        # Architecture, patterns, workflows
└── REFERENCE.md    # Quick reference card
```

**Success Criteria:**
- README < 50 lines
- Quick start < 3 commands
- API documentation complete
- Examples runnable

---

### --git (Git-Aware Mode)

**Git Flow Master Format:**
```
TYPE: PROJECT_NAME - vX.Y.Z

- Change 1
- Change 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Workflow:**
```
EXPLORE (git context)
  - git diff to see changes
  - git log for recent commits
  - Check staging area

PLAN (git-aware)
  - Consider modified files
  - Plan atomic commits
  - Prepare commit messages

IMPLEMENT (with git)
  - Work on changed files
  - Stage appropriately
```

---

### --branch (Context-Aware Mode)

**Auto-Detection:**

| Branch Pattern | Detected Behavior |
|----------------|-------------------|
| `feature/*` | `--scale` (new features) |
| `bugfix/*` | `--debug` (fixes) |
| `refactor/*` | `--clean` (refactoring) |
| `main/master` | `--quality` (production) |
| `hotfix/*` | `--debug --quality` (urgent fixes) |
| `docs/*` | `--docs` (documentation) |
| `test/*` | `--test` (test-focused) |

---

### --profile (Performance Profiling Mode)

**Philosophy:** Measure before optimizing

**Workflow:**
```
EXPLORE (identify bottlenecks)
  - Use profiling tools
  - Measure current performance
  - Identify slow paths

PLAN (optimization strategy)
  - Set performance targets
  - Prioritize bottlenecks
  - Plan optimizations

CODE (optimize)
  - Apply optimizations
  - Keep code readable
  - Document trade-offs

TEST (measure)
  - Verify improvements
  - Check for regressions
  - Document results
```

**Success Criteria:**
- Measurable improvement
- No regressions
- Results documented

---

### --types (TypeScript Improvement Mode)

**Philosophy:** Type safety at compile time

**Workflow:**
```
EXPLORE (type audit)
  - Find `any` usage
  - Identify type gaps
  - Review type coverage

PLAN (type improvements)
  - Plan type additions
  - Design type hierarchy
  - Plan refactoring

CODE (implement types)
  - Replace `any` with proper types
  - Add Zod schemas for boundaries
  - Use `unknown` for truly unknown

TEST (typecheck)
  - Run strict typecheck
  - Verify no `any` remain
  - Check type coverage
```

**Success Criteria:**
- Zero `any` types
- Proper TypeScript strict mode
- Type coverage >= 95%

---

## Auto-Detection System

**When no flags are provided**, the system analyzes the task:

| Signal | Detected Profile |
|--------|------------------|
| < 100 chars, no "and/with" | `--speed` |
| Contains "feature/build/create" | `--scale` |
| Contains "SaaS/platform/system" | `--team` |
| Contains "critical/security/payment" | `--quality` |
| Contains "refactor/cleanup/remove" | `--clean` |
| Contains "test/TDD/coverage" | `--test` |
| Contains "fix/bug/error/debug" | `--debug` |
| Contains "docs/API/guide" | `--docs` |
| Contains "slow/performance" | `--profile` |
| Contains "types/TypeScript" | `--types` |

---

## Subagent Auto-Activation

**Specialized agents load automatically based on flags:**

| Flag Detected | Subagent Auto-Loaded | Trigger Keywords |
|---------------|---------------------|------------------|
| `--profile` | `workflow/performance-profiler` | "slow", "performance", "optimize" |
| `--security` | `workflow/security-scanner` | "security", "OWASP", "vulnerability" |
| `--types` | `workflow/typescript-improver` | "types", "TypeScript", "strict" |
| `--test` | `testing/tdd-guide` | "test", "TDD", "coverage" |
| `--team` | **Creates Agent Team** | "large", "multi-domain", "parallel" |

**Disable specific agent:**
```bash
/studio build --profile "optimize code" --no-profile-agent
```

**Disable all agents:**
```bash
/studio build --scale "build feature" --no-agents
```

---

## Flag Combinations

**Power Combinations:**

| Command | Behavior | Use For |
|---------|----------|---------|
| `--clean --scale` | Delete-first thorough refactor | Major refactoring |
| `--test --quality` | TDD with 100% coverage | Critical features |
| `--debug --git` | Bug fix with proper commit | Production bugs |
| `--clean --types` | TypeScript improvement | Type safety |
| `--test --docs --scale` | TDD + docs + thorough | Libraries/APIs |
| `--debug --clean` | Fix + refactor | Bug with cleanup |
| `--profile --quality` | Performance optimization | Slow code |

**Combination Examples:**
```bash
# Major refactoring with documentation
/studio build --clean --scale --docs "refactor auth module"

# Critical feature with full quality gates
/studio build --test --quality --types "payment processing"

# Bug fix in production
/studio build --debug --git --quality "fix login bug"

# Library release
/studio build --test --docs --types --quality "new API library"
```

---

## Memory Integration

**After each build, automatically save to claude-mem:**

**Auto-Save Triggers:**
- New pattern discovered
- Architecture decision made
- Convention established
- Bug solution found
- Refactoring technique applied

**Usage:**
```bash
# Search memory before implementing
"Let me check claude-mem for similar patterns first"

# Save after solving
"Saving successful pattern to claude-mem for future reference"
```

**Memory Categories:**
| Category | What to Store |
|----------|---------------|
| **Solutions** | Working code patterns |
| **Mistakes** | What NOT to do |
| **Decisions** | Tech choices + rationale |
| **Workflows** | Repeatable processes |

---

## Progress Tracking

**Show clear progress during implementation:**

```
[████████░░] 80% - Coding (3/4 files done)

EXPLORE (5 min) -> Found 4 relevant files
PLAN (3 min) -> 3-step implementation
CODE (15 min) -> Implementing feature...
TEST (pending)
```

**Progress Indicators:**
- Phase completion percentage
- Files processed
- Time estimates
- Next steps

---

## Best Practices Checklist

**Apply these practices for optimal results:**

| Best Practice | Expected Outcome | Validation |
|---------------|-------------------|------------|
| Use auto-detection first | Smart default behavior | Try without flags initially |
| Compose 2-3 flags max | Custom behavior without conflicts | Review flag combinations |
| Execute EXPLORE phase first | Find existing implementations | Always search codebase first |
| Use `--speed` for < 100 char tasks | Fast completion | Quick fixes, small changes |
| Use `--scale` for multi-file features | Comprehensive implementation | Complex features |
| Use `--clean` before `--scale` | Delete duplication first | Refactoring tasks |
| Use `--test` for critical code | High test coverage | Payment, auth, security |
| Use `--debug` when fixing bugs | Root cause resolution | Bug fixing |
| Check memory before implementing | Reuse past solutions | Search claude-mem first |
| Review metrics after build | Objective quality assessment | Check quality report |

**Decision Guide:**

```
Need to implement?
- Simple fix / small feature? -> --speed
- Complex / multi-file? -> --scale
- Quality-critical / security? -> --quality
- Large project / multi-domain? -> --team
- Refactoring / cleanup? -> --clean
- Test-critical feature? -> --test
- Bug fixing? -> --debug
- Public API / library? -> --docs
- Performance issue? -> --profile
- Type safety issues? -> --types
- Working with Git? -> --git
- Branch-specific workflow? -> --branch
- Not sure? -> (auto-detect)
```

---

## Technical Subagents

| Subagent | Tech Stack | When Used |
|----------|-----------|-----------|
| `impl-nextjs` | React 19, RSC, Prisma | `--tech=nextjs` |
| `impl-rust` | Ownership, async/await | `--tech=rust` |
| `impl-python` | Type hints, FastAPI | `--tech=python` |
| `impl-go` | Goroutines, interfaces | `--tech=go` |
| `impl-typescript` | Strict types, Zod | `--types` flag |

---

## Integration with Other Skills

**Requires:**
- **semantic-search** - For EXPLORE phase
- **memory-integration** - For saving patterns

**Complements:**
- **refactor** - Use after implementation for cleanup
- **multi-review** - Use for comprehensive code review
- **pattern-capture** - Use after successful implementation

**Used by:**
- All smite workflows as primary implementation entry point

---

## Legacy Compatibility

**Deprecated commands (still work):**

| Old Command | New Equivalent |
|-------------|----------------|
| `/oneshot "..."` | `/studio build --speed "..."` |
| `/epct "..."` | `/studio build --scale "..."` |
| `/predator "..."` | `/studio build --quality "..."` |
| `/ralph "..."` | `/studio build --scale --team "..."` |

---

*Build Skill Reference v3.1.0*
