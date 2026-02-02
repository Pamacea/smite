---
description: Format text using templates or intelligent markdown styling
argument-hint: "[<template|free>] [<content>] [--output=<file|clipboard>]"
---

# /note format - Format Content

Format text using templates or apply intelligent free-form markdown styling.

---

## Format Types

| Type | Description |
|------|-------------|
| `template` | Use specific template structure |
| `free` | Intelligent markdown formatting |
| `meeting` | Predefined meeting template |
| `project` | Predefined project template |
| `technical` | Predefined technical template |

---

## Flags

| Flag | Purpose |
|------|---------|
| `--output=<file>` | Save to file instead of terminal |
| `--output=clipboard` | Copy to clipboard |
| `--template=<name>` | Use specific template |

---

## What Free-Form Formatting Does

- Converts URLs to proper markdown links
- Formats lists consistently
- Adds proper headings hierarchy
- Creates tables from structured data
- Formats code blocks with language tags
- Adds appropriate spacing between sections
- Detects and formats code blocks
- Adds YAML frontmatter if missing

---

## Examples

```bash
# Format using specific template
/note format meeting "Discussed project timeline. Decision: use TypeScript. Action: John to setup repo."

# Free-form formatting
/note format free "API endpoints: GET /users, POST /users. Auth needed. Returns JSON."

# Format and save to file
/note format free "Project notes..." --output=Projects/notes.md

# Use custom template
/note format --template=custom "Content here..."
```

---

**Version**: 4.0.0 | **Last Updated**: 2025-01-23
