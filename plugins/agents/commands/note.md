---
description: "Unified note management for Obsidian vaults with write, format, and search capabilities"
argument-hint: "[-w|-f|-s] [type] [content|query] [--vault=<name>] [--output=<file>]"
---

# /note - Unified Obsidian Note Management

Complete note management system for Obsidian vaults with template support, multi-vault capabilities, and intelligent formatting.

---

## 🎯 Quick Start

```bash
# Write notes
/note write inbox "Meeting with bank tomorrow at 3pm"
/note write project ClientXYZ "Website redesign project"

# Format content
/note format meeting "Discussed project timeline, decision: use TypeScript"
/note format free "API endpoints: GET /users, POST /users"

# Search notes
/note search "authentication" --vault=all
```

---

## Operations

| Operation | Command | Description |
|-----------|---------|-------------|
| **Write** | `/note write` | Create/update notes with templates |
| **Format** | `/note format` | Format text with markdown styling |
| **Search** | `/note search` | Search across vaults |

---

## Multi-Vault Support

### Auto-Detection
The system automatically detects vaults from parent directories (subdirectories with `.obsidian` folder).

### Configuration
Vaults are configured in `config/vaults.json`:
```json
{
  "vaults": [
    {
      "name": "personal",
      "path": "/path/to/vault",
      "enabled": true
    }
  ]
}
```

---

## Templates

### Available Templates
- `inbox.md` - Quick capture notes
- `project-brief.md` - Project documentation
- `technical-notes.md` - Technical documentation
- `meeting.md` - Meeting notes structure
- `resource.md` - Resources and references

### Variable Substitution
- `{{date}}` - Current date (YYYY-MM-DD)
- `{{datetime}}` - Date and time
- `{{title}}` - Note title
- `{{content}}` - Note content
- `{{clientName}}` - Client/project name

---

## Detailed Documentation

See sub-commands for detailed usage:
- `/note write` - [Write documentation](commands/note/write.md)
- `/note format` - [Format documentation](commands/note/format.md)
- `/note search` - [Search documentation](commands/note/search.md)

---

## Integration

**Works with:**
- Multi-vault setups
- Obsidian (vault detection via `.obsidian` folder)
- Template system with variable substitution

**Best used for:**
- Quick note capture
- Project documentation
- Meeting notes
- Technical documentation
- Resource management

---

**Version**: 4.1.0 (Modular) | **Last Updated**: 2025-01-23

**Changes from 4.0.0:**
- Decomposed into modular sub-commands
- Reduced main command from 252 to ~80 lines
- Maintained all original functionality
- Improved organization and maintainability
