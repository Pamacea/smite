# Shell Aliases - Quick Start Guide

## Installation Complete! ✅

Your PowerShell profile has been configured with `cc` and `ccc` aliases.

---

## Step 1: Reload Your Shell

**Option A:** Reload profile in current terminal
```powershell
. $PROFILE
```

**Option B:** Close and reopen your terminal (recommended)

---

## Step 2: Start Using Aliases

### Normal Mode (asks permission on edits)
```powershell
cc "Help me refactor this code"
cc "Write a function to parse JSON"
cc "Explain how React hooks work"
```

### Bypass Mode (auto-accepts all edits)
```powershell
ccc "Fix all TypeScript errors"
ccc "Generate boilerplate for new component"
ccc "Refactor this file to use best practices"
```

---

## Verification

Test that aliases work:
```powershell
# Should show: cc -> claude
Get-ChildItem Alias: | Where-Object {$_.Name -eq "cc"}

# Should show: ccc -> claude --bypass-permissions
Get-ChildItem Alias: | Where-Object {$_.Name -eq "ccc"}
```

---

## Uninstall

To remove aliases, edit your PowerShell profile:
```powershell
notepad $PROFILE
```

Delete these lines:
```powershell
# Claude Code aliases
function cc { claude  }
function ccc { claude --bypass-permissions  }
# End Claude Code aliases
```

---

## Need Help?

- Check backup: `C:\Users\Yanis\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1.backup`
- Reinstall: Run `/install-aliases` again (idempotent)
- Full docs: `plugins/shell-aliases/README.md`

---

## What's the Difference?

| Alias | Permissions | Best For |
|-------|-------------|----------|
| `cc` | Asks on each edit | Learning, reviewing changes |
| `ccc` | Auto-accepts all | Bulk edits, refactoring, generation |
