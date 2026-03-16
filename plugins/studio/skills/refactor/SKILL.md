---
name: refactor
description: MANDATORY gate before ANY refactoring task in smite project. Invoke FIRST when cleaning up code, improving structure, or optimizing - provides systematic validation with 6 modes (--quick, --full, --analyze, --review, --resolve, --verify) plus 3 specialized modes (--profile for performance, --security for vulnerabilities, --types for TypeScript) with auto-team activation for complex refactors. Specific phrases: 'refactor this', 'clean up code', 'improve this function', 'optimize this', 'restructure this module'. (user)
version: 2.1.0
---

# Refactor Skill

## Mission

Provide unified, systematic code refactoring through comprehensive validation, ensuring safe improvements while preserving functionality.

**What this skill accomplishes:**
- Cleans up code while maintaining functionality
- Improves structure and maintainability
- Optimizes performance with measured improvements
- Enhances security through vulnerability scanning
- Strengthens type safety in TypeScript codebases

---

## Scope Definition

This skill applies to:
- Code cleanup and simplification
- Structure improvement and reorganization
- Performance optimization with metrics
- Security vulnerability remediation
- Type safety enhancement
- Duplication elimination

### Related Skills

For tasks outside this scope, consider:
- `/studio build` - New feature implementation
- `/studio review` - Code review without refactoring
- Edit tool - Simple renames or documentation updates
- `/studio build --test` - Test writing

---

## Tool Selection Standards

| Task | Recommended Tool | Avoid |
|------|------------------|-------|
| Find code by meaning | `grepai search` | grep/egrep/find |
| Read file contents | `Read tool` | cat/head/tail |
| List files | `Glob tool` | ls/dir/find |
| Search file contents | `Grep tool` | grep/rg |

**Decision Guide:**
- Need to search? → `grepai search` or `/toolkit search`
- Need to read? → `Read tool`
- Need to list? → `Glob tool`
- Need to grep? → `Grep tool`

---

## Execution Protocol

### Step 1: Analysis (Always First)

**Understand before acting:**
1. Use semantic search to locate relevant code
2. Read files with the Read tool
3. Identify complexity hotspots
4. Detect duplication patterns
5. Assess test coverage

### Step 2: Planning (For Multi-File Changes)

**Create a plan when:**
- Modifying 3+ files
- Restructuring a module
- Running subagents
- Using analyze/full/resolve modes

### Step 3: Execution (Incremental)

**Apply changes safely:**
1. Make small, verifiable changes
2. Run tests after each change
3. Commit logical units
4. Document rationale

### Step 4: Verification

**Confirm success:**
- All tests passing
- No type errors
- Metrics documented
- No regressions detected

---

## Quality Gates

### Pre-Refactor Checklist

```markdown
Analysis Complete:
- [ ] Semantic search performed
- [ ] Relevant files read
- [ ] Complexity assessed
- [ ] Test coverage verified
```

### Post-Refactor Checklist

```markdown
Validation Complete:
- [ ] All tests passing
- [ ] No type errors
- [ ] No regressions
- [ ] Metrics improved
- [ ] Documentation updated
```

### Mode-Specific Gates

| Mode | Additional Gates |
|------|------------------|
| `--profile` | Performance improved >= 20% |
| `--security` | All P0/P1 vulnerabilities fixed |
| `--types` | Zero `any`, coverage >= 95% |
| `--clean` | Net code reduction achieved |

---

## Success Metrics

### Universal Metrics

- **Test Status:** All tests passing
- **Type Safety:** No type errors
- **Complexity:** Reduced from baseline
- **Coverage:** Increased from baseline
- **Regressions:** Zero detected
- **Documentation:** Complete and accurate

### Mode-Specific Metrics

| Mode | Key Metrics |
|------|-------------|
| `--profile` | Execution time, memory usage, query count |
| `--security` | P0/P1 vulnerabilities fixed |
| `--types` | Type coverage %, `any` count |
| `--clean` | Lines removed, duplication eliminated |

---

## Mode Quick Reference

| Mode | Purpose | When to Use |
|------|---------|-------------|
| `--quick` | Auto-fix low-risk items | Risk < 30, complexity < 8 |
| `--full` | Complete workflow (default) | Standard refactoring |
| `--analyze` | Analysis only | Detect and catalog issues |
| `--review` | Create action plan | Prioritize by severity |
| `--resolve` | Apply validated changes | From review results |
| `--verify` | Comprehensive verification | Validate results |
| `--profile` | Performance optimization | Slow functions, high memory |
| `--security` | Security scan | OWASP compliance, audit |
| `--types` | TypeScript improvement | Poor types, `any` usage |

---

## Scope Options

| Option | Purpose | Example |
|--------|---------|---------|
| `--scope=recent` | Recent changes only (default) | `/studio refactor --quick` |
| `--scope=file:PATH` | Specific file | `--scope=file:src/auth/jwt.ts` |
| `--scope=directory:PATH` | Entire directory | `--scope=directory:src/features/auth` |
| `--scope=all` | Entire codebase | `--scope=all` |
| `--scope=bug` | Bug fixing | `--scope=bug "TypeError in auth"` |

---

## Auto-Team System

Agent teams activate automatically for complex refactors:

| Criterion | Threshold | Team Size |
|-----------|-----------|-----------|
| Files to analyze | >= 5 | 2 agents |
| Modes | analyze/full/profile/security/types | 2-3 agents |
| Complexity detected | High | 2-3 agents |

**Disable teams:** Add `--no-team` flag

---

## Examples

```bash
# Quick refactor
/studio refactor --quick

# Full workflow with performance profiling
/studio refactor --full --profile

# Security audit
/studio refactor --security --scope=all

# Type safety improvement
/studio refactor --types --scope=directory:src/features

# Bug-specific refactor
/studio refactor --scope=bug "TypeError in auth"

# Team-based performance + security
/studio refactor --profile --security --team
```

---

## See Also

**Full documentation:** @REFERENCE.md

- Mode details (workflow, examples, success criteria)
- Specialized modes (profile, security, types)
- Subagent collaboration
- Common patterns (Extract Method, etc.)
- Configuration
- Integration

---

*Refactor Skill v2.1.0*
