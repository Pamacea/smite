---
lazy_load: true
category: "template"
name: "warnings"
version: "2.0.0"
description: "Standard warning templates for SMITE commands - toolkit first, MCP tools, platform detection, error handling"
---

# SMITE Core - Standard Warnings

This file contains reusable warning templates that should be used consistently across all SMITE plugins.

---

## MANDATORY: Use Toolkit First for Analysis

**BEFORE analyzing any codebase, you MUST:**

1. **Try `/toolkit search "query"`** - Semantic search with 75% token savings
2. **Try `/toolkit graph --impact`** - Understand dependency blast radius
3. **Try `/toolkit explore`** - Find architectural patterns with 2x precision

**ONLY proceed with manual exploration if:**
- Toolkit is unavailable OR
- Toolkit explicitly fails to provide results

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md`

---

## MANDATORY: MCP Tool Availability

**This command requires the following MCP tools:**

{{MCP_TOOLS_LIST}}

**If MCP tools are unavailable:**
1. Inform the user clearly which tool is missing
2. Provide alternative manual workflow if possible
3. Do NOT crash or fail silently

---

## Platform Detection (Cross-Platform)

When executing shell commands that vary by platform:

```bash
# 1. Detect platform
if uname | grep -qE "(MINGW|MSYS)"; then
  # Windows (Git Bash)
  PLATFORM="windows"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PLATFORM="mac"
else
  # Linux
  PLATFORM="linux"
fi

# 2. Apply platform-specific logic
case $PLATFORM in
  windows)
    # Windows-specific commands
    ;;
  mac)
    # macOS-specific commands
    ;;
  linux)
    # Linux-specific commands
    ;;
esac
```

---

## Error Handling Standards

All commands MUST follow these error handling patterns:

### 1. Always use stderr redirection
```bash
git status 2>&1  # Works on all platforms
```

### 2. Check command success
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository"
  exit 1
fi
```

### 3. Graceful degradation
```bash
if ! command -v toolkit >/dev/null 2>&1; then
  echo "⚠️ Toolkit not available, falling back to manual search"
  # Alternative workflow
fi
```

---

## Git Best Practices

### Cross-Platform Git Hooks
Windows PowerShell hooks may fail with `.ps1` extension` errors. Use automatic retry:

```bash
git commit -m "message" 2>&1 || \
  git commit --no-verify -m "message" 2>&1
```

### Windows Reserved Device Names
Filter these files on Windows to prevent indexing errors:
```
nul, con, prn, aux, com1-9, lpt1-9
```

---

## Version Metadata Template

Use this footer for all command documentation:

```markdown
---

## Version

**Version**: {{VERSION}} | **Last Updated**: {{DATE}}

**Integration**: Works with /{{RELATED_COMMANDS}}

**Best used for**: {{USE_CASES}}
```
