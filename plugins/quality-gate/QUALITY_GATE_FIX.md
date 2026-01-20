# Quality-Gate Path Resolution Fix

## Problem

When executing `/quality-gate:quality-check` from a project OTHER than the smite repository, the command failed with:

```
npm error 404 Not Found - GET https://registry.npmjs.org/quality-gate - Not Found
```

### Root Cause

The skill documentation showed commands like:
```bash
quality-gate quality-check
```

This assumed `quality-gate` was available in the system PATH, but it's actually a local plugin installed at:
```
C:\Users\Yanis\.claude\plugins\cache\smite\quality-gate\1.0.0\
```

When Claude tried to execute `npx quality-gate`, it searched the npm registry instead of the local plugin path.

## Solution

### 1. Created a Version-Independent Symlink

A junction (directory symlink) was created to point to the current version:

```bash
# Created junction at:
C:\Users\Yanis\.claude\plugins\quality-gate

# Points to:
C:\Users\Yanis\.claude\plugins\cache\smite\quality-gate\1.0.0\
```

This allows the path `~/.claude/plugins/quality-gate/` to always resolve to the latest installed version, even after updates.

### 2. Updated All Documentation

All skill and command documentation now uses the full path:

**Before (Broken):**
```bash
quality-gate quality-check
```

**After (Fixed):**
```bash
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check
```

### Files Updated

- `skills/quality-gate/SKILL.md` - Updated examples
- `commands/quality-check.md` - Updated usage and examples
- `commands/quality-config.md` - Updated usage and examples
- `commands/docs-sync.md` - Updated usage and examples

## Verification

The fix was verified to work from:
1. ✅ The smite repository directory
2. ✅ A different directory (/tmp)

## Usage Examples

### Run Quality Checks

```bash
# Check all files (not recommended for large projects)
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check

# Check only staged files (RECOMMENDED)
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --staged

# Check specific files
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --files src/app.ts,src/utils.ts

# Check with detailed output
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --staged --print
```

### Manage Configuration

```bash
# Initialize configuration
node ~/.claude/plugins/quality-gate/dist/cli.js quality-config --init

# Show current configuration
node ~/.claude/plugins/quality-gate/dist/cli.js quality-config --show
```

### Sync Documentation

```bash
# Sync all documentation
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync

# Sync only OpenAPI spec
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync --openapi
```

## Future Improvements

### Option 1: Global npm Package
Publish `@smite/quality-gate` to npm and install globally:
```bash
npm install -g @smite/quality-gate
quality-gate quality-check  # Would work directly
```

### Option 2: PATH Wrapper
Add a wrapper script to PATH that resolves to the plugin:
```bash
# ~/.claude/bin/quality-gate
#!/bin/bash
node "$HOME/.claude/plugins/quality-gate/dist/cli.js" "$@"
```

### Option 3: Claude Code Built-in Support
Future versions of Claude Code could support plugin path resolution natively, allowing skills to specify their executable paths relative to the plugin installation.

## Cross-Platform Compatibility

The symlink approach works on:
- ✅ **Windows**: Junctions (no admin required)
- ✅ **Linux**: Symbolic links
- ✅ **macOS**: Symbolic links

The path `~/.claude/plugins/quality-gate/` works in all shells:
- ✅ Bash/Zsh
- ✅ PowerShell
- ✅ cmd (with proper path translation)

## Maintenance

When updating the quality-gate plugin to a new version (e.g., 1.0.1), the symlink will need to be updated:

```powershell
# Remove old symlink
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\quality-gate"

# Create new symlink to new version
New-Item -ItemType Junction -Path "$env:USERPROFILE\.claude\plugins\quality-gate" -Target "$env:USERPROFILE\.claude\plugins\cache\smite\quality-gate\1.0.1"
```

This could be automated in the plugin's postinstall script.
