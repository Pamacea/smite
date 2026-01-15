---
description: Install global shell aliases (cc and ccc) for Claude Code
allowed-tools: Bash
---

# Install Shell Aliases

<objective>
Install cross-platform shell aliases for Claude Code:
- `cc` → claude (normal mode)
- `ccc` → claude --bypass-permissions (auto-accept edits)
</objective>

<context>
This command installs global shell aliases that work from any directory on your system.

Supports:
- Windows 11 (PowerShell 5/7)
- macOS (Bash/Zsh)
- Linux (Bash/Zsh)

After installation, reload your shell to activate aliases:
- PowerShell: `. $PROFILE`
- Bash/Zsh: `source ~/.bashrc` or `source ~/.zshrc`
</context>

<process>
1. **Detect platform**: Check if Windows (win32) or Unix-like (darwin/linux)
2. **Run installer script**:
   - Windows: Execute `scripts/install.ps1` via PowerShell
   - macOS/Linux: Execute `scripts/install.sh` via Bash
3. **Display success message**: Show reload instructions
</process>

<rules>
- Cross-platform compatibility (Windows, macOS, Linux)
- Must create backup before modifying shell profiles
- Must be idempotent (safe to run multiple times)
- Show clear success/failure messages
- Detect and skip if already installed
</rules>

<success_criteria>
- Aliases added to shell profile
- Backup created
- User knows how to reload shell
- `cc` and `ccc` work after shell reload
- Installer can be re-run safely
</success_criteria>
