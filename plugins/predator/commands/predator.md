---
description: Systematic implementation using modular workflow steps (Analyze → Plan → Execute → Validate)
---

<objective>
Implement #$ARGUMENTS using the Predator workflow system with step-by-step modular execution.

The Predator workflow uses separate markdown files for each phase (00-07), loading instructions only when needed. This keeps relevant instructions at the end of context for maximum adherence while optimizing token usage.

**Workflow Steps:**
- 00_INIT: Parse flags, create output folder, initialize state
- 01_ANALYZE: Gather context, explore codebase, understand patterns
- 02_PLAN: Create file-by-file strategy, define acceptance criteria
- 03_EXECUTE: Implement changes using TodoWrite, follow plan
- 04_VALIDATE: Run lint, typecheck, build, self-check
- 05_EXAMINE: Adversarial code review (multi-agents) [if -examine]
- 06_RESOLVE: Fix all review findings [if issues found]
- 07_FINISH: Create PR with gh CLI [if -pr] or COMPLETE
</objective>

<variables>
TASK = extract task description from $ARGUMENTS
FLAGS = parse flags from $ARGUMENTS

AUTO_MODE = check if '-auto' or '-a' in FLAGS
EXAMINE_MODE = check if '-examine' or '-x' in FLAGS
PR_MODE = check if '-pr' or '-p' in FLAGS
MAX_ATTEMPTS = extract 'max_attempts=N' or default to unlimited
</variables>

<process>

## PREDATOR WORKFLOW

You will execute the Predator workflow by following the steps defined in the workflow markdown files. Each step is a separate file that you should read and execute in sequence.

### Step 00: INIT

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/00_INIT.md`

Parse the flags and initialize the workflow state.

---

### Step 01: ANALYZE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/01_ANALYZE.md`

Gather context and understand the codebase.

---

### Step 02: PLAN

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/02_PLAN.md`

Create the implementation strategy.

**Check AUTO_MODE**: If enabled, skip approval. Otherwise, use AskUserQuestion to get user approval before proceeding.

---

### Step 03: EXECUTE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/03_EXECUTE.md`

Implement the changes using TodoWrite to track progress.

---

### Step 04: VALIDATE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/04_VALIDATE.md`

Run quality checks and verify the implementation.

---

### Step 05: EXAMINE (Conditional)

**Check EXAMINE_MODE**: If enabled, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/05_EXAMINE.md`

Launch adversarial code review agents.

---

### Step 06: RESOLVE (Conditional)

If EXAMINE found critical issues, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/06_RESOLVE.md`

Fix all identified issues.

---

### Step 07: FINISH

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/predator/steps/07_FINISH.md`

**Check PR_MODE**: If enabled, create a pull request. Otherwise, complete the workflow with a commit.

</process>

<verification>
After each step:
- **INIT**: State variables initialized, output folder created
- **ANALYZE**: Context gathered, patterns identified
- **PLAN**: Strategy created, user approval obtained (unless auto mode)
- **EXECUTE**: All tasks completed, changes implemented
- **VALIDATE**: All quality checks passed
- **EXAMINE**: Code reviewed (if enabled)
- **RESOLVE**: All critical issues fixed (if any found)
- **FINISH**: PR created or commit made
</verification>

<success_criteria>

- All 8 workflow steps executed in order
- Each step's markdown file read and followed
- Implementation stays strictly within scope
- Code passes all validation checks
- Pull request created (if -pr flag) or commit made
- Workflow artifacts saved to .predator/runs/
</success_criteria>

<execution_rules>

- **Read workflow files**: Use cat to read each step's .md file before executing
- **Follow instructions precisely**: Each step contains detailed instructions to follow
- **Use TodoWrite**: Track progress in EXECUTE phase
- **Conditional execution**: EXAMINE and RESOLVE only run based on flags
- **Output clear headings**: Each phase should output its name
- **Save artifacts**: Each step should save its output to the run folder
</execution_rules>

<parameter_reference>

**Available Flags:**
- `-auto` / `-a` - Skip user approvals (yolo mode)
- `-examine` / `-x` - Enable adversarial code review
- `-pr` / `-p` - Create pull request at the end
- `-max_attempts=N` - Maximum attempts for loops (default: unlimited)

**Usage Examples:**
```
/predator "Add user authentication"
/predator -auto "Implement payment system"
/predator -examine "Build admin dashboard"
/predator -auto -examine -pr "Complete feature with everything"
/predator -max_attempts=5 "Fix critical bug with retries"
```

</parameter_reference>
