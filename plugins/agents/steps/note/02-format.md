# Step 2: Format Content

**Flag**: `-f` or `--format`

## Purpose

Format text using templates or apply intelligent free-form markdown styling to existing content.

## What To Do

### 1. Parse Arguments

Extract the following:
- **Format mode**: `template` (specific template) or `free` (intelligent formatting)
- **Template name**: If template mode, which template to use
- **Content**: Text content to format (from arguments or stdin)
- **Output destination**: Terminal, file, or clipboard

**Flags:**
- `--output=<file>` - Save to specified file
- `--output=clipboard` - Copy to clipboard
- `--template=<name>` - Use specific template

### 2. Determine Format Mode

#### Template Mode
Use predefined template structure for formatting.

**Available Templates:**
- `meeting` - Meeting notes structure
- `project` - Project documentation
- `technical` - Technical notes
- `inbox` - Quick capture format
- `resource` - Resource/cheat sheet format

#### Free Mode
Apply intelligent markdown formatting without template constraints.

### 3. Template-Based Formatting

**When template specified:**

1. **Load template** from `templates/` directory
2. **Analyze content** to extract key information
3. **Apply template structure** to organize content
4. **Substitute variables** where present
5. **Format content** according to template rules

**Example (Meeting Template):**

**Input:**
```
Discussed project timeline. Decision: use TypeScript. Action: John to setup repo.
```

**Output:**
```markdown
---
title: Meeting Notes
date: 2025-01-22
type: meeting
---

# Meeting Notes

## Discussion
Discussed project timeline

## Decisions
- Use TypeScript for the project

## Action Items
- [ ] John - Setup repository

**Date**: 2025-01-22
```

### 4. Free-Form Formatting

**When free mode specified:**

Apply intelligent markdown formatting:

#### A. Convert URLs to Links
```markdown
# Before
Check out https://example.com and http://docs.test.com/guide

# After
Check out [https://example.com](https://example.com) and [http://docs.test.com/guide](http://docs.test.com/guide)
```

#### B. Format Lists Consistently
```markdown
# Before
- Item 1
* Item 2
• Item 3

# After
- Item 1
- Item 2
- Item 3
```

#### C. Add Proper Headings Hierarchy
```markdown
# Before
Title
Section 1
Subsection a

# After
# Title

## Section 1

### Subsection A
```

#### D. Create Tables from Structured Data
```markdown
# Before
Endpoints:
GET /users - Get all users
POST /users - Create user
PUT /users/:id - Update user

# After
## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | Get all users |
| POST | /users | Create user |
| PUT | /users/:id | Update user |
```

#### E. Format Code Blocks with Language Tags
```markdown
# Before
Code:
function test() {
  return true;
}

# After
Code:

```javascript
function test() {
  return true;
}
```
```

#### F. Add Appropriate Spacing
```markdown
# Before
## Section 1
Content here
## Section 2
More content

# After
## Section 1

Content here

## Section 2

More content
```

#### G. Detect and Format Code Blocks
Identify code-like content and wrap in code blocks:
- Function definitions
- API endpoints
- Configuration examples
- Command-line snippets

#### H. Add YAML Frontmatter (if missing)
```markdown
---
title: Extracted Title
date: 2025-01-22
type: formatted
---
```

#### I. Format Dates Consistently
Convert all dates to ISO 8601 format (YYYY-MM-DD).

#### J. Clean Up Excessive Whitespace
Remove multiple consecutive blank lines (keep max 2).

#### K. Add Proper Emphasis
Identify important terms and apply emphasis:
- **Bold** for important concepts
- `Code` for technical terms
- *Italic* for emphasis

### 5. Output Options

**No `--output` flag**: Display formatted text in terminal

**`--output=<file>`**: Write to specified file
- Confirm before overwriting existing files
- Create parent directories if needed

**`--output=clipboard`**: Copy to clipboard (if supported)
- Requires clipboard access
- Confirmation message on success

## Examples

### Format Using Specific Template
```bash
/note -f meeting "Discussed project timeline. Decision: use TypeScript. Action: John to setup repo."
```

**Output:**
```markdown
---
title: Meeting Notes
date: 2025-01-22
type: meeting
---

# Meeting Notes

## Discussion
Discussed project timeline

## Decisions
- **Use TypeScript** for the project

## Action Items
- [ ] John - Setup repository

**Date**: 2025-01-22
```

### Free-Form Formatting
```bash
/note -f free "API endpoints: GET /users, POST /users. Auth needed. Returns JSON."
```

**Output:**
```markdown
## API Endpoints

### GET /users
- **Authentication**: Required
- **Returns**: JSON

### POST /users
- **Authentication**: Required
- **Returns**: JSON
```

### Format and Save to File
```bash
/note -f free "Project notes..." --output=Projects/notes.md
```

Creates/updates: `Projects/notes.md`

### Use Custom Template
```bash
/note -f --template=custom "Content here..."
```

Loads and applies: `templates/custom.md`

### Format Clipboard Content
```bash
/note -f free --output=clipboard
```

Reads from stdin, formats, copies to clipboard.

### Complex Example
```bash
/note -f free "React Server Components are a new feature. They run only on the server. No SSR by default. Use them for data fetching."
```

**Output:**
```markdown
---
title: React Server Components
date: 2025-01-22
type: formatted
---

# React Server Components

React Server Components are a new feature.

## Key Characteristics

- **Server-only**: They run only on the server
- **No SSR**: No Server-Side Rendering by default
- **Data Fetching**: Use them for data fetching

## Best Practices

1. Use Server Components for data fetching
2. Use Client Components for interactivity
3. Minimize client-side JavaScript

**Formatted**: 2025-01-22
```

## Smart Enhancements (Free Mode)

### URL Detection and Conversion
Identifies URLs and converts to markdown links:
- HTTP/HTTPS URLs
- FTP URLs
- Email addresses
- File paths

### List Standardization
Converts all list styles to consistent bullet points:
- `-` (hyphen)
- `*` (asterisk)
- `•` (bullet)

### Heading Hierarchy
Organizes content into proper heading levels:
- `#` for main title
- `##` for major sections
- `###` for subsections
- `####` for details

### Code Block Detection
Identifies and formats code-like content:
- Functions/methods
- API endpoints
- Configuration files
- Command examples
- SQL queries

### Table Creation
Converts structured data into markdown tables:
- Key-value pairs
- API endpoint lists
- Parameter lists
- Feature comparisons

## Output

- ✅ Content properly formatted according to mode
- ✅ Template structure applied correctly (template mode)
- ✅ Markdown best practices followed (free mode)
- ✅ Original meaning preserved
- ✅ Output delivered to correct destination
- ✅ Code blocks and special characters preserved

## MCP Tools Used

- ✅ **Clipboard** - Copy to clipboard (if `--output=clipboard`)
- ✅ **File System** - Write to file (if `--output=<file>`)

## Next Step

**Formatting complete!**

- Formatted content ready for use
- Can be written to note with `-w` flag
- Can be copied to clipboard

## ⚠️ Critical Rules

1. **Preserve meaning** - Don't change the original content's meaning
2. **Template mode** - Follow template structure exactly
3. **Free mode** - Apply markdown best practices
4. **Ask confirmation** - Before overwriting files
5. **Maintain code** - Preserve code block formatting
6. **Don't over-format** - Keep it readable and natural
7. **Preserve frontmatter** - Keep existing YAML frontmatter
