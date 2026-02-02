# @smite/refactor - Unified Refactoring Agent

> **UNIFIED** code refactoring with systematic validation - consolidates all refactor workflows

## 🎯 Purpose

Provides a unified refactoring experience by consolidating:
- `agents/refactor` - Systematic 5-step workflow
- `ralph/refactor` - 6-step orchestration workflow
- `basics/debug` - Bug resolution workflow
- `predator/debug` - Modular 8-step debug workflow

**Goal:** One clear entry point for all refactoring and bug-fixing tasks.

## 🚀 Quick Start

```bash
# 1. Install plugin
/plugin install refactor@smite

# 2. Quick refactoring (auto-fix low-risk items)
/refactor --quick

# 3. Full refactoring workflow
/refactor --full

# 4. Bug fixing
/refactor --scope=bug "TypeError in auth"

# 5. Step-by-step control
/refactor --analyze
/refactor --review
/refactor --resolve --item=ID
/refactor --verify
```

## 📖 Usage

### Mode Selection

| Mode | Description | Best For |
|------|-------------|----------|
| `--quick` | Auto-fix low-risk items (risk < 30, complexity < 8, coverage > 80%) | Small improvements, quick wins |
| `--full` | Complete workflow (analyze → review → resolve → verify) | Comprehensive refactoring |
| `--analyze` | Analysis only | Understanding issues before acting |
| `--review` | Review and prioritize | Creating action plan |
| `--resolve` | Apply specific changes | Incremental refactoring |
| `--verify` | Verify results | After manual changes |

### Scope Options

```bash
# Recent changes (default)
/refactor --quick --scope=recent

# Specific file
/refactor --full --scope=file:src/auth/jwt.ts

# Directory
/refactor --full --scope=directory:src/features/auth

# All files
/refactor --full --scope=all

# Bug fixing
/refactor --scope=bug "TypeError: product.price is not a function"
```

## 🔧 Workflow

### Full Workflow (--full)

```
1. ANALYZE (optional, with --analyze)
   - Detect code quality issues
   - Complexity analysis (cyclomatic, cognitive, nesting)
   - Duplication detection
   - Code smell identification
   - Output: .claude/.smite/refactor-analysis.md

2. REVIEW (optional, with --review)
   - Classify issues by severity (P1-P4)
   - Assess business impact
   - Estimate effort and risk
   - Identify quick wins
   - Create action plan
   - Output: .claude/.smite/refactor-review.md

3. RESOLVE (required)
   - Apply validated refactoring patterns
   - Incremental changes
   - Test continuously
   - Commit in logical steps
   - Document all changes
   - Output: .claude/.smite/refactor-resolution-[ID].md

4. VERIFY (required)
   - All tests passing
   - No type errors
   - Metrics improved
   - No regressions
   - Output: .claude/.smite/refactor-verification.md
```

### Quick Workflow (--quick)

Automatically:
1. Skip analyze/review
2. Identify low-risk items (risk < 30, complexity < 8, coverage > 80%)
3. Auto-apply refactoring patterns
4. Run tests after each change
5. Commit safe changes

### Bug Fixing (--scope=bug)

Uses debug workflow:
```
1. ANALYZE - Deep analysis to detect root cause
2. DIAGNOSE - Create resolution strategy
3. RESOLVE - Apply fixes
4. VERIFY - Verify fixes work correctly
```

## 🔍 Integration

### With Toolkit

When toolkit plugin is available:
- **Semantic Search** - Find similar patterns
- **Bug Detection** - Pattern-based issue finding
- **Dependency Graph** - Impact analysis before changes
- **Context Builder** - Optimized context (70-85% token savings)

### With Ralph

Ralph workflows use `/refactor`:
```json
{
  "refactor": {
    "steps": ["analyze", "review", "resolve", "verify"]
  }
}
```

## 📊 Subagents

### Classifier Subagent

**Purpose:** Issue classification and prioritization

**Launched by:** Review step (`--review`)

**Capabilities:**
- Issue classification (P1-P4)
- Business impact assessment
- Effort estimation
- Risk evaluation
- Action plan creation

### Validator Subagent

**Purpose:** Safety and validation

**Launched by:** Review step (`--review`)

**Capabilities:**
- Functionality preservation verification
- Test coverage analysis
- Impact analysis
- Risk assessment
- Approval decision

### Resolver Subagent

**Purpose:** Refactoring implementation

**Launched by:** Resolve step (`--resolve`)

**Capabilities:**
- Apply refactoring patterns
- Incremental changes
- Continuous testing
- Documentation
- Safe commits

## 📁 Output Files

| Operation | File Location | Purpose |
|-----------|---------------|---------|
| Analyze | `.claude/.smite/refactor-analysis.md` | Detected issues |
| Review | `.claude/.smite/refactor-review.md` | Prioritized action plan |
| Resolve | `.claude/.smite/refactor-resolution-[ID].md` | Changes applied |
| Verify | `.claude/.smite/refactor-verification.md` | Final verification |

## ⚙️ Configuration

### Config File

`.claude/.smite/refactor.json`:

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
    "enabled": ["extract-method", "extract-class", "introduce-param-object"]
  }
}
```

### Environment Variables

```bash
# Risk threshold for --quick mode
REFACTOR_RISK_THRESHOLD=30

# Complexity threshold
REFACTOR_COMPLEXITY_THRESHOLD=8

# Coverage target
REFACTOR_COVERAGE_TARGET=80

# Auto-commit after changes
REFACTOR_AUTO_COMMIT=true
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin not installed | Run `/plugin install refactor@smite` |
| Config file not found | Run once to create `.claude/.smite/refactor.json` |
| Tests failing | Fix all failures before proceeding |
| Type errors | Resolve all type errors before verification |
| Regressions detected | Rollback and investigate |

## 📝 Migration Guide

### From agents/refactor

**Old:**
```bash
/refactor -a -r -v -x -t
```

**New:**
```bash
/refactor --full
```

### From ralf/refactor

**Old:**
```json
{
  "steps": ["analyze", "plan", "execute", "review", "resolve", "verify"]
}
```

**New:**
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

## 🎯 Examples

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
# Debug specific error
/refactor --scope=bug "TypeError: product.price is not a function"

# With adversarial review
/refactor --scope=bug --examine "Critical production bug"
```

## 📚 Documentation

- **[Complete Guide](../../docs/REFACTOR_GUIDE.md)** - Complete refactoring guide
- **[Examples](examples/)** - Sample refactoring sessions
- **[Migration Guide](MIGRATION.md)** - Migrating from old agents

## 🤝 Contributing

Found a bug or have a suggestion? Open an issue at:
https://github.com/Pamacea/smite/issues

## 📄 License

MIT License - see LICENSE file for details.

---

**Version:** 1.0.0
**Last Updated:** 2025-02-01
**SMITE Version:** 3.1.0
**Author:** Pamacea
