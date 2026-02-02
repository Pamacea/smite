# Step 3: Search Notes

**Flag**: `-s` or `--search`

## Purpose

Search for notes across one or multiple Obsidian vaults, returning matching files with context and relevance ranking.

## What To Do

### 1. Parse Arguments

Extract the following:
- **Search query**: Text to search for
- **Vault scope**: Specific vault or all vaults
- **Type filter**: Filter by note type (optional)
- **Result limit**: Maximum number of results (optional)

**Flags:**
- `--vault=<name|all>` - Search specific vault or all vaults
- `--type=<type>` - Filter by note type (inbox, project, etc.)
- `--limit=<n>` - Limit results (default: 20)

### 2. Determine Search Scope

**Vault Selection:**
- `--vault=all`: Search across all detected vaults
- `--vault=<name>`: Search in specified vault only
- No flag: Search current vault or ask which vault

**Load Configuration:**
- Read `config/vaults.json` for vault paths
- Get list of enabled vaults

### 3. Execute Search

Search in the following locations:

#### A. File Names
Search for query in:
- File names (exact and partial match)
- File paths
- Folder names

**Priority**: Highest ranking

#### B. YAML Frontmatter
Search for query in:
- `title` field
- `tags` field
- `type` field
- Custom fields
- All frontmatter values

**Priority**: High ranking

#### C. Content
Search for query in:
- File body/content
- Headings
- Lists
- Code blocks
- Blockquotes

**Priority**: Normal ranking

