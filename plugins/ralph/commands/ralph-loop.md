---
description: "Looping multi-agent execution with auto-iteration using Ralph Wiggum technique"
argument-hint: "'<prompt>' | --max-iterations <n> | --completion-promise <text>"
---

# Ralph Loop

Autonomous looping execution that iterates until completion or max iterations reached.

## Quick Start

```bash
# Basic usage - auto-generate PRD and loop until complete
/ralph-loop "Build a todo app with authentication and task filtering"

# With custom max iterations
/ralph-loop "Create a REST API for user management" --max-iterations 100

# With custom completion promise
/ralph-loop "Build a dashboard with analytics" --completion-promise "DEPLOYMENT_SUCCESS"

# Combined options
/ralph-loop "Full-stack e-commerce platform" --max-iterations 100 --completion-promise "ALL_TESTS_PASS"
```

## How It Works

Ralph Loop uses a **hook-based system** that creates auto-iteration within a single Claude Code session:

1. **Generate PRD** - Automatically creates detailed PRD from your prompt
2. **Setup Loop** - Creates `.claude/ralph-loop.local.md` with YAML frontmatter
3. **Execute** - Claude executes user stories using the Task tool
4. **Hook Intercepts** - When Claude tries to exit, the stop-hook checks progress
5. **Iterate** - If not complete, re-feeds the SAME prompt with updated context
6. **Complete** - Stops when `<promise>TEXT</promise>` is detected in output

## Loop Mechanics

### The Loop File

The `.claude/ralph-loop.local.md` file contains:

```markdown
---
active: true
iteration: 1
max_iterations: 50
completion_promise: "COMPLETE"
started_at: "2025-01-15T12:00:00Z"
prd_path: ".smite/prd.json"
---

# Ralph Loop Execution

**Iteration: 1/50**

## Task
Build a todo app...

## User Stories
- US-001: Setup Next.js project
- US-002: Add authentication
...

## Instructions
When ALL stories are complete, output:
<promise>COMPLETE</promise>
```

### Iteration Process

**Iteration 1:**
- Claude executes stories
- Modifies files and commits changes
- Tries to exit

**Hook Intercept:**
- Checks if `<promise>COMPLETE</promise>` in output
- If NO → increments iteration counter
- Blocks exit and re-feeds prompt

**Iteration 2:**
- Same prompt, but with NEW context:
  - Modified files from Iteration 1
  - Git history with commits
  - Updated `.smite/prd.json` with story status
- Claude continues from where it left off

**Repeat until:**
- All stories pass AND `<promise>COMPLETE</promise>` detected
- OR max_iterations reached

## Completion Detection

To complete the loop successfully, Claude must output:

```
<promise>COMPLETE</promise>
```

Or your custom promise:
```
<promise>ALL_TESTS_PASS</promise>
```

**Best Practice:** Include this in your PRD instructions:

```markdown
## Completion Condition

When ALL user stories are complete:
1. All tests passing
2. Documentation updated
3. Code committed

Then output:
<promise>COMPLETE</promise>
```

## Usage Examples

### Example 1: Basic App

```bash
/ralph-loop "Build a task manager with:
- User authentication
- Task CRUD operations
- Category filtering
- Due date reminders
- Export to CSV"
```

Ralph will:
1. Generate PRD with 8-10 user stories
2. Execute stories iteratively
3. Each iteration picks up where previous left off
4. Complete when all stories done

### Example 2: Complex Feature

```bash
/ralph-loop "Add real-time collaboration to existing app:
- WebSocket integration
- Presence indicators
- Conflict resolution
- Activity feed
- Notifications" --max-iterations 100 --completion-promise "REALTIME_READY"
```

### Example 3: Refactoring

```bash
/ralph-loop "Refactor the codebase:
- Migrate to TypeScript
- Update to Next.js 14
- Replace Redux with Zustand
- Improve type safety
- Add comprehensive tests" --completion-promise "REFACTOR_COMPLETE"
```

## Options

### `--max-iterations <number>`

**Default:** 50

Maximum number of loop iterations before giving up.

```bash
/ralph-loop "Simple feature" --max-iterations 20
```

**Guidelines:**
- Simple feature: 20-30 iterations
- Medium feature: 50 iterations (default)
- Complex feature: 100 iterations
- Multi-page app: 150+ iterations

### `--completion-promise <text>`

