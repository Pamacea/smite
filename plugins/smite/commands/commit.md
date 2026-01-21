---
description: Quick commit and push with minimal, clean messages
model: haiku
allowed-tools: Bash(git :*), Bash(npm :*), Bash(pnpm :*)
---

<objective>
Quickly analyze git changes and create a conventional commit message following the commitizen format (e.g., "update(statusline): refresh spend data"). This command prioritizes speed and efficiency for straightforward commits with robust error handling.
</objective>

<context>
Git state: !`git status 2>&1`
Staged changes: !`git diff --cached --stat 2>&1`
Unstaged changes: !`git diff --stat 2>&1`
Recent commits: !`git log --oneline -5 2>&1`
Current branch: !`git branch --show-current 2>&1`
</context>

<process>
1. **Verify git repository**: Check if we're in a valid git repository
   - Run `git rev-parse --git-dir` to verify
   - If error: inform user "Not a git repository" and exit

2. **Clean Windows device files**: Remove problematic files BEFORE staging
   - Run Windows cleanup: `cmd /c "for %f in (nul con prn aux com1 com2 com3 com4 com5 com6 com7 com8 com9 lpt1 lpt2 lpt3 lpt4 lpt5 lpt6 lpt7 lpt8 lpt9) do @if exist %f del /f /q %f 2>nul"`
   - If command fails on non-Windows: continue without error
   - This prevents "error: short read while indexing nul"

3. **Analyze changes**: Review git status to determine what needs to be committed
   - Parse output from `git status --porcelain`
   - If nothing staged but unstaged changes exist: stage all changes with `git add .`
   - If nothing to commit: inform user and exit

4. **Determine commit type and scope**:
   - Types: `feat`, `fix`, `update`, `docs`, `chore`, `refactor`, `test`, `perf`, `revert`
   - Scope: Identify the main area affected (e.g., `statusline`, `auth`, `api`, `ui`, `commands`)
   - Use `update` for refreshing/updating existing features
   - Use `feat` for new features
   - Use `fix` for bug fixes

5. **Generate commit message**:
   - Format: `type(scope): brief description`
   - Keep it under 72 characters
   - Use imperative mood ("add" not "added")
   - Start description with lowercase
   - Be specific but concise
   - Example: `update(statusline): refresh spend data`

6. **Create commit**: Execute `git commit -m "message" 2>&1` immediately with the generated message
   - Capture output to detect errors
   - On Windows, redirect stderr to stdout: use `2>&1`
   - Handle common errors:
     - "nothing to commit": Inform user and exit gracefully
     - "fatal: not a git repository": Clear error message
     - **PowerShell hook errors** (".ps1 extension", "Processing -File"): Automatically retry with `--no-verify`
     - Other hook failures: Show hook output and suggest bypass with --no-verify
   - **IMPORTANT Windows PowerShell Issue**: If error contains "does not have a '.ps1' extension", immediately retry with `git commit --no-verify -m "message"`

7. **Push changes**: After successful commit, push to remote with `git push 2>&1`
   - Check if commit was successful before pushing
   - Handle push errors gracefully (e.g., remote rejected, network issues)
</process>

<success_criteria>
- Git repository validation passed
- Windows reserved files filtered out
- Changes properly staged if needed
- Commit message follows format: `type(scope): description`
- Commit created successfully
- Changes pushed to remote (or error handled gracefully)
- Clear user feedback on all operations
</success_criteria>

<rules>
- **SPEED OVER PERFECTION**: Generate one good commit message and commit immediately
- **NO INTERACTION**: Never use AskUserQuestion - just analyze and commit
- **AUTO-STAGE**: If changes exist but nothing staged, stage everything
- **AUTO-PUSH**: Always push after committing (unless push fails)
- **MINIMAL OUTPUT**: Brief confirmation of what was committed
- **IMPERATIVE MOOD**: Use "add", "update", "fix", not past tense
- **LOWERCASE**: Description starts lowercase after colon
- **ERROR HANDLING**: Always redirect stderr with `2>&1` on Windows
- **WINDOWS COMPATIBILITY**: Filter out reserved device names (nul, con, prn, aux, com1-9, lpt1-9)
- **POWERSELL HOOK BUG**: On Windows, if hook fails with ".ps1 extension" error, automatically retry with --no-verify
- **GRACEFUL FAILURES**: If git operations fail, inform user clearly and exit
</rules>
