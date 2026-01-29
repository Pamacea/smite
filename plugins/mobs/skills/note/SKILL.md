---
name: note
description: AI-powered note writing and formatting for Obsidian vaults with multi-vault support
version: 3.1.0
---

# Note Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Unified note management system for Obsidian vaults with intelligent write, format, and search capabilities.

## Core Workflow

1. **Input**: Command invocation with operation flag (`-w`, `-f`, `-s`)
2. **Process**:
   - **Write** (`-w`): Create/update notes with templates
   - **Format** (`-f`): Apply intelligent markdown formatting
   - **Search** (`-s`): Search across vaults with ranking
3. **Output**: Created note, formatted content, or search results

## Key Principles

- **Unified interface**: Single command with three operations
- **Multi-vault support**: Auto-detect vaults, explicit selection via `--vault`
- **Template-based**: Predefined structures for consistency
- **Intelligent formatting**: Smart markdown optimization
- **Conflict handling**: Rules-based file management
- **YAML frontmatter**: Valid metadata on all notes

## Operations

### Write Notes (`-w`)
Create or update notes in Obsidian vaults:

**Note Types:**
- `inbox` - Quick capture notes
- `project` - Project briefs and documentation
- `technical` - Technical notes and code documentation
- `meeting` - Meeting notes with decisions and action items
- `resource` - Resources, cheat sheets, and references

**Process:**
1. Parse note type and content
2. Detect target vault (auto or via `--vault`)
3. Load appropriate template
4. Apply variable substitution
5. Handle file conflicts (Inbox → Cleaned/, Projects → overwrite/append)
6. Write file with YAML frontmatter

**Output**: Note file path

### Format Content (`-f`)
Format text using templates or free-form styling:

**Format Modes:**
- `template` - Use specific template structure
- `free` - Intelligent markdown formatting
- `meeting`, `project`, `technical` - Predefined templates

**Free-Form Enhancements:**
- Convert URLs to markdown links
- Format lists consistently
- Add proper headings hierarchy
- Create tables from structured data
- Format code blocks with language tags
- Add YAML frontmatter if missing
- Clean up excessive whitespace

**Output**: Formatted content to terminal, file, or clipboard

### Search Notes (`-s`)
Search for notes across vaults:

**Search In:**
- File names
- YAML frontmatter
- File content
- Tags (#tag format)

**Ranking:**
- Exact filename match = highest
- Frontmatter match = high
- Title match = medium
- Content match = normal

**Output**: Ranked results with context snippets

## Integration

- **SessionStart hook**: Auto-detect vaults from parent directory
- **Config file**: `config/vaults.json` for vault paths and settings
- **Template system**: Variable substitution with `{{date}}`, `{{title}}`, etc.

## Configuration

- **Vault detection**: Subdirectories with `.obsidian` folder
- **Folder structure**: Inbox/, Projects/, Technical/, Meetings/, Resources/
- **Templates**: inbox.md, project-brief.md, technical-notes.md, meeting.md, resource.md
- **Variables**: date, datetime, title, clientName, projectName, overview, content, context

## File Conflict Handling

### Inbox Notes
- If file exists: Move to `Inbox/Cleaned/` before creating new one

### Project Notes
- If `brief.md` exists: Ask to overwrite or append to `Notes Techniques.md`

### Resource Notes
- If file exists: Append with timestamp separator

## Error Handling

- **Vault not found**: Ask user to specify or create
- **Folder missing**: Create automatically (except top-level)
- **File exists**: Follow conflict handling rules per note type
- **Template missing**: Use default format
- **Invalid YAML**: Fix or recreate frontmatter

## Subagent Collaboration

### note-create Subagent
**Purpose**: Note creation from templates

**Launched by**: `-w` flag (Write operation)

**Capabilities**:
- Template selection and loading
- Variable substitution
- File conflict resolution
- YAML frontmatter generation

### note-format Subagent
**Purpose**: Note formatting and styling

**Launched by**: `-f` flag (Format operation)

**Capabilities**:
- Template-based formatting
- Free-form markdown optimization
- URL to link conversion
- Code block formatting
- List standardization

### note-search Subagent
**Purpose**: Note search across vaults

**Launched by**: `-s` flag (Search operation)

**Capabilities**:
- Multi-vault search
- Filename, frontmatter, content search
- Tag-based search
- Relevance ranking
- Context snippet generation

## Output Files

| Operation | File Location | Purpose |
|-----------|---------------|---------|
| Write | `<vault>/Inbox/YYYY-MM-DD-title.md` | Quick notes |
| Write | `<vault>/Projects/Clients/<Client>/brief.md` | Project briefs |
| Write | `<vault>/Projects/Clients/<Client>/Notes Techniques.md` | Technical notes |
| Format | Terminal or `--output=<path>` | Formatted content |
| Search | Terminal with results | Search results |

## Best Practices

1. **Use templates** for consistent note structure
2. **Auto-detect vaults** when possible
3. **Handle conflicts** gracefully with rules
4. **Maintain YAML frontmatter** for metadata
5. **Search across vaults** for comprehensive results

---
*Note Skill v4.0.0 - Unified note management with write, format, and search*
