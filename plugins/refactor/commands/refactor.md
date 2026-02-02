# /refactor - Unified Refactoring Command

> **UNIFIED** code refactoring with systematic validation

## Usage

```bash
# Quick refactoring (auto-fix low-risk items)
/refactor --quick

# Full refactoring workflow
/refactor --full

# Bug fixing
/refactor --scope=bug "TypeError in auth"

# With scope
/refactor --full --scope=file:src/auth/jwt.ts
/refactor --full --scope=directory:src/features/auth
/refactor --full --scope=all

# Step-by-step
/refactor --analyze
/refactor --review
/refactor --resolve --item=ID
/refactor --verify
```

## Mode Selection

| Mode | Description | Speed | Scope |
|------|-------------|-------|-------|
| `--quick` | Auto-fix low-risk items | ⚡⚡⚡ | Small |
| `--full` | Complete workflow | ⚡⚡ | Any |
| `--analyze` | Analysis only | ⚡ | Any |
| `--review` | Review & prioritize | ⚡⚡ | Any |
| `--resolve` | Apply changes | ⚡⚡ | Specific |
| `--verify` | Verify results | ⚡ | Any |

## Scope Options

| Option | Description |
|--------|-------------|
| `--scope=recent` (default) | Recent changes only |
| `--scope=file:PATH` | Specific file |
| `--scope=directory:PATH` | Entire directory |
| `--scope=all` | Entire codebase |
| `--scope=bug` | Bug fixing mode |

## Quick Mode

Automatically fixes low-risk items:
- Risk score < 30
- Complexity < 8
- Test coverage > 80%

## Full Mode

Complete workflow:
1. **ANALYZE** - Detect code quality issues
2. **REVIEW** - Classify and prioritize
3. **RESOLVE** - Apply refactoring
4. **VERIFY** - Verify results

## Step-by-Step

Control each step independently:

```bash
# Step 1: Analyze
/refactor --analyze

# Step 2: Review
/refactor --review

# Step 3: Resolve specific item
/refactor --resolve --item=R-003

# Step 4: Verify
/refactor --verify
```

## Bug Fixing

```bash
# Debug specific error
/refactor --scope=bug "TypeError: product.price is not a function"

# With adversarial review
/refactor --scope=bug --examine "Critical production bug"

# With retry limit
/refactor --scope=bug --max-attempts=3 "Fix memory leak"
```

## Integration

### With Toolkit

When toolkit is available:
- **Semantic Search** - Find similar patterns
- **Bug Detection** - Pattern-based issue finding
- **Dependency Graph** - Impact analysis
- **Context Builder** - Token-optimized context

### With Ralph

Ralph workflows use `/refactor`:
- `refactor` - Refactoring workflow
- `debug` - Debug workflow
- `feature` - Feature workflow

## Examples

### Quick Refactoring

```bash
# Auto-fix low-risk items
/refactor --quick

# With scope
/refactor --quick --scope=directory:src/components
```

### Full Workflow

```bash
# Complete refactoring
/refactor --full

# With custom scope
/refactor --full --scope=all
```

### Step-by-Step

```bash
# Analyze only
/refactor --analyze

# Review and prioritize
/refactor --review

# Resolve specific item
/refactor --resolve --item=R-003

# Verify results
/refactor --verify
```

### Bug Fixing

```bash
# Debug with stack trace
/refactor --scope=bug "TypeError: product.price is not a function"

# Automated fix with verification
/refactor --scope=bug --auto "Fix memory leak in useEffect"

# Critical bug with full review
/refactor --scope=bug --examine "Production database connection error"
```

## Output

All artifacts saved to `.claude/.smite/`:

| Output | File | Purpose |
|--------|------|---------|
| Analysis | `refactor-analysis.md` | Detected issues |
| Review | `refactor-review.md` | Prioritized action plan |
| Resolution | `refactor-resolution-[ID].md` | Changes applied |
| Verification | `refactor-verification.md` | Final verification |

## Configuration

Config file: `.claude/.smite/refactor.json`

```json
{
  "defaults": {
    "scope": "recent",
    "riskThreshold": 30,
    "complexityThreshold": 8,
    "coverageTarget": 80,
    "autoCommit": true
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    ".claude/**"
  ],
  "patterns": {
    "enabled": ["extract-method", "extract-class", ...]
  }
}
```

## Migration Guide

### From agents/refactor

**Old:**
```bash
/refactor -a -r -v -x -t
```

**New:**
```bash
/refactor --full
```

### From ralph/refactor

**Old workflow:**
```json
{
  "steps": ["analyze", "plan", "execute", "review", "resolve", "verify"]
}
```

**New workflow:**
```json
{
  "steps": ["analyze", "review", "resolve", "verify"]
}
```

### From basics/debug

**Old:**
```bash
/debug "TypeError in auth"
```

**New:**
```bash
/refactor --scope=bug "TypeError in auth"
```

### From predator/debug

**Old:**
```bash
/debug -examine "Critical bug"
```

**New:**
```bash
/refactor --scope=bug --examine "Critical bug"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Config file not found | Run once to create `.claude/.smite/refactor.json` |
| Tests failing | Fix all failures before proceeding |
| Type errors | Resolve all type errors before verification |
| Regressions detected | Rollback and investigate |

## Best Practices

1. **Always analyze first** - Understand issues before acting
2. **Validate changes** - Never skip validation step
3. **Start with quick wins** - Build momentum with low-risk items
4. **Test continuously** - After each small change
5. **Commit logically** - Small, reviewable commits
6. **Document thoroughly** - Explain reasoning

---

**Version:** 1.0.0
**Last Updated:** 2025-02-01
**SMITE Version:** 3.1.0
**Author:** Pamacea
