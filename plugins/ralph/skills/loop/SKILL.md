---
name: loop
description: Auto-iterating multi-agent execution with loop until completion and workflow system
version: 1.0.0
---

# Ralph Loop Skill

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

Execute autonomous looping with hook-based iteration until task completion. Auto-generates PRD from prompt, executes user stories systematically, and continues until completion promise detected or max iterations reached.

## Core Workflow

1. **Initialize**: Generate PRD from prompt, create `.claude/loop.md`
2. **Execute**: Process user stories systematically with agents
3. **Commit**: Save progress after each completed story
4. **Loop**: Stop-hook detects completion and re-feeds if incomplete
5. **Complete**: Output `<promise>COMPLETE</promise>` when done

## Key Principles

- **Autonomous**: Runs without user intervention
- **Systematic**: Stories executed in priority order
- **Persistent**: State tracked in loop file and PRD
- **Committed**: Each story committed upon completion

## Workflow System

The loop command supports multiple workflows for different task types:

| Workflow | Name | Use Case |
|----------|------|----------|
| `spec-first` | Spec-First Development | Default workflow |
| `debug` | Debug Workflow | Bug detection and resolution |
| `refactor` | Refactor Workflow | Code quality improvement |
| `feature` | Feature Development | Feature with research |

## Flags

| Flag | Description |
|------|-------------|
| `--max-iterations <n>` | Maximum iterations (default: 50) |
| `--completion-promise <text>` | Custom completion text (default: "COMPLETE") |
| `--workflow <id>` | Select workflow to use |
| `--step <id>` | Execute specific steps only |
| `--from <id>` | Start from specific step |
| `--to <id>` | Execute up to specific step |
| `--skip <id>` | Skip specific steps |
| `--mcp=false` | Disable MCP tools |

## Usage

```bash
/loop "Build a todo app with auth"
/loop "Fix authentication bug" --workflow=debug --max-iterations=10
/loop "Refactor code quality" --workflow=refactor --skip=review
```

## Integration

- **Works with**: `/ralph` for PRD-based orchestration
- **Related to**: `/ralph:ralph` (single-pass execution)
- **Requires**: Stop hook for iteration detection
- **Best used for**: Long-running multi-step tasks

## State Files

- `.claude/loop.md` - Loop configuration and progress
- `.claude/.smite/prd.json` - Generated PRD with user stories
- State persists across sessions until completion

## Success Criteria

- ✅ `.claude/loop.md` created successfully
- ✅ PRD generated with user stories
- ✅ All user stories executed (marked `passes: true`)
- ✅ All tests passing
- ✅ Changes committed to git
- ✅ Completion promise output
- ✅ Loop file automatically deleted by stop-hook

## Error Handling

- **Loop stuck**: Check `.claude/loop.md` for current state
- **Max iterations reached**: Review progress, reset if needed
- **Hook fails**: Manual completion required
- **Story fails**: Mark as failed, continue with next

---
*Ralph Loop Skill v1.0.0 - Auto-iterating execution*
