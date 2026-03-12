# Essentials Plugin - Quick Reference

> **Productivity utilities** - Auto-rename, shell aliases

---

## Quick Start

```bash
# Installation
/plugin install essentials

# Install shell aliases (optional)
/install-aliases

# Use aliases
cc "Build my feature"       # Normal mode
ccc "Quick fix"            # Bypass mode
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/install-aliases` | Install cc/ccc shell aliases |
| `/rename [name]` | Manual session rename |

---

## Aliases

| Alias | Mode | Platforms |
|-------|------|-----------|
| **cc** | Normal (respects permissions) | All |
| **ccc** | Bypass (skips confirmations) | All |

---

## Auto-Rename Patterns

| Prefix | Usage | Example |
|--------|-------|---------|
| `Fix:` | Bug fixes | `Fix: login bug` |
| `Add:` | New features | `Add: user API` |
| `Update:` | Modifications | `Update: schema` |
| `Refactor:` | Restructuring | `Refactor: auth` |
| `Debug:` | Investigation | `Debug: memory leak` |

---

## Config File

**Location:** `.claude/.smite/essentials.json`

```json
{
  "autoRename": {
    "enabled": true,
    "maxNameLength": 50
  },
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

## Platforms

| OS | Shells |
|----|--------|
| **Windows** | PowerShell, cmd.exe |
| **macOS** | Bash, Zsh |
| **Linux** | Bash, Zsh |

---

## Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| `SessionStart` | Session starts | Set initial name |
| `PostToolUse` | After Write/Edit/Bash | Update name |
| `UserPromptSubmit` | After user prompt | Update name |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Aliases not found | Run `/install-aliases` again |
| Auto-rename not working | Check `autoRename.enabled: true` |
| Name too long | Adjust `maxNameLength` |

---

## Installation Paths

| Shell | Config |
|-------|--------|
| PowerShell | `$PROFILE` |
| Bash | `~/.bashrc` |
| Zsh | `~/.zshrc` |
| cmd.exe | `%USERPROFILE%\cc.bat` |

---

*Version: 2.0.0 | Last Updated: 2026-03-12*
