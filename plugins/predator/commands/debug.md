---
description: Systematic bug debugging with step-by-step analysis and fix verification
---

<objective>
Debug and resolve #$ARGUMENTS using the Debug workflow system with modular step execution.

The Debug workflow uses separate markdown files for each phase (00-07), systematically analyzing the bug, testing hypotheses, implementing fixes, and verifying the solution.

**Workflow Steps:**
- 00_INIT: Parse flags, create output folder, initialize debug state
- 01_ANALYZE: Gather error context, examine stack traces, identify patterns
- 02_PLAN: Create hypothesis list, define investigation strategy
- 03_EXECUTE: Test hypotheses, implement fix using TodoWrite
- 04_VALIDATE: Verify bug resolved, run regression tests
- 05_EXAMINE: Adversarial fix review (multi-agents) [if -examine]
- 06_RESOLVE: Address review findings [if issues found]
- 07_FINISH: Create PR with gh CLI [if -pr] or COMPLETE
</objective>

<variables>
BUG_DESCRIPTION = extract bug description from $ARGUMENTS
FLAGS = parse flags from $ARGUMENTS

AUTO_MODE = check if '-auto' or '-a' in FLAGS
EXAMINE_MODE = check if '-examine' or '-x' in FLAGS
PR_MODE = check if '-pr' or '-p' in FLAGS
MAX_ATTEMPTS = extract 'max_attempts=N' or default to unlimited
</variables>

<process>

## DEBUG WORKFLOW

You will execute the Debug workflow by following the steps defined in the workflow markdown files.

### Step 00: INIT

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/00_INIT.md`

Initialize the debug session.

---

### Step 01: ANALYZE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/01_ANALYZE.md`

Gather error context and identify patterns.

---

### Step 02: PLAN

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/02_PLAN.md`

Create hypotheses and investigation strategy.

**Check AUTO_MODE**: If enabled, skip approval.

---

### Step 03: EXECUTE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/03_EXECUTE.md`

Test hypotheses and implement the fix using TodoWrite.

Loop until fix verified or MAX_ATTEMPTS reached.

---

### Step 04: VALIDATE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/04_VALIDATE.md`

Verify bug is resolved and no side effects.

---

### Step 05: EXAMINE (Conditional)

**Check EXAMINE_MODE**: If enabled, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/05_EXAMINE.md`

Launch adversarial fix review agents.

---

### Step 06: RESOLVE (Conditional)

If EXAMINE found critical issues, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/06_RESOLVE.md`

Address all review findings.

---

### Step 07: FINISH

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/debug/steps/07_FINISH.md`

**Check PR_MODE**: If enabled, create a PR. Otherwise, commit the fix.

</process>

<verification>
After each step:
- **INIT**: Debug session initialized
- **ANALYZE**: Error context gathered, hypotheses formed
- **PLAN**: Investigation strategy created
- **EXECUTE**: Root cause identified, fix implemented
- **VALIDATE**: Bug verified fixed, no regressions
- **EXAMINE**: Fix reviewed (if enabled)
- **RESOLVE**: Issues addressed (if any)
- **FINISH**: PR created or commit made
</verification>

<success_criteria>

- All 8 workflow steps executed in order
- Root cause correctly identified
- Fix verified working (tested multiple times)
- No side effects or regressions
- All quality checks passed
- Workflow artifacts saved to .predator/debug/runs/
</success_criteria>

<execution_rules>

- **Read workflow files**: Use cat to read each step's .md file
- **Follow process**: Test hypotheses systematically
- **Use TodoWrite**: Track investigation progress
- **Verify thoroughly**: Test fix multiple times
- **Check regressions**: Ensure nothing else broke
</execution_rules>

<parameter_reference>

**Available Flags:**
- `-auto` / `-a` - Skip user approvals
- `-examine` / `-x` - Enable adversarial fix review
- `-pr` / `-p` - Create pull request at the end
- `-max_attempts=N` - Max fix attempts (default: unlimited)

**Usage Examples:**
```
/debug "TypeError: Cannot read property 'x' of undefined"
/debug -auto "Fix null pointer exception"
/debug -examine "Critical production bug"
/debug -max_attempts=3 "Fix with limited attempts"
```

</parameter_reference>
