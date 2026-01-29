---
name: predator
description: Advanced workflow system - predator, debug, and brainstorm commands
version: 1.0.0
---

# Predator Skills

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

Provide modular step-based workflows for systematic development, debugging, and brainstorming with optimal token usage and maximum instruction adherence.

## Core Workflow

1. **Input**: Command invocation by user or agent
2. **Process**:
   - Execute specialized workflow (predator/debug/brainstorm)
   - Follow 8-step modular execution (00-07)
   - Load workflow steps on-demand for context optimization
   - Save artifacts to `.claude/.smite/.predator/runs/`
3. **Output**: Completed task with documentation and optional PR

## Key Principles

- **Modular Steps**: Each workflow step is a separate markdown file
- **Load on Demand**: Instructions loaded only when needed
- **Context Optimization**: Relevant instructions always at end of context
- **Token Efficiency**: Only load what's necessary for each phase
- **Consistent Structure**: All workflows follow 00-07 step pattern

## Workflows

### Predator - Feature Implementation

**Best for**: Implementing features with systematic approach

**Flags**:
- `-auto` - Skip user approvals
- `-examine` - Enable adversarial code review
- `-pr` - Create pull request
- `-max_attempts=N` - Limit retry attempts

**Steps**: INIT → ANALYZE → PLAN → EXECUTE → VALIDATE → EXAMINE → RESOLVE → FINISH

### Debug - Bug Resolution

**Best for**: Systematic debugging and bug fixing

**Flags**:
- `-auto` - Skip user approvals
- `-examine` - Enable adversarial fix review
- `-pr` - Create pull request
- `-max_attempts=N` - Max fix attempts

**Steps**: INIT → ANALYZE → PLAN → EXECUTE → VALIDATE → EXAMINE → RESOLVE → FINISH

### Brainstorm - Idea Generation

**Best for**: Exploring problems and generating solutions

**Flags**:
- `-auto` - Skip user approvals
- `-examine` - Enable adversarial solution review
- `-pr` - Create documentation PR
- `-participants=N` - Number of idea generators (default: 3)
- `-depth=level` - shallow/medium/deep (default: medium)

**Steps**: INIT → ANALYZE → PLAN → EXECUTE → VALIDATE → EXAMINE → RESOLVE → FINISH

## Integration

- **Works with**: All SMITE agents (architect, builder, explorer, finalize)
- **Typical workflow**: Use workflows independently or combine with agents
- **Agent usage**: Agents can call Predator workflows for specialized tasks

## Workflow Files

Each workflow has:
- `workflow.md` - Workflow tree and usage documentation
- `steps/00_INIT.md` - Initialize state and parse flags
- `steps/01_ANALYZE.md` - Gather context and understand problem
- `steps/02_PLAN.md` - Create strategy and define criteria
- `steps/03_EXECUTE.md` - Implement using TodoWrite
- `steps/04_VALIDATE.md` - Verify and quality check
- `steps/05_EXAMINE.md` - Adversarial review (conditional)
- `steps/06_RESOLVE.md` - Fix issues (conditional)
- `steps/07_FINISH.md` - Complete and create PR (conditional)

## Configuration

- **Command selection**: Choose based on task type
- **Flag configuration**: Add flags for automation and review
- **Workflow customization**: Edit step files to customize behavior
- **Artifact location**: `.claude/.smite/.predator/runs/` by default

## Error Handling

- **Missing workflow files**: Report error and check installation
- **Step failure**: Report specific step and error context
- **Validation failure**: Return to earlier step or request guidance
- **Token limit**: Warn and suggest adjusting workflow depth

## Workflow Artifacts

Each run saves:
- `state.json` - Workflow state and configuration
- `01_ANALYZE.md` - Analysis findings
- `02_PLAN.md` - Implementation or investigation plan
- `03_EXECUTE.md` - Execution log
- `04_VALIDATE.md` - Validation results
- `05_EXAMINE.md` - Review findings (if enabled)
- `06_RESOLVE.md` - Issue resolution (if needed)
- `07_FINISH.md` - Completion summary
- `SUMMARY.md` - Complete workflow summary

## Best Practices

1. **Choose the right workflow**: Match workflow to task type
2. **Use flags appropriately**: `-auto` for quick tasks, `-examine` for production
3. **Review artifacts**: Check `.claude/.smite/.predator/runs/` for detailed logs
4. **Customize steps**: Edit workflow steps to match project needs
5. **Combine with agents**: Use workflows independently or with SMITE agents

---
*Auto-generated from plugin.json - Last sync: 2025-01-22*
