# Step 1: Write Notes

**Flag**: `-w` or `--write`

## Purpose

Create or update notes in Obsidian vaults with automatic template application, variable substitution, and intelligent file placement.

## What To Do

### 1. Parse Arguments

Extract the following:
- **Note type**: `inbox`, `project`, `technical`, `meeting`, `resource`
- **Content**: Note content and context from arguments
- **Flags**: `--vault=<name>`, `--overwrite`

### 2. Determine Location

**Vault Selection:**
- If `--vault` specified: Use that vault
- Otherwise: Auto-detect current vault or ask user

**Load Configuration:**
- Read `config/vaults.json` for vault paths
- Read `config/folder-structure.json` for folder organization
- Load templates from `templates/` directory

**Determine Target Folder:**
```
inbox      → Inbox/
project    → Projects/Clients/<ClientName>/
technical  → Projects/Clients/<ClientName>/
meeting    → Meetings/
resource   → Resources/Cheat Sheets/
```

### 3. Select Template

Load appropriate template based on note type:

**Templates:**
- `inbox.md` - Quick capture notes
- `project-brief.md` - Project documentation
- `technical-notes.md` - Technical documentation
- `meeting.md` - Meeting notes structure
- `resource.md` - Resources and references

### 4. Apply Variable Substitution

Replace template variables with actual values:

**Available Variables:**
```markdown
{{date}}        → 2025-01-22
{{datetime}}    → 2025-01-22T10:30:00
{{title}}       → Note title
{{content}}     → Note content
{{clientName}}  → Client/project name
{{projectName}} → Project name
{{overview}}    → Project overview
{{context}}     → Additional context
```

**Example Template:**
```markdown
---
title: {{title}}
date: {{date}}
type: {{type}}
---

# {{title}}

{{content}}

## Context
{{context}}
```

**After Substitution:**
```markdown
---
title: Project Brief
date: 2025-01-22
type: project
---

# Project Brief

Website redesign project with budget 5k

## Context
ClientXYZ e-commerce platform
```

### 5. Handle File Conflicts

Apply conflict handling rules based on note type:

#### Inbox Notes
- **If file exists**: Move existing file to `Inbox/Cleaned/`
- **Then**: Create new file with timestamp
- **Format**: `YYYY-MM-DD-title.md`

#### Project Notes
- **If `brief.md` exists**: Ask to overwrite or append to `Notes Techniques.md`
- **If `Notes Techniques.md` exists**: Append with separator
- **Otherwise**: Create new `brief.md`

#### Technical Notes
- **Always**: Append to `Notes Techniques.md`
- **Separator**: Add timestamp and heading before new content

#### Meeting Notes
- **If file exists**: Append with timestamp separator
- **Format**: `YYYY-MM-DD-meeting-title.md`

#### Resource Notes
- **If file exists**: Append with timestamp separator
- **Format**: `topic-name.md`

### 6. Create File

**Steps:**
1. Create missing folders automatically (except top-level)
2. Write content with proper YAML frontmatter
3. Validate YAML frontmatter format
4. Report file path to user

**YAML Frontmatter:**
```yaml
---
title: Note Title
date: 2025-01-22
type: inbox
tags: [tag1, tag2]
created: 2025-01-22T10:30:00Z
modified: 2025-01-22T10:30:00Z
---
```

### 7. Update Index (Optional)

If configured, add note to relevant index files:
- Inbox index
- Project index
- Resource index
- Tag index

## Examples

### Quick Capture in Inbox
```bash
/note -w inbox Meeting with bank tomorrow at 3pm
```

**Creates:**
```markdown
---
title: Meeting
date: 2025-01-22
type: inbox
tags: [meeting]
---

# Meeting

Meeting with bank tomorrow at 3pm

**Created**: 2025-01-22
```

**File**: `Inbox/2025-01-22-meeting.md`

### Create Project Brief
```bash
/note -w project ClientXYZ "Website redesign project, budget 5k"
```

**Creates:**
```markdown
---
title: Project Brief - ClientXYZ
date: 2025-01-22
type: project
client: ClientXYZ
---

# Project Brief - ClientXYZ

## Overview
Website redesign project, budget 5k

## Client
ClientXYZ

**Created**: 2025-01-22
```

**File**: `Projects/Clients/ClientXYZ/brief.md`

### Add Technical Notes
```bash
/note -w technical ClientXYZ "Setup JWT authentication with refresh tokens"
```

**Appends to**:
```markdown
---
title: Notes Techniques - ClientXYZ
...

## 2025-01-22 - JWT Authentication

Setup JWT authentication with refresh tokens

- Access token: 15min expiry
- Refresh token: 7 days expiry
- Storage: HttpOnly cookies
```

**File**: `Projects/Clients/ClientXYZ/Notes Techniques.md`

### In Specific Vault
```bash
/note -w --vault=work project ClientABC "Mobile app development"
```

**Creates**: `vaults/work/Projects/Clients/ClientABC/brief.md`

### Resource/Cheat Sheet
```bash
/note -w resource "React Server Components: no SSR by default"
```

**Creates:**
```markdown
---
title: React Server Components
date: 2025-01-22
type: resource
category: Cheat Sheet
---

# React Server Components

React Server Components: no SSR by default

## Key Points
- No SSR by default
- Server-only rendering
- No client-side JavaScript

**Created**: 2025-01-22
```

**File**: `Resources/Cheat Sheets/react-server-components.md`

## Output

- ✅ Note created in correct location based on type
- ✅ Template properly applied with variables substituted
- ✅ YAML frontmatter valid and complete
- ✅ File conflicts handled appropriately
- ✅ Missing folders created automatically
- ✅ User informed of file path

## MCP Tools Used

- ✅ **File System** - Create folders and write files
- ✅ **Vault Detection** - Auto-detect Obsidian vaults
- ✅ **Template Engine** - Variable substitution

## Next Step

**Note creation complete!**

- File path displayed to user
- Note ready for use in Obsidian
- Can now format or search notes

## ⚠️ Critical Rules

1. **Validate vault path** - Ensure vault exists before operations
2. **Create folders** - Auto-create missing folders (except top-level)
3. **Handle conflicts** - Follow rules-based conflict resolution
4. **YAML frontmatter** - Always include valid frontmatter
5. **ISO dates** - Use YYYY-MM-DD format consistently
