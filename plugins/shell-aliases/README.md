# Shell Aliases Plugin for Claude Code

Cross-platform shell aliases for Claude Code - `cc` for normal mode and `ccc` for bypass-permissions mode.

---

## Quick Start

```bash
# Install aliases (one-time setup)
/install-aliases

# Reload your shell
# PowerShell: . $PROFILE
# Bash/Zsh: source ~/.bashrc or source ~/.zshrc

# Use aliases
cc "Help me refactor this code"           # Normal mode
ccc "Fix this bug"                        # Auto-accept all edits
```

---

## What It Does

Installs global shell aliases:
- `cc` → `claude` (normal mode, asks for permission on edits)
- `ccc` → `claude --bypass-permissions` (auto-accepts all edits)

**Platform Support:**
- ✅ Windows 11 (PowerShell 5/7)
- ✅ macOS (Bash/Zsh)
- ✅ Linux (Bash/Zsh)

---

## Features

- **One-time installation** - Run once, works forever
- **Global aliases** - Works from any directory/project
- **Safe installation** - Creates backups before modifying profiles
- **Idempotent** - Can re-run safely without errors
- **Cross-platform** - Same experience on Windows, macOS, and Linux

---

## Installation

### Windows (PowerShell)

```bash
# In smite project, run:
/install-aliases

# Reload your PowerShell:
. $PROFILE

# Or close and reopen terminal
```

### macOS/Linux (Bash/Zsh)

```bash
# In smite project, run:
/install-aliases

# Reload your shell:
source ~/.bashrc   # Bash
source ~/.zshrc    # Zsh

# Or close and reopen terminal
```

---

## Usage Examples

```bash
# Normal mode (asks permission on edits)
cc "Help me write a function"
cc "Refactor this component"

# Bypass mode (auto-accepts all edits)
ccc "Fix all the bugs"
ccc "Generate this boilerplate"
```

---

## Uninstallation

### Windows

Edit your PowerShell profile and remove the lines marked with `# Claude Code aliases`:

```powershell
notepad $PROFILE
```

Delete:
```powershell
# Claude Code aliases
function cc { claude $args }
function ccc { claude --bypass-permissions $args }
# End Claude Code aliases
```

### macOS/Linux

Edit your shell config and remove the lines marked with `# Claude Code aliases`:

```bash
nano ~/.bashrc   # Bash
nano ~/.zshrc    # Zsh
```

Delete:
```bash
# Claude Code aliases
alias cc='claude'
alias ccc='claude --bypass-permissions'
# End Claude Code aliases
```

---

## Troubleshooting

### Aliases not working after reload?

**Check installation:**
```bash
# PowerShell
Get-Content $PROFILE | Select-String "Claude Code"

# Bash/Zsh
grep "Claude Code" ~/.bashrc
grep "Claude Code" ~/.zshrc
```

**Verify aliases:**
```bash
# PowerShell
Get-ChildItem Alias: | Where-Object {$_.Name -match "^c"}

# Bash/Zsh
alias cc
alias ccc
```

### PowerShell execution policy error?

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Need to reinstall?

The installer is idempotent - you can run it multiple times safely:
```bash
/install-aliases
```

---

## How It Works

1. **Detects your shell** - PowerShell, Bash, or Zsh
2. **Creates backup** - Backs up your shell profile
3. **Adds aliases** - Appends alias definitions to profile
4. **Reload shell** - You reload profile to activate aliases

**Files Modified:**
- Windows: `$PROFILE` (PowerShell profile)
- macOS/Linux: `~/.bashrc` or `~/.zshrc`

**Backups Created:**
- Windows: `$PROFILE.backup`
- macOS/Linux: `~/.bashrc.backup` or `~/.zshrc.backup`

---

## Technical Details

### Windows (PowerShell)

```powershell
# Uses PowerShell functions instead of aliases
# Functions support arguments better than aliases
function cc { claude $args }
function ccc { claude --bypass-permissions $args }
```

### macOS/Linux (Bash/Zsh)

```bash
# Uses standard shell aliases
alias cc='claude'
alias ccc='claude --bypass-permissions'
```

---

## Version

1.0.0

---

## Author

Pamacea

---

## License

MIT
