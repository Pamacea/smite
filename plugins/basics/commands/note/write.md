---
description: Write notes to Obsidian vaults with template support
argument-hint: "[<type>] [<content>] [--vault=<name>] [--overwrite]"
---

# /note write - Write Notes to Obsidian

Create or update notes in Obsidian vaults with automatic template application.

---

## Note Types

- `inbox` - Quick capture notes
- `project` - Project briefs and documentation
- `technical` - Technical notes and code documentation
- `meeting` - Meeting notes with decisions and action items
- `resource` - Resources, cheat sheets, and references

---

## Flags

| Flag | Purpose |
|------|---------|
| `--vault=<name>` | Target specific vault |
| `--overwrite` | Skip confirmation when overwriting |

---

## Examples

```bash
# Quick capture in Inbox
/note write inbox "Meeting with bank tomorrow at 3pm"
# Creates: Inbox/2024-01-15-meeting.md

# Create project brief
/note write project ClientXYZ "Website redesign project, budget 5k"
# Creates: Projects/Clients/ClientXYZ/brief.md

# Add technical notes
/note write technical ClientXYZ "Setup JWT authentication with refresh tokens"
# Appends: Projects/Clients/ClientXYZ/Notes Techniques.md

# In specific vault
/note write --vault=work project ClientABC "Mobile app development"
```

---

## Output Locations

| Type | File Location |
|------|---------------|
| inbox | `<vault>/Inbox/YYYY-MM-DD-title.md` |
| project | `<vault>/Projects/Clients/<Client>/brief.md` |
| technical | `<vault>/Projects/Clients/<Client>/Notes Techniques.md` |
| meeting | `<vault>/Meetings/YYYY-MM-DD-title.md` |
| resource | `<vault>/Resources/<category>/<title>.md` |

---

## File Conflict Handling

### Inbox Notes
If file exists: Move to `Inbox/Cleaned/` before creating new one

### Project Notes
If `brief.md` exists: Ask to overwrite or append to `Notes Techniques.md`

### Resource Notes
If file exists: Append with timestamp separator

---

## Variable Substitution

Templates support these variables:
- `{{date}}` - Current date (YYYY-MM-DD)
- `{{datetime}}` - Date and time
- `{{title}}` - Note title
- `{{content}}` - Note content
- `{{clientName}}` - Client/project name

---

**Version**: 4.0.0 | **Last Updated**: 2025-01-23
