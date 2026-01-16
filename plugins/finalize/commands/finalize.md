---
description: "Unified quality assurance, code review, refactoring, linting & documentation"
argument-hint: "[--mode=full|qa|docs] [--type=test|review|lint|perf|security|coverage|readme|agents|api|sync] [--auto] [--artifact=path]"
---

# SMITE Finalize

Complete quality assurance, code review, refactoring, linting, and documentation synchronization.

## ⚠️ MANDATORY: Use Toolkit First for Code Review

**BEFORE performing any code analysis or review, you MUST:**

1. **Try `/toolkit detect --patterns="security,performance"`** - Find 40% more bugs
2. **Try `/toolkit graph --impact`** - Analyze change impact
3. **Try `/toolkit explore --task=find-bug`** - Semantic bug detection

**ONLY proceed with manual exploration if:**
- Toolkit is unavailable OR
- Toolkit explicitly fails to provide results

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md`

---

## Usage

```bash
# Full finalize (QA + Docs) - DEFAULT
/finalize

# QA only
/finalize --mode=qa

# Specific QA type
/finalize --mode=qa --type=test       # Generate & run tests
/finalize --mode=qa --type=review    # Code review & refactor
/finalize --mode=qa --type=lint      # Fix linting issues
/finalize --mode=qa --type=perf      # Performance audit
/finalize --mode=qa --type=security  # Security audit
/finalize --mode=qa --type=coverage  # Coverage analysis

# Docs only
/finalize --mode=docs

# Specific doc type
/finalize --mode=docs --type=readme  # Update README
/finalize --mode=docs --type=agents  # Update AGENTS.md
/finalize --mode=docs --type=api     # Generate API docs
/finalize --mode=docs --type=sync    # Sync all docs

# Automatic (by Ralph)
/finalize --auto --artifact="src/components/Button.tsx"
```

## What It Does

**Full Mode** (default) performs comprehensive finalization:

1. **Quality Assurance**
   - Run all tests (unit, integration, E2E)
   - Code review for best practices
   - Fix all linting issues
   - Performance audit
   - Security scan

**Toolkit Integration:**

When toolkit plugin is available, Finalize can leverage:
- **Bug Detection** - 40% more bugs found using `ToolkitAPI.Detect.issues()` with semantic patterns
- **Security Patterns** - Automated security vulnerability detection
- **Performance Patterns** - Performance anti-pattern detection
- **Logic Patterns** - Logic error identification
- **Documentation Generation** - Auto-generate JSDoc, README, and API docs via `ToolkitAPI.Docs.generate()`

2. **Documentation**
   - Update README.md
   - Update AGENTS.md with patterns
   - Generate JSDoc/API docs
   - Create knowledge base

3. **Commit**
   - Create commit: `chore: finalize - QA & documentation updates`
   - Ready for PR/merge

## When To Use

**After development completion:**
- Feature implementation done
- Bug fixes complete
- Refactoring finished
- Before git commit
- Before PR creation

**Modes:**
- Use `--mode=qa` when you only need quality checks
- Use `--mode=docs` when you only need documentation updates
- Use default (no flag) for complete finalization

## Examples

### Example 1: After Feature Development

```bash
# You just implemented a new feature
/finalize

→ Runs all tests
→ Reviews code quality
→ Fixes linting
→ Updates documentation
→ Creates final commit
```

### Example 2: QA Only

```bash
# You only need to validate code quality
/finalize --mode=qa

→ Tests + Review + Lint + Performance
→ No documentation changes
```

### Example 3: Generate Test Suite

```bash
# You need comprehensive tests
/finalize --mode=qa --type=test

→ Generates unit, integration, E2E tests
→ Analyzes coverage
→ Creates CI integration
```

### Example 4: Code Review & Refactor

```bash
# You want code review and optimization
/finalize --mode=qa --type=review

→ Comprehensive code review
→ Refactoring recommendations
→ Technical debt identification
```

### Example 5: Fix Linting

```bash
# You have linting errors
/finalize --mode=qa --type=lint

→ Auto-fixes ESLint
→ Formats with Prettier
→ Fixes TypeScript errors
→ Zero-debt achieved
```

### Example 6: Update Documentation

```bash
# You need to update docs after code changes
/finalize --mode=docs --type=sync

→ Updates JSDoc
→ Syncs README
→ Updates API docs
→ Zero documentation debt
```

## Output

After completion, you'll get a comprehensive report:

```markdown
# ✅ FINALIZE COMPLETE

## Quality Assurance
- Tests: ✅ 15/15 passing
- Review: ✅ No issues
- Lint: ✅ 0 errors
- Performance: ✅ Lighthouse 95/100

## Documentation
- README: ✅ Updated
- AGENTS.md: ✅ Added patterns
- API Docs: ✅ Generated
- JSDoc: ✅ 100% coverage

## Commits
1. feat: [feature implementation]
2. chore: finalize - QA & documentation updates

Next Steps:
- Ready for PR/merge
```

## Integration

**Automatic triggers:**
- After Ralph completes user stories
- Before git commits (pre-commit hook)
- Manual invocation

**Works with:**
- Ralph orchestrator
- Builder agent
- All development agents

## Best Practices

1. **Always run finalize before commits**
   - Ensures code quality
   - Keeps docs in sync
   - Prevents technical debt

2. **Use specific modes when appropriate**
   - `--mode=qa` for quick validation
   - `--mode=docs` for documentation-only updates
   - Default for complete finalization

3. **Review the report**
   - Check for any issues
   - Review recommendations
   - Update AGENTS.md with patterns

4. **Commit after finalize**
   - Use the generated commit message
   - Ready for PR/merge
