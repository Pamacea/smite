---
name: commit
description: Quick commit and push with minimal, clean conventional commit messages
version: 1.0.0
model: haiku
---

# Commit Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Quickly analyze git changes and create conventional commit messages following the commitizen format (e.g., "update(statusline): refresh spend data"). This skill prioritizes speed and efficiency for straightforward commits with robust cross-platform error handling.

## Core Workflow

1. **Input**: Automatic (git state detection) or manual invocation
2. **Process**:
   - Verify git repository
   - Detect and clean platform-specific issues (Windows reserved files)
   - Stage changes if needed
   - Generate conventional commit message
   - Execute commit with automatic error recovery
   - Push to remote
3. **Output**: Clean git history with properly formatted commits

## Key Principles

- **SPEED OVER PERFECTION**: Generate one good commit message and commit immediately
- **NO INTERACTION**: Never use AskUserQuestion - just analyze and commit
- **AUTO-STAGE**: If changes exist but nothing staged, stage everything
- **AUTO-PUSH**: Always push after committing (unless push fails)
- **MINIMAL OUTPUT**: Brief confirmation of what was committed
- **IMPERATIVE MOOD**: Use "add", "update", "fix", not past tense
- **LOWERCASE**: Description starts lowercase after colon

## Commit Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New features | `feat(auth): add JWT refresh support` |
| `fix` | Bug fixes | `fix(statusline): correct token count` |
| `update` | Refreshing/updating existing | `update(api): refresh endpoints` |
| `refactor` | Code refactoring | `refactor(core): extract validator` |
| `docs` | Documentation | `docs(readme): update installation` |
| `chore` | Maintenance tasks | `chore(deps): bump dependencies` |
| `test` | Test changes | `test(auth): add login tests` |
| `perf` | Performance | `perf(api): optimize queries` |
| `revert` | Revert previous | `revert: feat(feature-name)` |

## Commit Format

```
type(scope): brief description
```

**Rules**:
- Keep under 72 characters
- Use imperative mood ("add" not "added")
- Start description with lowercase
- Be specific but concise
- Scope identifies the area affected

## Cross-Platform Features

### Windows Cleanup
- Filters out reserved device names (nul, con, prn, aux, com1-9, lpt1-9)
- Prevents "error: short read while indexing nul" errors
- Only applies on Windows (MINGW/MSYS detection)

### PowerShell Hook Compatibility
- Detects ".ps1 extension" hook failures
- Automatically retries with `--no-verify`
- Informs user of bypass

### Universal Error Handling
- Always uses `2>&1` for cross-platform stderr
- Graceful handling of platform-specific errors

## Configuration

No configuration needed. The skill automatically:
- Detects git repository
- Stages changes if needed
- Determines appropriate commit type
- Handles platform-specific issues

## Integration

- **Works with**: All development workflows
- **Best used after**: Completing a task or feature
- **Recommended**: Use after successful lint/typecheck

## Error Handling

| Error | Handling |
|-------|----------|
| Not a git repository | Inform user and exit gracefully |
| Nothing to commit | Inform user and exit |
| PowerShell hook fails | Auto-retry with --no-verify |
| Push fails | Report error, commit remains local |
| Windows reserved files | Filter out before committing |

## Examples

### Example 1: Feature Commit
```
Input: Added new JWT authentication
Output: feat(auth): add JWT token validation
```

### Example 2: Bug Fix
```
Input: Fixed token counting in statusline
Output: fix(statusline): correct token calculation
```

### Example 3: Update
```
Input: Updated dependencies
Output: chore(deps): bump packages to latest
```

## Success Criteria

- ✅ Git repository validation passed
- ✅ Platform correctly detected (Windows/Linux/Mac)
- ✅ Changes properly staged if needed
- ✅ Commit message follows format: `type(scope): description`
- ✅ Commit created successfully (with automatic --no-verify retry on Windows)
- ✅ Changes pushed to remote (or error handled gracefully)
- ✅ Clear user feedback on all operations

---
*Commit Skill v1.0.0 - Quick commits with conventional messages*
