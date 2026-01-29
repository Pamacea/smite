---
name: oneshot
description: Ultra-fast feature implementation - Explore then Code then Test
version: 1.0.0
---

# OneShot Skill

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

Implement features at maximum speed using the OneShot methodology: surgical exploration, immediate implementation, and focused validation. Speed over completeness - ship fast, iterate later.

## Core Workflow

1. **EXPLORE** (5-10 min max)
   - Launch 1-2 parallel subagents maximum to find relevant files
   - Use `/toolkit search` for semantic code search
   - Find files to use as examples or edit targets
   - Be surgical - know exactly what to search for
   - **NO PLANNING PHASE** - gather context and move to coding

2. **CODE** (implement immediately)
   - Start coding as soon as basic context available
   - Follow existing codebase patterns and style
   - Prefer clear variable/method names over comments
   - Stay STRICTLY in scope - change only what's needed
   - **NO comments** unless absolutely necessary
   - **NO refactoring** beyond feature requirements
   - Run autoformatting scripts when done
   - Fix reasonable linter warnings as you go

3. **TEST** (validate quality)
   - Check package.json for available scripts (lint, typecheck, format)
   - Run: `npm run lint && npm run typecheck` (or equivalent)
   - If checks fail: fix errors immediately and re-run
   - Stay in scope - don't run full test suite unless requested
   - For major changes only: run relevant tests with `npm test -- <pattern>`

## Key Principles

**Critical constraints**:
- **SPEED IS PRIORITY**: Move fast, break nothing
- **NO PLANNING**: Trust exploration and code directly
- **PARALLEL AGENTS**: Max 2 agents during explore phase
- **MINIMAL TESTS**: Lint + typecheck only (unless user requests more)
- **STAY FOCUSED**: Implement exactly what's requested, nothing more
- **ULTRA THINK**: Always engage deep reasoning for optimal solutions
- **If stuck or uncertain**: ask user immediately instead of over-exploring

## Usage

```bash
/oneshot "Add user profile page with avatar upload"
/oneshot "Fix the login button alignment"
/oneshot "Add dark mode toggle to settings"
```

## When to Use OneShot

✅ **Good for**:
- Well-defined, small features
- Bug fixes with clear solutions
- UI tweaks and adjustments
- Adding simple components
- Configuration changes

❌ **NOT for**:
- Complex multi-file changes
- Architecture decisions
- Features requiring research
- Large refactoring
- Use `/epct` or `/predator` instead

## Integration

- **Works with**: `/toolkit search` for exploration
- **Required by**: Quick iteration workflows
- **Requires**: Semantic search for context gathering
- **Best used for**: Tasks under 30 minutes

## Success Criteria

- ✅ Feature implemented following existing codebase patterns
- ✅ Code passes linting and type checking
- ✅ Implementation stays strictly within requested scope
- ✅ No unnecessary comments or refactoring
- ✅ Autoformatting applied where available

## Error Handling

- **Context insufficient**: Ask user for clarification immediately
- **Pattern unclear**: Use `/toolkit search` to find examples
- **Lint/typecheck fails**: Fix and re-run until clean
- **Scope creep**: Remind user of original request, stay focused

## Comparison to EPCT

| Aspect | OneShot | EPCT |
|--------|---------|------|
| **Planning** | None | Detailed plan required |
| **Speed** | Maximum | Thorough |
| **Scope** | Small features | Any size |
| **Validation** | Lint + typecheck | Full test suite |
| **Use case** | Quick iteration | Production-ready |

---
*OneShot Skill v1.0.0 - Ultra-fast implementation*
