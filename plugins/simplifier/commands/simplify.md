---
description: Simplify and refactor code for clarity and maintainability
argument-hint: [--scope=file|directory|all] [--focus=recent]
---

# /simplifier

Automatically simplify and refine code while preserving all functionality.

**What it does:**
- Reduces complexity and nesting
- Eliminates redundant code
- Improves readability
- Consolidates related logic
- Applies project standards

**Flags:**
- `--scope=file` - Simplify specific file
- `--scope=directory` - Simplify entire directory
- `--scope=all` - Simplify entire codebase
- `--focus=recent` - Focus on recently modified code (default)

**Usage:**
```bash
# Simplify recent changes
/simplifier --focus=recent

# Simplify specific file
/simplifier --scope=file src/components/Button.tsx

# Simplify entire project
/simplifier --scope=all
```

**How it works:**
1. Analyzes code for complexity and inconsistencies
2. Applies project-specific best practices
3. Preserves exact functionality
4. Improves readability and maintainability
5. Avoids over-simplification

**Toolkit Integration:**

When toolkit plugin is available, Simplifier can leverage:
- **Bug Detection** - Identify issues to fix during simplification via `ToolkitAPI.Detect.issues()`
- **Semantic Analysis** - Understand code intent to preserve functionality
- **Refactoring** - Safe automated refactoring with `ToolkitAPI.Refactor.simplifyCode()`
- **Complexity Metrics** - Quantify complexity reduction

**Best Practices:**
- Runs automatically after code changes
- Prioritizes clarity over brevity
- Never alters functionality
- Follows CLAUDE.md standards
