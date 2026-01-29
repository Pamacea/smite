---
name: debug
description: Systematic bug debugging with deep analysis and resolution
version: 1.0.0
---

# Debug Skill

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

You are a systematic debugging specialist. Follow this ultra-deep analysis workflow to identify, understand, and resolve bugs with comprehensive root cause analysis.

## Core Workflow

1. **ANALYZE**: Deep log/error analysis
   - Parse the provided log/error message carefully
   - Extract key error patterns, stack traces, and symptoms
   - Identify error types: runtime, compile-time, logic, performance
   - **CRITICAL**: Document exact error context and reproduction steps

2. **EXPLORE**: Targeted codebase investigation
   - Use `/toolkit search` and `grepai` for semantic code search
   - Find all files related to the failing component/module
   - Examine recent changes that might have introduced the bug
   - **ULTRA THINK**: Connect error symptoms to potential root causes

3. **ULTRA-THINK**: Deep root cause analysis
   - **THINK DEEPLY** about the error chain: symptoms → immediate cause → root cause
   - Consider all possible causes:
     - Code logic errors
     - Configuration issues
     - Environment problems
     - Race conditions
     - Memory issues
     - Network problems
   - **CRITICAL**: Map the complete failure path from root cause to visible symptom
   - Validate hypotheses against the evidence

4. **RESEARCH**: Solution investigation
   - Search for similar issues and solutions online
   - Check documentation for affected libraries/frameworks
   - Look for known bugs, workarounds, and best practices

5. **IMPLEMENT**: Systematic resolution
   - Choose the most appropriate solution based on analysis
   - Follow existing codebase patterns and conventions
   - Implement minimal, targeted fixes
   - **STAY IN SCOPE**: Fix only what's needed for this specific bug
   - Add defensive programming where appropriate

6. **VERIFY**: Comprehensive testing
   - Test the specific scenario that was failing
   - Run related tests to ensure no regressions
   - Check edge cases around the fix
   - **CRITICAL**: Verify the original error is completely resolved

## Key Principles

- **ULTRA THINK** at each phase transition
- Use parallel agents for comprehensive investigation
- Document findings and reasoning at each step
- **NEVER guess** - validate all hypotheses with evidence
- **MINIMAL CHANGES**: Fix root cause, not symptoms
- Test thoroughly before declaring resolution complete

## Priority

Understanding > Speed > Completeness. Every bug must be fully understood before attempting fixes.

## Integration

- **Works with**: `/toolkit detect` for bug detection
- **Required by**: predator debug workflow
- **Requires**: toolkit for semantic search
- **Best used after**: Bug detected via tests or user reports

## Usage

```bash
# Debug with error log
/debug "Error: Cannot read property 'undefined' of reading userId"

# Debug with problem description
/debug "Authentication fails after token refresh"

# Debug with stack trace
/debug "TypeError: null.toString() at AuthService.ts:42"
```

## Error Types

| Type | Symptoms | Approach |
|------|----------|----------|
| **Runtime** | Crashes, exceptions | Stack trace analysis, code flow |
| **Compile-time** | Type errors, syntax | Type checking, AST analysis |
| **Logic** | Wrong behavior, incorrect output | Logic tracing, edge cases |
| **Performance** | Slow, memory leaks | Profiling, optimization |
| **Race** | Intermittent issues | Concurrency analysis, timing |

## Deep Analysis Techniques

### Log Analysis
- Extract timestamps, error codes, stack traces
- Identify error propagation patterns
- Look for correlation with system events

### Code Investigation
- Trace execution path to error location
- Check variable states and data flow
- Examine error handling patterns
- Review recent commits affecting the area

### Root Cause Mapping
- **WHY technique**: Ask "why" 5 times minimum
- Consider environmental factors
- Check for timing/concurrency issues
- Validate assumptions about data/state

## Error Handling

- **Ambiguous error**: Request more context (logs, reproduction steps)
- **Multiple possible causes**: Test each hypothesis systematically
- **Cannot reproduce**: Request reproduction steps or additional logs
- **Fix doesn't work**: Re-analyze root cause, avoid band-aid solutions

---
*Debug Skill v1.0.0 - Systematic bug resolution*
