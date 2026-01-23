---
description: Update statusline token cache from current context
---

# /sc

Update the statusline token cache with current context information.

This command provides accurate token counts for the statusline by:
1. Reading the current session transcript
2. Counting tokens from user/assistant messages
3. Adding base context estimate (~23K for system, tools, memory files)
4. Caching the result for the statusline to use

## Usage

```
/sc
```

## When to use

- After starting a new session to refresh token counts
- After significant conversation to see accurate usage
- When the statusline shows `*` (estimated values)

## Output

The command displays:
- Current token count
- Percentage of context window used
- Cache status (updated/created)

## Example

```
❯ /sc
● Statusline cache updated: 67,900 tokens (34%)
```

## Cache Location

`~/.claude/.context-cache/current-context.json`

Cache is valid for 60 seconds. Run `/sc` again to refresh.
