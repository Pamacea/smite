---
lazy_load: true
name: install-aliases
description: ONE-TIME installation command for Claude Code global shell aliases. Run ONCE per machine to install cc (normal mode) and ccc (bypass-permissions mode) aliases across PowerShell, Bash, Zsh, and cmd.exe. Cross-platform with automatic shell detection, backup creation, and verification. Specific phrases: 'install aliases', 'setup cc command', 'global claude aliases'. (user)
version: 3.1.0
---

## Mission

Cross-platform shell aliases for Claude Code - `cc` for normal mode and `ccc` for bypass-permissions mode.

---

## When to Use

- **First-time setup**: Run once when installing Claude Code
- **New machine**: Run on each new development machine
- **Alias missing**: Run if cc/ccc commands don't work
- **Shell change**: Re-run after switching shells

### Examples
```bash
# Installation command
/install-aliases

# After installation
cc "build my feature"          # Normal mode (asks permission)
ccc "generate boilerplate"     # Bypass mode (auto-accepts)
```

---

## Supported Platforms

| Platform | Shell | Config File | Aliases |
|----------|-------|-------------|---------|
| **Windows** | PowerShell | `$PROFILE` | cc, ccc |
| **Windows** | cmd.exe | `%USERPROFILE%\cc.bat` | cc, ccc |
| **macOS/Linux** | Bash | `~/.bashrc` | cc, ccc |
| **macOS/Linux** | Zsh | `~/.zshrc` | cc, ccc |

## Aliases

- **`cc`**: Normal mode - Respects all hooks and permissions
- **`ccc`**: Bypass-permissions mode - Skips confirmation prompts

## Installation Process

1. **Detect shell**: Automatically identifies current shell
2. **Backup**: Creates backup of existing config file
3. **Install**: Adds aliases to appropriate config file
4. **Verify**: Tests installation and reports status
5. **Instructions**: Shows next steps (reload shell, test aliases)

## Safety Features

- **Automatic backup**: Never overwrites without backup
- **Idempotent**: Safe to run multiple times
- **Rollback**: Backup created for manual rollback
- **Non-destructive**: Won't remove existing aliases
- **Verification**: Confirms installation success

## Configuration

Config file: `.claude/.smite/essentials.json`

```json
{
  "shell": {
    "enabled": true,
    "aliases": {
      "cc": "claude",
      "ccc": "claude-code"
    }
  }
}
```

---

*Version: 3.1.0 | Cross-platform shell aliases*
