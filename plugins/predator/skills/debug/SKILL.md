---
name: debug
description: Systematic bug debugging with step-by-step analysis and fix verification
version: 1.0.0
---

# Debug Workflow Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Systematic bug debugging with step-by-step analysis, hypothesis testing, and fix verification. Uses modular workflow files loaded on-demand for optimal token usage.

## Core Workflow

**8-Step Modular Execution**:

1. **INIT** - Parse flags, initialize debug state
2. **ANALYZE** - Gather error context, examine stack traces
3. **PLAN** - Create hypothesis list, define investigation strategy
4. **EXECUTE** - Test hypotheses, implement fix
5. **VALIDATE** - Verify bug resolved, run regression tests
6. **EXAMINE** - Adversarial fix review [if -examine]
7. **RESOLVE** - Address review findings [if issues found]
8. **FINISH** - Create PR [if -pr] or commit locally

## Key Principles

- **Systematic**: Follow all 8 steps in order
- **Hypothesis-Driven**: Test root cause theories systematically
- **Verified**: Test fix multiple times before declaring complete
- **No Regressions**: Ensure nothing else broke

## Flags

| Flag | Description |
|------|-------------|
| `-auto` / `-a` | Skip user approvals |
| `-examine` / `-x` | Enable adversarial fix review |
| `-pr` / `-p` | Create pull request at the end |
| `-max_attempts=N` | Max fix attempts (default: unlimited) |

## Usage

```bash
/debug "TypeError: Cannot read property 'x' of undefined"
/debug -auto "Fix null pointer exception"
/debug -examine "Critical production bug"
/debug -max_attempts=3 "Fix with limited attempts"
```

## Workflow Steps

### Step 00: INIT
Parse flags, create output folder, initialize debug state.

### Step 01: ANALYZE
Gather error context, examine stack traces, identify patterns.

### Step 02: PLAN
Create hypothesis list, define investigation strategy.

### Step 03: EXECUTE
Test hypotheses, implement fix using TodoWrite. Loop until fix verified.

### Step 04: VALIDATE
Verify bug is resolved and no side effects.

### Step 05: EXAMINE (Conditional)
Launch adversarial fix review agents if -examine flag set.

### Step 06: RESOLVE (Conditional)
Address all review findings if issues found.

### Step 07: FINISH
Create PR with gh CLI or commit locally.

## Integration

- **Works with**: `/toolkit detect` for bug patterns
- **Related to**: `/debug` (basics) for simpler debugging
- **Requires**: Workflow step files in `workflows/debug/steps/`
- **Best used for**: Complex bugs requiring systematic approach

## Success Criteria

- ✅ All 8 workflow steps executed in order
- ✅ Root cause correctly identified
- ✅ Fix verified working (tested multiple times)
- ✅ No side effects or regressions
- ✅ All quality checks passed

## Error Handling

- **Hypothesis wrong**: Test next hypothesis in list
- **Fix doesn't work**: Re-analyze root cause
- **Regression found**: Rollback and try alternative fix
- **Max attempts reached**: Report findings and request guidance

---
*Debug Workflow Skill v1.0.0 - Systematic bug resolution*
