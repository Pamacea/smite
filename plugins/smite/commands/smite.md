---
description: Install all SMITE commands automatically
allowed-tools: Bash
---

<objective>
Install all SMITE development commands to ~/.claude/commands/ automatically with cross-platform support.
</objective>

<context>
This command will copy all SMITE command files from the smite plugin to your ~/.claude/commands/ directory.

Works on Windows, macOS, and Linux.
</context>

<process>
1. **Detect platform**: Check if Windows or Unix-like system
2. **Run installer**: Execute the appropriate installer script
   - Windows: PowerShell script
   - macOS/Linux: Bash script
3. **Verify installation**: Confirm all commands are copied
</process>

<rules>
- Cross-platform compatibility (Windows, macOS, Linux)
- Overwrite existing commands
- Show clear success/failure messages
- Use appropriate script for each platform
</rules>

<success_criteria>
- All command files copied to ~/.claude/commands/
- User can immediately use /oneshot, /explore, /debug, etc.
- Clear confirmation of what was installed
- Works on all major platforms
</success_criteria>