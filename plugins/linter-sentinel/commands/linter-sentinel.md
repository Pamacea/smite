---
description: Auto-fix ESLint, TypeScript, and Prettier violations
argument-hint: [--mode=fix|check] [--files=pattern] [--rules=ruleset]
---

Automatically fix code quality issues with surgical precision.

**Modes:**

- `fix` - Auto-fix all violations
- `check` - Check only, don't fix

**Features:**

- ESLint rule violation fixes
- TypeScript error corrections
- Prettier formatting
- Import organization
- Unused code removal

**Usage:**
*start-linter-sentinel --mode=fix
*start-linter-sentinel --mode=check --files="src/\*_/_.ts"
