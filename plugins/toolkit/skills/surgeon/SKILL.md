---
name: surgeon
description: AST signature extraction for minimal token usage (70-85% savings)
version: 1.1.0
---

# Surgeon Skill

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

Extract AST signatures and function signatures without reading full file contents. Provides maximum token savings (70-85%) for codebase understanding and context building.

## Core Workflow

1. **Input**: File or directory path
2. **Process**:
   - Parse source files to AST
   - Extract top-level signatures only
   - Remove function bodies and implementation details
   - Return structured signature list
3. **Output**: Function/class signatures with types

## Key Principles

- **AST-Based**: Uses actual code structure, not heuristics
- **Minimal Context**: Only signatures, no implementation
- **Type-Aware**: Preserves type information
- **Maximum Savings**: 70-85% token reduction vs Read

## Extraction Types

| Type | Extracts | Use Case | Savings |
|------|----------|----------|---------|
| **functions** | Function signatures with types | Understanding API | 75% |
| **classes** | Class definitions with methods | Architecture | 70% |
| **exports** | Exported items only | Public API | 85% |
| **imports** | Import statements | Dependencies | 90% |
| **all** | Combined signatures | Full overview | 80% |

## Usage

```bash
# Extract signatures from a file
/toolkit surgeon src/auth/jwt.ts

# Extract from directory
/toolkit surgeon src/services/

# Export only
/toolkit surgeon src/api/ --type=exports

# Specific types
/toolkit surgeon src/models/ --type=classes

# JSON output
/toolkit surgeon src/ --output=json
```

## Output Format

### Default (Table)
```
┌─────────────────────────────────────────────────────────┐
│ Signatures: src/auth/jwt.ts                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Functions (5):                                        │
│  • verifyJWT(token: string): Promise<JWTPayload>        │
│  • signJWT(payload: JWTPayload): Promise<string>        │
│  • decodeToken(token: string): JWTPayload | null        │
│  • refreshAccessToken(refreshToken: string): Promise    │
│  • invalidateToken(tokenId: string): void               │
│                                                         │
│  Types (2):                                            │
│  • type JWTPayload = { userId: string, ... }           │
│  • interface TokenOptions = { expiresIn: string }      │
│                                                         │
│  Exports (3):                                          │
│  • verifyJWT, signJWT, decodeToken                     │
│                                                         │
│  Tokens: 1,234 (vs 8,456 full file - 85% saved)       │
└─────────────────────────────────────────────────────────┘
```

### JSON Output
```json
{
  "file": "src/auth/jwt.ts",
  "signatures": {
    "functions": [
      {
        "name": "verifyJWT",
        "signature": "verifyJWT(token: string): Promise<JWTPayload>",
        "line": 15,
        "export": true
      }
    ],
    "types": [...],
    "exports": [...]
  },
  "metrics": {
    "tokens": 1234,
    "traditional": 8456,
    "savings": 85
  }
}
```

## Integration

- **Works with**: architect for API understanding
- **Required by**: builder for context building
- **Requires**: TypeScript/JavaScript parser
- **Best used before**: Reading full files

## Supported Languages

| Language | Parser | Status |
|----------|--------|--------|
| TypeScript | @babel/parser | ✅ Full support |
| JavaScript | @babel/parser | ✅ Full support |
| JSX | @babel/parser | ✅ Full support |
| Python | Built-in | 🟡 Basic support |

## Configuration

- `--type <type>` - Extraction type: functions, classes, exports, imports, all
- `--depth <n>` - Nested depth (default: 1)
- `--output <format>` - Output format: table, json, markdown
- `--include-private` - Include non-exported items

## Performance

| File Size | Read Tokens | Surgeon Tokens | Savings |
|-----------|-------------|----------------|---------|
| Small (100 lines) | 2,000 | 400 | 80% |
| Medium (500 lines) | 10,000 | 1,500 | 85% |
| Large (1000+ lines) | 20,000 | 2,500 | 87% |

## Use Cases

### Before Implementation
```bash
/toolkit surgeon src/services/user.ts
```
Understand API surface without reading implementation.

### For Context Building
```bash
/toolkit surgeon src/ --type=exports > signatures.txt
```
Build minimal context for agents.

### For Documentation
```bash
/toolkit surgeon src/api/ --output=json
```
Generate API documentation from signatures.

## Error Handling

- **Parse error**: Reports file and line, continues with other files
- **Not a source file**: Skips with notification
- **Empty file**: Reports as such
- **Unsupported language**: Lists supported languages

## Best Practices

1. **Use before Read**: Always try surgeon first for API understanding
2. **Scope appropriately**: Use directory for multiple files
3. **Combine with search**: Use surgeon results to guide further exploration
4. **Export for reuse**: Save JSON for later reference

---
*Surgeon Skill v1.1.0 - AST signature extraction*