#### D. Tags
Search for query in:
- Inline tags (#tag format)
- Frontmatter tags array
- Tag pages

**Priority**: Medium ranking

### 4. Search Implementation

**Search Options:**

1. **Case-insensitive** - Search ignores case
2. **Partial word matching** - Matches partial words
3. **Whole word matching** - Matches complete words
4. **Fuzzy matching** - Allows for typos and variations

**Search Query Processing:**
- Split query into terms
- Remove stop words (the, a, an, etc.)
- Apply stemming (reduce to root form)
- Handle special characters

### 5. Filter Results

**Apply Type Filter** (if `--type` specified):
- `inbox` - Only files in Inbox/ folder
- `project` - Only files in Projects/ folder
- `technical` - Only technical notes
- `meeting` - Only meeting notes
- `resource` - Only resources

**Apply Limit** (if `--limit` specified):
- Cap results at specified number
- Default: 20 results
- Sort by relevance before limiting

**Remove Duplicates:**
- Deduplicate results across vaults
- Keep highest-ranked occurrence

### 6. Rank Results

**Relevance Scoring:**

| Match Type | Score | Priority |
|------------|-------|----------|
| Exact filename match | 100 | Highest |
| Frontmatter title match | 90 | Very High |
| Frontmatter tags match | 80 | High |
| Frontmatter content match | 70 | High |
| Heading match | 60 | Medium-High |
| Title/first line match | 50 | Medium |
| Content match | 40 | Normal |
| Tag match | 30 | Medium-Low |
| Partial match | 20 | Low |

**Tie-Breakers:**
- Recent files (by modified date)
- Shorter file names
- Fewer folder levels

### 7. Format Output

Display results with:

**For Each Match:**
- File path (relative to vault root)
- Matching snippet with context (3 lines before/after)
- Relevance score
- Vault name (if multi-vault search)
- Match type (filename, frontmatter, content, tag)

**Grouping:**
- Group results by vault (if multi-vault)
- Show total match count per vault
- Show overall total matches

**Example Output:**

```markdown
## Search Results: "authentication"

**Query**: authentication
**Vaults**: all
**Total Matches**: 15

### Vault: personal (8 matches)

#### 1. JWT Authentication ⭐ 95
**File**: `Projects/Clients/ClientXYZ/Notes Techniques.md`
**Match Type**: Filename + Content
**Score**: 95

**Snippet**:
...## 2025-01-22 - **JWT Authentication**

Setup JWT authentication with refresh tokens

- Access token: 15min expiry
- Refresh token: 7 days expiry...

---

#### 2. API Authentication 85
**File**: `Resources/cheat-sheets/api-auth.md`
**Match Type**: Title
**Score**: 85

**Snippet**:
...# API Authentication

## OAuth2 Flow
1. User clicks login...
2. **Authentication** endpoint...
3. Access token returned...

---

### Vault: work (7 matches)

#### 3. User Authentication 80
**File**: `Projects/Auth/implementation.md`
**Match Type**: Frontmatter title
**Score**: 80

**Snippet**:
---
title: User **Authentication**
tags: [auth, security]
---

# User Authentication Implementation...
```

### 8. Handle Edge Cases

**No Results:**
```markdown
## No Results Found

**Query**: {query}
**Vaults**: {vaults}

**Suggestions**:
- Try a different search term
- Check spelling
- Search in all vaults with `--vault=all`
- Try partial word matching
```

**Too Many Results:**
```markdown
## Too Many Results

**Found**: {count} results
**Showing**: {limit} results (use `--limit={higher}` to see more)

**Top Results**:
[Show top {limit} results]
```

**Invalid Vault:**
```markdown
## Vault Not Found

**Vault**: {vault_name}

**Available Vaults**:
- personal
- work
- knowledge

**Suggestion**: Use `--vault=all` to search all vaults
```

## Examples

### Search All Vaults
```bash
/note -s "authentication" --vault=all
```

Finds all notes mentioning "authentication" across all vaults.

### Search Specific Vault
```bash
/note -s "ClientXYZ" --vault=work
```

Searches only in work vault.

### Search by Type
```bash
/note -s "meeting" --type=inbox
```

Only searches in Inbox folder.

### Limited Results
```bash
/note -s "API" --limit=10
```

Returns top 10 results.

### Search Current Vault
```bash
/note -s "budget"
```

Searches in current/auto-detected vault.

### Complex Query
```bash
/note -s "TypeScript React components" --vault=all --limit=50
```

Searches for multiple terms across all vaults, returns top 50 results.

## Search Algorithm

### 1. Query Processing
```
Input: "TypeScript React components"

Steps:
1. Tokenize: ["typescript", "react", "components"]
2. Lowercase: ["typescript", "react", "components"]
3. Remove stop words: ["typescript", "react", "components"]
4. Stem: ["typscript", "react", "compon"]
```

### 2. File Scanning
```
For each .md file in vault(s):
  - Read filename
  - Parse YAML frontmatter
  - Read content
  - Extract tags
  - Build search index
```

### 3. Matching
```
For each term in query:
  - Check filename
  - Check frontmatter fields
  - Check headings
  - Check content
  - Check tags
  - Calculate relevance score
```

### 4. Ranking
```
Sort results by:
1. Relevance score (descending)
2. Modified date (descending)
3. Filename length (ascending)
```

## Exclusions

**Exclude from search:**
- `.obsidian/` folder
- Hidden files/folders (starting with `.`)
- `.git/` folder
- `node_modules/` folder
- Non-markdown files

## Performance Considerations

**For large vaults:**
- Use `--type` filter to narrow scope
- Use `--limit` to cap results
- Search specific vault instead of `--vault=all`
- Consider incremental search (search as you type)

## Output

- ✅ Returns relevant matches from specified scope
- ✅ Shows file paths and context snippets
- ✅ Respects vault and type filters
- ✅ Results ranked by relevance
- ✅ Output is clear and actionable
- ✅ Performance acceptable for large vaults

## MCP Tools Used

- ✅ **File System** - Scan vault directories
- ✅ **File Reader** - Read file contents
- ✅ **Vault Detection** - Auto-detect vault paths

## Next Step

**Search complete!**

- Results displayed with file paths
- User can open notes in Obsidian
- Can use file paths to open notes directly

## ⚠️ Critical Rules

1. **Case-insensitive** - Always search case-insensitive
2. **Partial matching** - Support partial word matching
3. **Relative paths** - Show file paths relative to vault root
4. **Limit results** - Prevent overwhelming output
5. **Prioritize recent** - Recent files when relevance is equal
6. **Exclude hidden** - Don't search hidden files and folders
7. **Skip .obsidian** - Never search in .obsidian folder
