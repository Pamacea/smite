---
name: build
description: MANDATORY entry point for ALL implementation tasks in smite project. Invoke FIRST when building features, implementing functionality, or creating components - provides 12-flag system (--speed, --scale, --quality, --team, --clean, --test, --debug, --docs, --git, --branch, --profile, --types) with auto-detection, memory integration, and quality metrics. Specific phrases: 'build feature', 'implement this', 'create component', 'add functionality', 'develop API'. (user)
version: 3.1.0
---

# Build Skill - Unified Agent v3.1

---

## Mission

Provide **ONE unified implementation entry point** with:
- **12 composable flags** for maximum flexibility
- **Auto-detection** for zero-configuration usage
- **Memory integration** for continuous improvement
- **Progress tracking** for transparent workflow
- **Quality metrics** for objective validation
- **Legacy compatibility** for smooth migration

---

## Scope Definition

**This skill is designed for:**
- Building new features
- Implementing functionality
- Creating components
- Adding APIs
- Developing modules

**Use alternative skills for:**

| Your Task | Use This Skill Instead |
|-----------|------------------------|
| One-off instructions | Add directly to CLAUDE.md |
| Pure research tasks | `/toolkit search` or `grepai search` |
| Questions about code | Read or Grep tools directly |
| Configuration changes | Edit tool directly |
| Documentation review | Dedicated review skills |
| Simple tool usage | Claude's built-in tool knowledge |

---

## Preferred Tools

**Always use these tools for their intended purpose:**

| Tool | Use For | Command Pattern |
|------|---------|-----------------|
| `grepai search` | Semantic code search | `grepai search "pattern"` |
| `/toolkit search` | Structured code discovery | `/toolkit search "query"` |
| `Read` | File content inspection | `Read file_path` |
| `Edit` | Precise file modifications | `Edit file_path old_string new_string` |
| `Write` | New file creation | `Write file_path content` |
| `Glob` | Pattern-based file finding | `Glob pattern` |
| `Grep` | Content-based file search | `Grep pattern` |

**Tool Selection Decision Tree:**
```
Need to search code?
  ├─ Semantic understanding needed? → grepai search or /toolkit search
  └─ Simple pattern matching? → Grep tool

Need to implement?
  └─ /studio build [flags] "task"

Need to read files?
  └─ Read tool (never cat/head/tail)
```

---

## Execution Protocol

### Phase 1: EXPLORE (Always First)

**Mandatory first step for all implementations:**
- Execute `grepai search` or `/toolkit search` to find existing implementations
- Review related code patterns
- Identify reusable components
- Understand project structure
- Verify library versions (post-2024 libs require web search verification)

**Output:** Investigation summary with relevant files and patterns

### Phase 2: PLAN (Strategy)

- Define implementation approach
- List files to modify/create
- Identify edge cases
- Plan testing strategy
- Estimate complexity

**Output:** Step-by-step implementation plan

### Phase 3: CODE (Implementation)

- Follow existing code patterns exactly
- Use barrel exports (index.ts per folder)
- Write self-documenting code
- Apply delete-first philosophy when appropriate
- Implement with proper TypeScript types

**Output:** Working implementation following project conventions

### Phase 4: TEST (Validation)

- Run linting and type checking
- Execute relevant tests
- Verify no regressions
- Check quality gates (based on flags)
- Measure coverage when applicable

**Output:** Validation report with quality metrics

---

## Quality Gates

**All implementations MUST include:**
- [ ] Proper TypeScript types (no `any`, use `unknown` or proper types)
- [ ] Barrel exports in each folder (index.ts)
- [ ] Following existing code patterns exactly
- [ ] Self-documenting names (no excessive comments)
- [ ] Error handling at system boundaries
- [ ] Tests for behavior (not implementation details)
- [ ] No obvious security vulnerabilities

**Additional gates based on flags:**

| Flag | Extra Quality Gates |
|------|---------------------|
| `--clean` | Net code reduction, zero duplication |
| `--test` | Tests written first, coverage >= 80% |
| `--debug` | Root cause identified, regression test added |
| `--quality` | 100% type coverage, OWASP compliance |
| `--docs` | Complete documentation generated |

---

## Success Metrics

**Objective measurements after each build:**

```
Code Quality Report
════════════════════════════════════════
Lines Added:        [count]
Lines Removed:      [count]
Net Change:         [delta]
Files Touched:      [count]

Barrel Exports:     [all proper/partial/missing]
Type Coverage:      [percentage]%
Test Coverage:      [percentage]%
Complexity:         [reduced/unchanged/increased]

Debt:               [lines improved/added]
Performance:        [measured improvement/not applicable]

Memory:             [patterns saved count]
Documentation:      [generated files]

Status:             [READY FOR MERGE/NEEDS ATTENTION]
════════════════════════════════════════
```

---

## Flag Quick Reference

### Core Flags (v2.0)

| Flag | Aliases | Effect | Use When |
|------|---------|--------|----------|
| `--speed` | `--fast`, `--quick` | Optimized for velocity | Quick fixes, small features |
| `--scale` | `--thorough`, `--epct` | Comprehensive workflow | Complex features, multiple files |
| `--quality` | `--validate`, `--predator` | Quality gates enabled | Critical code, production-ready |
| `--team` | `--swarm`, `--ralph` | Parallel agent teams | Large projects, multi-domain |

### Extended Flags (v3.0)

| Flag | Effect | Use When |
|------|--------|----------|
| `--clean` | Delete-first philosophy | Refactoring, removing duplication |
| `--test` | TDD mode (RED-GREEN-REFACTOR) | Test-critical features |
| `--debug` | Bug fixing workflow | Fixing existing bugs |
| `--docs` | Auto-documentation | API docs, guides |
| `--git` | Git-aware mode | Working with version control |
| `--branch` | Context-aware behavior | Branch-specific workflows |
| `--profile` | Performance profiling | Performance optimization |
| `--types` | TypeScript improvements | Type safety improvements |

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

---

## Decision Guide

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

## See Also

**Full documentation:** @REFERENCE.md

**Complete flag details, workflow examples, and advanced combinations:**
- Detailed flag workflows (--clean, --test, --debug, --docs, etc.)
- Subagent auto-activation
- Branch-based auto-detection
- Progress tracking patterns
- Best practices checklist
- Technical subagents by tech stack

---

*Build Skill v3.1.0 - Positive engineering with 12-flag system*
