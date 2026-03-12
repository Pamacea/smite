---
name: refactor
description: MANDATORY gate before ANY refactoring task. Systematic validation with 6 modes (--quick, --full, --analyze, --review, --resolve, --verify) plus 3 specialized modes (--profile for performance, --security for vulnerabilities, --types for TypeScript). Specific phrases: 'refactor this', 'clean up code', 'improve this function'.
version: 2.0.0
disable-model-invocation: true
user-invocable: true
lazy_load: true
category: workflow
---

# Refactor Skill - Unified Agent v2.0

> **Lazy-loaded skill** - Only loaded when explicitly invoked via `/studio refactor`

## 🔴 TOOL GATEKEEPER

```
🚫 PROHIBITED: grep | egrep | find | ack | ag | ls | dir | glob
✅ MANDATORY: grepai search "pattern" | /toolkit search "query"
```

## Quick Reference

| Mode | Usage |
|------|-------|
| `--quick` | Auto-fix low-risk items |
| `--full` | Complete refactoring workflow |
| `--analyze` | Analysis only |
| `--profile` | Performance profiling |
| `--security` | OWASP Top 10 scan |
| `--types` | TypeScript improvement |

## Examples

```bash
/studio refactor --quick
/studio refactor --full --scope=recent
/studio refactor --profile --scope=all
/studio refactor --security --scope=directory:src/auth
/studio refactor --types --scope=recent
```

## Full Documentation

See original refactor skill for complete documentation.

**Version:** 2.0.0 | **Lazy Load:** Enabled
