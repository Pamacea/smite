---
name: pattern-capture
description: Capture reusable patterns from successful implementations for future reference. Analyzes code to extract templates, conventions, and best practices.
version: 1.0.0
disable-model-invocation: true
user-invocable: true
lazy_load: true
category: workflow
tags: [patterns, learning, memory, reuse]
---

# Pattern Capture Skill

> **Lazy-loaded skill** - Captures patterns after successful implementations

## Mission

Extract and document reusable patterns from working code.

## When to Use

- **After successful feature**: "Capture this pattern"
- **After solving complex problem**: "Save this solution"
- **After establishing convention**: "Document this pattern"

## Pattern Types

| Type | Description |
|------|-------------|
| Architecture | Module structure, layering |
| Implementation | Code patterns, idioms |
| Configuration | Setup, conventions |
| Testing | Test patterns, fixtures |

## Examples

```bash
/studio capture "auth flow pattern"
/studio capture "API error handling"
/studio capture "state management pattern"
```

## Output Structure

```markdown
## Pattern: [Name]

### Context
When to use this pattern

### Implementation
Code example

### Files Found
- src/feature/example.ts

### Related Patterns
- @memory/other-pattern
```

**Version:** 1.0.0 | **Lazy Load:** Enabled
