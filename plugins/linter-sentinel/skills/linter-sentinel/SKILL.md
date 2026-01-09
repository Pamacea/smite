# 🔍 LINTER-SENTINEL

**Auto-fix linting and type errors with surgical precision**

---

## MISSION

Monitor and automatically fix ESLint, TypeScript, and Prettier violations to maintain **zero-debt code quality**.

---

## INVOCATION

```bash
*start-linter-sentinel --mode=[watch|fix|audit]
```

### Modes

- **`watch`**: Monitor for errors and auto-fix in real-time
- **`fix`**: Scan entire codebase and fix all violations
- **`audit`**: Report violations without fixing (dry-run)

---

## PROTOCOL (FIX)

### 1. DETECT
```bash
# Run linters and type checker
pnpm lint
pnpm typecheck
pnpm format:check
```

**Actions:**
- Parse ESLint output for violations
- Parse TypeScript compiler errors
- Parse Prettier formatting differences
- Categorize by severity (CRITICAL, HIGH, MEDIUM, LOW)

### 2. TRIAGE

**Categorize violations by type:**
- **Type Safety**: `no-explicit-any`, `@ts-ignore`, missing types
- **Code Quality**: unused vars, unreachable code, console statements
- **Style**: formatting, naming conventions, import order
- **Best Practices**: React hooks rules, error handling, async patterns

**Determine fix strategy:**
- ✅ **Auto-fix**: Use ESLint `--fix` or Prettier
- 🤖 **Intelligent fix**: Refactor with type-safety preservation
- ⚠️ **Manual**: Requires developer decision (document in report)

### 3. FIX

**Apply fixes in priority order:**
1. CRITICAL: Type safety violations first
2. HIGH: ESLint errors
3. MEDIUM: Style violations
4. LOW: Formatting issues

**Fix methods:**
```bash
# Auto-fix ESLint
pnpm lint --fix

# Format with Prettier
pnpm format

# Manual fixes using SURGEON protocol
# 1. ISOLATION: Read file and identify exact line
# 2. DIAGNOSTIC: Understand the violation
# 3. ACTION: Apply targeted fix
# 4. VERIFICATION: Re-run linting
```

### 4. VERIFY

**After each fix:**
- Re-run linting to confirm resolution
- Check for new violations introduced
- Run tests to prevent regressions
- Maintain type-safety throughout

---

## CONFIGURATION

See `agent/configs/linter-sentinel.json`

**Key settings:**
- `detection.enabledRules`: Rules to monitor
- `fixing.autoFix`: Enable/disable auto-fix mode
- `fixing.dryRun`: Test mode without making changes
- `fixing.maxConcurrent`: Max files to fix concurrently

---

## EXAMPLE USAGE

### Watch Mode (Real-time)
```bash
*start-linter-sentinel --mode=watch
```
Monitors file changes and auto-fixes violations as they occur.

### Fix Mode (Full Scan)
```bash
*start-linter-sentinel --mode=fix
```
Scans entire codebase and fixes all violations.

### Audit Mode (Report Only)
```bash
*start-linter-sentinel --mode=audit
```
Reports violations without fixing (useful for review).

---

## OUTPUT

### Success Case
```
✅ LINTER-SENTINEL: 47 violations fixed
   - 12 type-safety issues
   - 23 ESLint errors
   - 12 formatting issues

📊 Zero-debt achieved: All checks passing
```

### Violations Requiring Manual Attention
```
⚠️ LINTER-SENTINEL: 3 violations require manual review

File: src/components/Header.tsx:42
Issue: Complex component, consider refactoring
Fix: Extract logic to custom hook

File: src/utils/api.ts:156
Issue: Missing error handling
Fix: Add try/catch or error boundary

📋 Full report: .linter-report.md
```

---

## INTEGRATION

Can be triggered automatically:
- After git commits (pre-commit hook)
- Before CI/CD pipeline
- On file save (watch mode)
- Manual invocation via command
