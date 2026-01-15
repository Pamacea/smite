# toolkit surgeon

AST-based code extraction for 70-85% token savings. Extracts signatures only without implementation details.

## Description

Use "surgeon mode" to extract TypeScript/JavaScript AST signatures without reading full file contents. Saves 70-85% tokens while providing complete type and API understanding.

## Usage

```bash
/toolkit surgeon <file> [options]
```

## Arguments

- `<file>` - File path to extract signatures from

## Options

- `--mode <mode>` - Extraction mode: `signatures` (default), `types-only`, `imports-only`, `exports-only`, `full`
- `--include <types>` - Include: `tests`, `types`, `comments`, `all`
- `--output <format>` - Output format: `table` (default), `json`, `typescript`

## Examples

```bash
# Extract signatures (default)
/toolkit surgeon src/auth/jwt.ts
# → 450 tokens vs 3,200 full read (86% saved)

# Types only (no implementation)
/toolkit surgeon src/auth/jwt.ts --mode=types-only
# → 280 tokens vs 3,200 full read (91% saved)

# Include tests
/toolkit surgeon src/auth/jwt.ts --include=tests,types
# → 680 tokens vs 4,500 full read with tests (85% saved)

# Imports only
/toolkit surgeon src/auth/jwt.ts --mode=imports-only
# → 180 tokens (understanding dependencies)

# Exports only
/toolkit surgeon src/auth/jwt.ts --mode=exports-only
# → 320 tokens (understanding API)

# TypeScript output (copy-paste friendly)
/toolkit surgeon src/auth/jwt.ts --output=typescript
# → Clean TypeScript code with signatures
```

## Output Format

### Table Output (default)

```
🔪 Surgeon Mode: AST Extraction

File: src/auth/jwt.ts
Mode: signatures
Tokens: 450 (vs 3,200 full read - 86% saved)

┌──────────────────────────────────────────────────────────────────┐
│ Imports (3)                                                       │
├──────────────────────────────────────────────────────────────────┤
│ import { sign, verify } from 'jsonwebtoken';                     │
│ import { config } from './config';                               │
│ import type { User, Payload } from './types';                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Types (2)                                                         │
├──────────────────────────────────────────────────────────────────┤
│ export interface TokenPayload {                                  │
│   sub: string;                                                   │
│   exp: number;                                                   │
│   iat: number;                                                   │
│ }                                                                │
│                                                                  │
│ export type TokenResult = { token: string; expiresAt: Date };    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Functions (3)                                                     │
├──────────────────────────────────────────────────────────────────┤
│ export function signToken(user: User): Promise<TokenResult>;     │
│ export function verifyToken(token: string): Promise<Payload>;    │
│ export function refresh_token(oldToken: string): Promise<string>;│
└──────────────────────────────────────────────────────────────────┘

✓ Complete API understanding in 450 tokens
```

### Types-Only Mode

```
🔪 Surgeon Mode: Types Only

File: src/auth/jwt.ts
Mode: types-only
Tokens: 280 (vs 3,200 full read - 91% saved)

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  email?: string;
  role?: 'user' | 'admin';
}

export type TokenResult = {
  token: string;
  expiresAt: Date;
};

export interface AuthConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
}

✓ Type definitions extracted (3 interfaces, 1 type)
```

### TypeScript Output

```typescript
// src/auth/jwt.ts - Signatures extracted by toolkit surgeon

// Imports
import { sign, verify } from 'jsonwebtoken';
import { config } from './config';
import type { User, Payload } from './types';

// Types
export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
}

export type TokenResult = { token: string; expiresAt: Date };

// Functions
export function signToken(user: User): Promise<TokenResult>;
export function verifyToken(token: string): Promise<Payload>;
export function refresh_token(oldToken: string): Promise<string>;
```

### JSON Output

```json
{
  "file": "src/auth/jwt.ts",
  "mode": "signatures",
  "tokens": {
    "used": 450,
    "full": 3200,
    "saved": 86
  },
  "extracted": {
    "imports": [
      "import { sign, verify } from 'jsonwebtoken';",
      "import { config } from './config';",
      "import type { User, Payload } from './types';"
    ],
    "types": [
      "export interface TokenPayload { sub: string; exp: number; iat: number; }"
    ],
    "functions": [
      "export function signToken(user: User): Promise<TokenResult>;",
      "export function verifyToken(token: string): Promise<Payload>;"
    ],
    "exports": [
      "TokenPayload",
      "TokenResult",
      "signToken",
      "verifyToken",
      "refresh_token"
    ]
  }
}
```

## Modes

### Signatures (default)
Extract all signatures (imports, types, functions, classes, exports).

- **Token Savings:** 80-86%
- **Use Case:** Understanding API without implementation
- **Includes:** Imports, types, functions, classes, exports

### Types-Only
Extract type definitions only (interfaces, types, enums).

- **Token Savings:** 85-91%
- **Use Case:** Understanding data structures
- **Includes:** Interfaces, types, enums, type aliases

### Imports-Only
Extract import statements only.

- **Token Savings:** 90-95%
- **Use Case:** Understanding dependencies
- **Includes:** All import statements

### Exports-Only
Extract export declarations only.

- **Token Savings:** 85-90%
- **Use Case:** Understanding public API
- **Includes:** All export statements

### Full
No filtering, extract all AST nodes (more than signatures, less than full file).

- **Token Savings:** 60-70%
- **Use Case:** Maximum understanding without implementation
- **Includes:** All AST nodes with structure

## Performance

| Mode | Tokens | Savings | Use Case |
|------|--------|---------|----------|
| signatures | 450 | 86% | API understanding |
| types-only | 280 | 91% | Type definitions |
| imports-only | 180 | 94% | Dependencies |
| exports-only | 320 | 90% | Public API |
| full | 1,200 | 62% | Maximum context |
| Full Read | 3,200 | 0% | Implementation details |

## Features

- **TypeScript Compiler API:** Accurate AST parsing
- **Token Savings:** 70-91% depending on mode
- **Complete API Understanding:** Types, signatures, imports, exports
- **Fast:** Sub-second extraction
- **Copy-Paste Ready:** TypeScript output format

## Use Cases

### Before Implementation
```bash
# Understand API before implementing feature
/toolkit surgeon src/auth/jwt.ts --mode=types-only
# → Know what types to use without reading implementation
```

### Dependency Analysis
```bash
# Check dependencies before refactoring
/toolkit surgeon src/auth/jwt.ts --mode=imports-only
# → Know what will be affected by changes
```

### Code Review
```bash
# Review API surface without implementation
/toolkit surgeon src/api/users.ts --mode=exports-only
# → Focus on public API
```

### Context Building
```bash
# Build context for agent (used by Builder agent)
/toolkit surgeon src/auth/jwt.ts --include=tests,types
# → Complete context for implementation
```

## Notes

- Uses ts-morph (TypeScript Compiler API wrapper)
- Works with TypeScript and JavaScript (with JSDoc)
- Token savings: 70-91% vs full file read
- Best for: API understanding, context building, code review
- Used automatically by Builder agent

## See Also

- `/toolkit search` - Find implementations
- `/toolkit graph` - Dependency analysis
- `/toolkit explore` - Structured exploration
