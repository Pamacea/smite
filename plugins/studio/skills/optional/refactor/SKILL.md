---
name: refactor
description: MANDATORY gate before ANY refactoring task. Systematic validation with 6 modes (--quick, --full, --analyze, --review, --resolve, --verify) plus 3 specialized modes (--profile for performance, --security for vulnerabilities, --types for TypeScript). Specific phrases: 'refactor this', 'clean up code', 'improve this function'.
version: 2.0.0
disable-model-invocation: true
user-invocable: true
lazy_load: true
category: workflow
---

# Refactor Skill - Unified Agent v2.0

> **Lazy-loaded skill** - Only loaded when explicitly invoked via `/studio refactor`

## 🛠️ Standard Tool Kit

```
✅ RECOMMENDED: grepai search "pattern" | /toolkit search "query"
✅ FOR READING: Read tool (optimized for file access)
✅ FOR EDITING: Edit tool (precise string replacement)
✅ FOR WRITING: Write tool (new file creation)
```

### Tool Selection Guide

| Need | Tool | Example |
|------|------|---------|
| Search code | `grepai search` or `/toolkit search` | Find patterns across files |
| Read file | `Read` tool | Access file contents |
| Edit code | `Edit` tool | Replace specific strings |
| Create file | `Write` tool | New file with content |

---

## Quick Reference

| Mode | Usage | Best For |
|------|-------|----------|
| `--quick` | Auto-fix low-risk items | Safe, fast improvements |
| `--full` | Complete refactoring workflow | Comprehensive changes |
| `--analyze` | Analysis only | Understanding code health |
| `--profile` | Performance profiling | Optimization work |
| `--security` | OWASP Top 10 scan | Security audits |
| `--types` | TypeScript improvement | Type safety |

---

## Examples

```bash
# Quick cleanup for low-risk items
/studio refactor --quick

# Complete workflow on recent changes
/studio refactor --full --scope=recent

# Performance profiling
/studio refactor --profile --scope=all

# Security audit on auth module
/studio refactor --security --scope=directory:src/auth

# Type safety improvement
/studio refactor --types --scope=recent
```

---

## Scope Options

| Scope | Description | Example |
|-------|-------------|---------|
| `recent` | Recent changes only | Default mode |
| `file:PATH` | Specific file | `--scope=file:src/auth/jwt.ts` |
| `directory:PATH` | Entire directory | `--scope=directory:src/features/auth` |
| `all` | Entire codebase | `--scope=all` |
| `bug` | Bug fixing | `--scope=bug "TypeError in auth"` |

---

## Mode Details

### --quick (Quick Mode)

**Purpose:** Auto-fix low-risk items with confidence

**When to Use:**
- Risk score < 30
- Complexity < 8
- Test coverage > 80%

**What it does:**
1. Identifies safe improvements
2. Applies refactoring patterns
3. Tests after each change
4. Commits verified changes

### --full (Full Mode - Default)

**Purpose:** Complete refactoring workflow

**Workflow:**
1. ANALYZE - Detect issues
2. REVIEW - Classify and prioritize
3. RESOLVE - Apply changes
4. VERIFY - Validate results

### --analyze (Analysis Only)

**Purpose:** Understand code health without changes

**Analysis includes:**
- Complexity metrics (cyclomatic, cognitive)
- Duplication detection
- Code smell identification
- Maintainability assessment

### --profile (Performance Profiling)

**Purpose:** Identify and fix performance bottlenecks

**When to Use:**
- Functions are slow
- Memory usage is high
- Need optimization metrics

**Workflow:**
1. Measure current performance
2. Identify bottlenecks
3. Apply optimizations
4. Verify improvement

### --security (Security Scanning)

**Purpose:** Detect and fix security vulnerabilities

**OWASP Top 10 Checked:**
- Injection attacks (SQL, NoSQL, XSS)
- Authentication/Authorization issues
- Sensitive data exposure
- Cryptographic failures
- Dependency vulnerabilities

**Severity Levels:**
- P0 - Critical (immediate fix)
- P1 - High (fix ASAP)
- P2 - Medium (fix soon)
- P3 - Low (fix when possible)

### --types (TypeScript Improvement)

**Purpose:** Improve type safety and eliminate `any`

**What it does:**
- Replaces `any` with proper types
- Adds Zod validation at boundaries
- Removes unsafe type assertions
- Improves type coverage

**Success Criteria:**
- Zero `any` in production code
- Type coverage ≥ 95%
- `tsc --strict` passing

---

## Core Principles

- **Safety First** - Validate all changes before implementation
- **Incremental** - Small, verifiable steps
- **Evidence-Based** - Use metrics to guide decisions
- **Test Continuously** - Run tests after each change
- **Document Thoroughly** - Explain what and why

---

## Success Criteria

### Universal
- ✅ All tests passing
- ✅ No type errors
- ✅ Complexity reduced
- ✅ No regressions
- ✅ Documentation complete

### Mode-Specific
| Mode | Additional Criteria |
|------|---------------------|
| `--profile` | Performance improved ≥ 20% |
| `--security` | All P0/P1 vulnerabilities fixed |
| `--types` | Zero `any`, coverage ≥ 95% |

---

## Best Practices

1. **Always analyze first** - Understand issues before acting
2. **Validate changes** - Never skip validation step
3. **Start with quick wins** - Build momentum
4. **Test continuously** - After each small change
5. **Commit logically** - Small, reviewable commits
6. **Document thoroughly** - Explain reasoning

---

## Full Documentation

For complete documentation including advanced patterns, subagent collaboration, and configuration options, see the main refactor skill.

**Version:** 2.0.0 | **Lazy Load:** Enabled
