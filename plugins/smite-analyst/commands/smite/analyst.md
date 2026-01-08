---
description: Code analysis and technical debt detection
argument-hint: [--scope=full|module|file] [--focus=quality|security|performance]
---

Use the smite-analyst skill to analyze code quality and detect technical debt.

**Scopes:**
- `full` - Analyze entire codebase
- `module` - Analyze specific module
- `file` - Analyze specific file

**Focus Areas:**
- `quality` - Code smells, complexity, maintainability
- `security` - Vulnerabilities and unsafe patterns
- `performance` - Bottlenecks and optimization opportunities

**Output:** `docs/ANALYST_REPORT.md` with debt metrics

**Usage:**
/smite:analyst --scope=full
/smite:analyst --scope=module --focus=security
