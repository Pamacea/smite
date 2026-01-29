---
name: explore
description: Structured codebase exploration with task-based semantic analysis
version: 1.1.0
---

# Explore Skill

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

Provide structured codebase exploration with specific task types for targeted analysis. Unlike open-ended search, exploration focuses on understanding architecture, finding specific elements, and mapping code relationships.

## Core Workflow

1. **Input**: Task type with optional target
2. **Process**:
   - Select exploration strategy based on task type
   - Use semantic search to find relevant code
   - Analyze relationships and dependencies
   - Generate structured output
3. **Output**: Task-specific results with code references

## Key Principles

- **Task-Oriented**: Each exploration has a specific goal
- **Semantic First**: Always use semantic search before traditional methods
- **Structured Output**: Results formatted for the specific task
- **Token Efficient**: Target 70-85% token savings vs manual exploration

## Exploration Tasks

| Task | Description | Use Case |
|------|-------------|----------|
| `find-function` | Locate specific function definitions | "Where is authenticateUser defined?" |
| `find-pattern` | Find code patterns matching description | "Show me all error handlers" |
| `understand` | Comprehensive codebase understanding | "How does the payment flow work?" |
| `impact-analysis` | Analyze change impact | "What depends on this file?" |
| `find-bug` | Locate potential bug sources | "Where could this error originate?" |
| `find-api` | Find API endpoint definitions | "Where are the user routes?" |

## Usage

```bash
# Find a specific function
/toolkit explore --task=find-function --target="authenticateUser"

# Understand a feature
/toolkit explore --task=understand --target="payment flow"

# Analyze impact
/toolkit explore --task=impact-analysis --target=src/auth/jwt.ts

# Find patterns
/toolkit explore --task=find-pattern --target="error handling middleware"

# Find bugs
/toolkit explore --task=find-bug --target="authentication failing on refresh"
```

## Task Details

### find-function
Locates function definitions with their signatures and locations.

**Output**: Function name, file path, line numbers, signature, brief description

### find-pattern
Finds all instances of a code pattern (architecture, error handling, etc.).

**Output**: List of files with pattern instances, line ranges, code snippets

### understand
Provides comprehensive understanding of a feature or system.

**Output**:
- Architecture overview
- Key files and their roles
- Data flow diagram
- Integration points
- Dependencies

### impact-analysis
Analyzes what depends on a given file or component.

**Output**:
- Direct dependents
- Transitive dependents
- Risk assessment
- Test files to update

### find-bug
Locates potential sources of a bug or error.

**Output**:
- Likely bug locations ranked by probability
- Code snippets showing suspicious patterns
- Suggested fixes

### find-api
Finds API endpoint definitions and routes.

**Output**:
- Route definitions with HTTP methods
- Handler functions
- Middleware used
- Request/response schemas

## Integration

- **Works with**: architect (design), builder (implementation)
- **Required by**: debug workflow for bug location
- **Requires**: toolkit search for semantic queries
- **Best used before**: Implementation or refactoring

## Performance

| Task | Traditional | Explore | Savings |
|------|-------------|---------|---------|
| find-function | 15 min | 3 min | 80% |
| understand | 45 min | 10 min | 78% |
| impact-analysis | 30 min | 5 min | 83% |

## Error Handling

- **Task not recognized**: Lists available tasks
- **Target not found**: Suggests similar targets
- **Scope too broad**: Suggests narrowing with --scope
- **No results**: Recommends alternative task types

## Examples

### Example 1: Find Authentication Function
```bash
/toolkit explore --task=find-function --target="verifyJWT"
```

**Output**:
```
🔍 Function Found: verifyJWT

Location: src/auth/jwt.ts:23-45
Signature: export function verifyJWT(token: string): Promise<JWTPayload>

Purpose: Verifies JWT tokens and extracts user claims

Called by:
- src/middleware/auth.ts:12 (requireAuth)
- src/controllers/user.ts:89 (refreshToken)

Dependencies:
- jsonwebtoken library
- JWT_SECRET env variable
```

### Example 2: Understand Payment Flow
```bash
/toolkit explore --task=understand --target="payment processing"
```

**Output**: Architecture diagram, file list, data flow

---
*Explore Skill v1.1.0 - Structured codebase exploration*