**Default:** "COMPLETE"

Custom completion promise to detect in output.

```bash
/ralph-loop "Build API" --completion-promise "API_DEPLOYED"
```

**Best Practices:**
- Use UPPERCASE for visibility
- Make it specific to your task
- Avoid common words
- Document it in your PRD

## Monitoring Progress

### Check Loop Status

```bash
# View loop file
cat .claude/ralph-loop.local.md

# Check current iteration
grep "iteration:" .claude/ralph-loop.local.md
```

### Check PRD Progress

```bash
# See which stories are complete
cat .smite/prd.json | grep -A2 '"passes"'
```

### View History

```bash
# See commits from iterations
git log --oneline

# See file changes
git diff
```

## Canceling the Loop

To stop the loop manually:

```bash
# Delete the loop file
rm .claude/ralph-loop.local.md

# Or use the cancel command
/ralph cancel
```

## Troubleshooting

### Loop Won't Complete

**Problem:** Loop reaches max iterations without completing.

**Solutions:**
1. Check if completion promise is being output:
   ```bash
   grep -r "<promise>COMPLETE</prompt>" .claude/
   ```
2. Increase max iterations
3. Check which stories are failing:
   ```bash
   cat .smite/prd.json | jq '.userStories[] | select(.passes == false)'
   ```
4. Manually complete remaining stories

### Loop Not Starting

**Problem:** Command executes but loop doesn't start.

**Check:**
1. `.claude/ralph-loop.local.md` exists
2. Hook is configured in `hooks.json`
3. Hook file is executable: `chmod +x dist/stop-hook.sh`

### Same Mistake Repeated

**Problem:** Claude makes same error every iteration.

**Solutions:**
1. Add explicit instructions to PRD
2. Increase story detail
3. Split large stories into smaller ones
4. Add negative examples to PRD

## Best Practices

### 1. Story Sizing

Keep stories SMALL - each should complete in 1-2 iterations.

**Too Big:**
- "Build entire authentication system"

**Just Right:**
- "Setup NextAuth configuration"
- "Create login form component"
- "Add session management"
- "Implement protected routes"

### 2. Explicit Completion

Always include completion instructions in PRD:

```markdown
## Completion Checklist

Before outputting <promise>COMPLETE</promise>:
- [ ] All user stories marked `passes: true`
- [ ] All tests passing (npm test)
- [ ] Typecheck passes (npm run typecheck)
- [ ] Lint passes (npm run lint)
- [ ] Documentation updated
- [ ] Changes committed to git

Then output: <promise>COMPLETE</promise>
```

### 3. Iteration Awareness

Design PRDs to work across iterations:

```markdown
## Iteration 1: Foundation
- Setup project structure
- Configure dependencies
- Create base components

## Iteration 2: Core Features
- Implement authentication
- Build data models
- Create API endpoints

## Iteration 3: Polish
- Add error handling
- Improve UX
- Write tests
```

### 4. Checkpoint Often

Commit after each completed story:

```markdown
After completing each user story:
1. Run tests: npm test
2. Commit changes: git commit -m "feat: US-001 - story title"
3. Update PRD: mark story as `passes: true`
4. Continue to next story
```

## Performance

**Typical iteration speed:**
- Simple story: 1-2 iterations
- Medium story: 3-5 iterations
- Complex story: 5-10 iterations

**Total execution time:**
- 5 stories @ 3 iterations each = ~15 iterations
- At ~2 min/iteration = 30 minutes total
- With parallel execution = 20 minutes (33% faster)

## Advanced: Custom Loop Files

For maximum control, create the loop file manually:

```bash
# Create .claude/ralph-loop.local.md
cat > .claude/ralph-loop.local.md <<'EOF'
---
active: true
iteration: 1
max_iterations: 100
completion_promise: "CUSTOM_SUCCESS"
started_at: 2025-01-15T12:00:00Z
---

Your custom prompt here...

When complete, output: <promise>CUSTOM_SUCCESS</promise>
EOF
```

Then start Claude normally - the hook will handle the loop.

## See Also

- `/ralph execute` - Single-pass execution (no loop)
- `/ralph status` - Check PRD progress
- `/ralph cancel` - Cancel active workflow

---

**Inspired by:** Ralph Wiggum (Claude Code official)
**Enhanced by:** SMITE Multi-Agent System
