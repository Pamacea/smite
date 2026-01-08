---
description: Auto-fix ESLint, TypeScript, and Prettier violations
argument-hint: [--mode=watch|fix|audit] [--files=pattern]
---

Use the linter-sentinel skill to automatically fix linting and formatting violations.

**Modes:**
- `watch` - Monitor for errors and auto-fix in real-time
- `fix` - Scan entire codebase and fix all violations
- `audit` - Report violations without fixing (dry-run)

**Usage:**
/smite:linter-sentinel --mode=fix
/smite:linter-sentinel --mode=watch --files="src/**/*.{ts,tsx}"
