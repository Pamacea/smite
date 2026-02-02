---
description: Search notes across one or multiple Obsidian vaults
argument-hint: "[<query>] [--vault=<name|all>] [--type=<type>] [--limit=<n>]"
---

# /note search - Search Notes

Search for notes across one or multiple Obsidian vaults.

---

## Search Locations

- File names
- YAML frontmatter
- File content
- Tags (#tag format)

---

## Flags

| Flag | Purpose |
|------|---------|
| `--vault=<name|all>` | Search specific vault or all vaults |
| `--type=<type>` | Filter by note type (inbox, project, etc.) |
| `--limit=<n>` | Limit results (default: 20) |

---

## Result Ranking

| Match Type | Priority |
|------------|----------|
| Exact filename match | Highest |
| Frontmatter match | High |
| Title match | Medium |
| Content match | Normal |

---

## Examples

```bash
# Search all vaults
/note search "authentication" --vault=all

# Search specific vault
/note search "ClientXYZ" --vault=work

# Search by type
/note search "meeting" --type=inbox

# Limited results
/note search "API" --limit=10

# Search current vault
/note search "budget"
```

---

**Version**: 4.0.0 | **Last Updated**: 2025-01-23
