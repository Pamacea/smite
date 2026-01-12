---
description: "Unified quality assurance, code review, refactoring, linting & documentation"
argument-hint: "[--mode=full|qa|docs] [--type=test|review|lint|perf|security|coverage|readme|agents|api|sync] [--auto] [--artifact=path]"
---

# SMITE Finalize

Complete quality assurance, code review, refactoring, linting, and documentation synchronization.

## Usage

```bash
# Full finalize (QA + Docs) - DEFAULT
/smite-finalize

# QA only
/smite-finalize --mode=qa

# Specific QA type
/smite-finalize --mode=qa --type=test       # Generate & run tests
/smite-finalize --mode=qa --type=review    # Code review & refactor
/smite-finalize --mode=qa --type=lint      # Fix linting issues
/smite-finalize --mode=qa --type=perf      # Performance audit
/smite-finalize --mode=qa --type=security  # Security audit
/smite-finalize --mode=qa --type=coverage  # Coverage analysis

# Docs only
/smite-finalize --mode=docs

# Specific doc type
/smite-finalize --mode=docs --type=readme  # Update README
/smite-finalize --mode=docs --type=agents  # Update AGENTS.md
/smite-finalize --mode=docs --type=api     # Generate API docs
/smite-finalize --mode=docs --type=sync    # Sync all docs

# Automatic (by Ralph)
/smite-finalize --auto --artifact="src/components/Button.tsx"
```

## What It Does

**Full Mode** (default) performs comprehensive finalization:

1. **Quality Assurance**
   - Run all tests (unit, integration, E2E)
   - Code review for best practices
   - Fix all linting issues
   - Performance audit
   - Security scan

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
/smite-finalize

→ Runs all tests
→ Reviews code quality
→ Fixes linting
→ Updates documentation
→ Creates final commit
```

### Example 2: QA Only

```bash
# You only need to validate code quality
/smite-finalize --mode=qa

→ Tests + Review + Lint + Performance
→ No documentation changes
```

### Example 3: Generate Test Suite

```bash
# You need comprehensive tests
/smite-finalize --mode=qa --type=test

→ Generates unit, integration, E2E tests
→ Analyzes coverage
→ Creates CI integration
```

### Example 4: Code Review & Refactor

```bash
# You want code review and optimization
/smite-finalize --mode=qa --type=review

→ Comprehensive code review
→ Refactoring recommendations
→ Technical debt identification
```

### Example 5: Fix Linting

```bash
# You have linting errors
/smite-finalize --mode=qa --type=lint

→ Auto-fixes ESLint
→ Formats with Prettier
→ Fixes TypeScript errors
→ Zero-debt achieved
```

### Example 6: Update Documentation

```bash
# You need to update docs after code changes
/smite-finalize --mode=docs --type=sync

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
