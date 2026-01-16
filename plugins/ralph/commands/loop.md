---
description: "Auto-iterating multi-agent execution with loop until completion"
argument-hint: "'<prompt>' | --max-iterations <n> | --completion-promise <text>"
allowed-tools: Bash
---

<objective>
Execute #$ARGUMENTS using autonomous looping with hook-based iteration until task completion or max iterations reached.

This command creates a Ralph Loop that:
1. Auto-generates a detailed PRD from your prompt
2. Creates `.claude/loop.md` with loop configuration
3. Executes user stories systematically using agents
4. Uses stop-hook to intercept exit and re-feed prompt if not complete
5. Continues until `<promise>COMPLETE</promise>` detected or max iterations
</objective>

<context>
Current git status: !`git status 2>&1 | head -20`
Current directory: !`pwd`
</context>

<process>

## Step 1: Parse Arguments

Parse the command line arguments:
- Extract prompt from $ARGUMENTS
- Check for `--max-iterations <n>` flag (default: 50)
- Check for `--completion-promise <text>` flag (default: "COMPLETE")

## Step 2: Initialize Loop

Run the loop initialization script:

```bash
cd plugins/ralph
node scripts/loopjs $ARGUMENTS
```

This will:
- Generate PRD from prompt using `PRDGenerator`
- Save PRD to `.claude/.smite/prd.json`
- Create `.claude/loop.md` with:
  - YAML frontmatter (iteration, max_iterations, completion_promise)
  - Full prompt with PRD details
  - User stories with acceptance criteria
  - Instructions for completion

## Step 3: Display Loop Configuration

Output the loop file content to show:
- Current iteration (1/n)
- Max iterations
- Completion promise
- PRD with user stories

## Step 4: Execute Stories

Begin executing user stories systematically:

1. Read the loop file to see which stories need completion
2. For each story not yet marked `passes: true`:
   - Invoke appropriate agent using Task tool:
     ```bash
     Task(subagent_type="<story.agent>", prompt="<story.description>")
     ```
   - Mark story as complete by setting `passes: true` in `.claude/.smite/prd.json`
   - Run tests: `npm test` (if applicable)
   - Commit changes: `git commit -m "feat: <story.id> - <story.title>"`
3. Continue until all stories complete or max iterations reached

## Step 5: Complete Loop

When ALL stories are complete:
1. Verify all acceptance criteria met
2. Run final tests: `npm test && npm run lint && npm run typecheck`
3. Update documentation if needed
4. Output completion promise:

```
<promise>COMPLETE</promise>
```

Or custom promise if specified:
```
<promise><custom-promise></promise>
```

The stop-hook will detect this and terminate the loop.

</process>

<rules>
- ALWAYS run the initialization script first
- Execute stories in order of priority (lowest number first)
- Mark each story as `passes: true` after completion
- Commit changes after each successful story
- Output completion promise ONLY when ALL stories complete
- Never exceed max_iterations
- Use Task tool for agent invocation
- Follow existing codebase patterns
</rules>

<success_criteria>
- `.claude/loop.md` created successfully
- PRD generated with user stories
- All user stories executed (marked `passes: true`)
- All tests passing
- Changes committed to git
- Completion promise output: `<promise>COMPLETE</promise>`
- Loop file automatically deleted by stop-hook
</success_criteria>
