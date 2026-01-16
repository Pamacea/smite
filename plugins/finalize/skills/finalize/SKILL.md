---
name: finalize
description: Unified quality assurance, code review, refactoring, linting & documentation
version: 3.0.0
---

# ✅ SMITE Finalize

**Unified QA + Documentation Agent**

---

## 🎯 Mission

**Ensure code quality AND documentation completeness through comprehensive testing, review, and documentation.**

---

## 📋 Commands

### `/finalize`

Run complete finalization (QA + Docs) - DEFAULT.

**What it does:**
1. Run all tests (unit, integration, E2E)
2. Code review for best practices
3. Fix all linting issues
4. Performance audit
5. Update all documentation
6. Create final commit

**Example:**
```bash
/finalize
```

### `/finalize --mode=qa`

QA only - no documentation changes.

**Options:**
- `--type=test` - Generate & run tests
- `--type=review` - Code review & refactor
- `--type=lint` - Fix linting issues
- `--type=perf` - Performance audit
- `--type=security` - Security audit
- `--type=coverage` - Coverage analysis

### `/finalize --mode=docs`

Documentation only - no QA.

**Options:**
- `--type=readme` - Update README
- `--type=agents` - Update AGENTS.md
- `--type=api` - Generate API docs
- `--type=sync` - Sync all docs

---

## ✅ QA Checklist

### 1. Testing
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run E2E tests (if applicable)
- [ ] Check test coverage (>80% target)

### 2. Code Review
- [ ] Review for best practices
- [ ] Check for anti-patterns
- [ ] Verify type safety (no `any`, no `@ts-ignore`)
- [ ] Check for technical debt (TODOs, console.logs)

### 3. Linting & Formatting
- [ ] Run ESLint and fix issues
- [ ] Run Prettier and format
- [ ] Check TypeScript compilation
- [ ] Verify no console errors

### 4. Performance
- [ ] Run Lighthouse audit (if web)
- [ ] Check bundle size
- [ ] Verify no memory leaks
- [ ] Check API response times

---

## 📚 Documentation Checklist

### 1. README
- [ ] Update installation instructions
- [ ] Update usage examples
- [ ] Verify all commands documented
- [ ] Add architecture diagram if needed

### 2. AGENTS.md
- [ ] Document discovered patterns
- [ ] Note any gotchas or special requirements
- [ ] Add tech stack conventions
- [ ] Include troubleshooting tips

### 3. API Docs
- [ ] Generate JSDoc/TSDoc
- [ ] Create API reference
- [ ] Document endpoints/parameters
- [ ] Add usage examples

### 4. Knowledge Transfer
- [ ] Create onboarding guide
- [ ] Document setup steps
- [ ] Note environment variables
- [ ] Add deployment instructions

---

## 🎯 Workflow

1. **Analyze** what changed in this session
2. **Run QA** (tests, review, lint, performance)
3. **Fix** any issues found
4. **Update docs** based on changes
5. **Commit** with message: `chore: finalize - QA & documentation updates`
6. **Report** summary of what was done

---

## ✨ Output Format

After finalizing, provide a summary:

```
✅ FINALIZE COMPLETE

Quality Assurance:
- Tests: ✅ Passing (15/15)
- Review: ✅ No issues
- Lint: ✅ No errors
- Performance: ✅ Lighthouse score 95

Documentation:
- README: ✅ Updated
- AGENTS.md: ✅ Added new patterns
- API Docs: ✅ Generated
- Knowledge: ✅ Created onboarding guide

Commits:
- feat: feature implementation
- chore: finalize - QA & documentation updates

Next Steps:
- Ready for PR/merge
- Consider adding X feature
- Monitor Y metric
```

---

## 🔗 Integration

**Works with:**
- architect:architect (design)
- builder:constructor.task (implementation)
- explorer:explorer.task (analysis)
- ralph:ralph (orchestration)

**Automatic triggers:**
- After Ralph completes user stories
- Before git commits (pre-commit hook)
- Manual invocation

---

## 💡 Best Practices

1. **Always run finalize before commits**
   - Ensures code quality
   - Keeps docs in sync
   - Prevents technical debt

2. **Use specific modes when appropriate**
   - `--mode=qa` for quick validation
   - `--mode=docs` for documentation-only updates
   - Default (no flag) for complete finalization

3. **Review the report**
   - Check for any issues
   - Review recommendations
   - Update AGENTS.md with patterns

4. **Commit after finalize**
   - Use the generated commit message
   - Ready for PR/merge

---

**Built with ❤️ by SMITE v3.0**
*Quality & Documentation Excellence*

---

## 🔧 TOOLKIT USAGE (PRIORITY)

### ⚠️ TOOLKIT-FIRST POLICY

**PRIORITY ORDER:**
- ✅ **1st choice: `/toolkit search`** - 75% token savings, 2x precision
- ✅ **2nd choice: `mgrep`** - Alternative semantic search
- ⚠️ **Last resort: `Grep` tool** - Only if toolkit unavailable

**REMINDER:** PostToolUse hook logs when manual tools are used and suggests alternatives

**BENEFITS:**
- 75% token savings (180k → 45k)
- 2x search precision (40% → 95%)
- 40% more bugs detected

### 🚀 HOW TO USE TOOLKIT

You have **TWO ways** to use the toolkit:

#### Method 1: `mgrep` Command (Direct & Fast)

```bash
# Find similar code patterns for consistency review
mgrep "error handling pattern try catch" --strategy semantic --glob "**/*.ts"

# Search for potential issues
mgrep "todo console.log fixme" --strategy literal

# Find all implementations of a pattern
mgrep "throw new Error" --strategy hybrid
```

#### Method 2: `CodeSearchAPI` (Programmatic)

```typescript
import { CodeSearchAPI } from '@smite/toolkit';
const search = new CodeSearchAPI();

// Find all implementations of a pattern for review
const implementations = await search.search('error handling pattern try catch', {
  strategy: 'SEMANTIC',
  filePatterns: ['src/**/*.ts', 'lib/**/*.ts']
});
```

**Which to use?**
- **Quick searches**: Use `mgrep` command directly
- **In code/agents**: Use `CodeSearchAPI` for programmatic access

### ✅ COMPLIANCE CHECKLIST

During QA:
- [ ] Using `mgrep` or `CodeSearchAPI`? ✅
- [ ] Avoided `Grep` tool completely? ✅
- [ ] Checking consistency? ✅
- [ ] Finding all issues? ✅

**Remember:** Toolkit helps you catch issues humans might miss!
