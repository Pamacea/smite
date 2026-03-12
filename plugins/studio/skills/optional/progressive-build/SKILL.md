---
name: progressive-build
description: Progressive implementation with checkpoints and rollback. Breaks large features into small verifiable steps with automatic state saving.
version: 1.0.0
disable-model-invocation: true
user-invocable: true
lazy_load: true
category: workflow
tags: [progressive, checkpoints, incremental]
---

# Progressive Build Skill

> **Lazy-loaded skill** - For large features requiring incremental implementation

## Mission

Implement large features in small, verifiable steps with automatic checkpoints.

## When to Use

- **Large features**: "Build this SaaS module"
- **Complex systems**: "Implement payment flow"
- **Multi-step tasks**: "Create auth system"

## Progressive Workflow

```
Step 1 → Verify → Checkpoint
   ↓
Step 2 → Verify → Checkpoint
   ↓
Step 3 → Verify → Checkpoint
   ↓
Complete → Rollback if needed
```

## Examples

```bash
/studio build --progressive "SaaS platform"
/studio build --progressive "payment system"
```

## Features

- **Automatic checkpoints** after each step
- **Rollback capability** to any checkpoint
- **Progress metrics** tracking completion
- **Verification gates** between steps

## Output

```markdown
## Progressive Build: [Feature Name]

Step 1/5: [20%] ✅ Complete
Step 2/5: [40%] → In Progress
Step 3/5: [60%] ⏸ Pending
Step 4/5: [80%] ⏸ Pending
Step 5/5: [100%] ⏸ Pending
```

**Version:** 1.0.0 | **Lazy Load:** Enabled
