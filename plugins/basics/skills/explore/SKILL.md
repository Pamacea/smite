---
name: explore
description: Quick codebase exploration for understanding patterns and finding files
version: 1.0.0
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

Quickly explore and understand codebase patterns, find relevant files, and map the project structure. Uses semantic search for 75% token savings compared to traditional exploration methods.

## Core Workflow

1. **Input**: Exploration query or target
2. **Process**:
   - Use `/toolkit search` for semantic queries
   - Use `grepai search ""` for directory mapping
   - Identify relevant files and patterns
   - Summarize findings
3. **Output**: Structured overview with file references

## Key Principles

- **Semantic First**: Always use semantic search before manual methods
- **Token Efficient**: 75% savings vs manual grep + Read
- **Pattern-Oriented**: Focus on code patterns and conventions
- **Quick**: Get answers in minutes, not hours

## Exploration Types

| Type | Query | Use Case |
|------|-------|----------|
| **Pattern** | "authentication flow" | Find how features work |
| **Component** | "Button component" | Find UI components |
| **API** | "user endpoints" | Find API routes |
| **Utility** | "date formatting" | Find helper functions |
| **Structure** | "" (empty) | Map directory tree |

## Usage

```bash
# Explore a feature
/explore "how does authentication work"

# Find components
/explore "form components with validation"

# Find APIs
/explore "user management endpoints"

# Map a directory
/explore "src/services"
```

## Output Format

```
🔍 Exploration Results: "authentication flow"

Key Files:
• src/auth/jwt.ts - JWT token verification
• src/middleware/auth.ts - Authentication middleware
• src/controllers/user.ts - User login/logout
• src/hooks/useAuth.ts - React auth hook

Pattern Detected:
→ JWT-based stateless authentication
→ Middleware protects routes
→ Tokens stored in httpOnly cookies

Dependencies:
→ jsonwebtoken library
→ User model in src/models/user.ts
→ Environment variables for JWT_SECRET

Token Savings: 2,345 tokens (vs 12,456 traditional - 81%)
```

## Integration

- **Works with**: All development workflows
- **Used by**: `/epct`, `/oneshot`, `/debug` for context
- **Requires**: `/toolkit search` or grepai
- **Best used before**: Implementation or debugging

## Success Criteria

- ✅ Relevant files identified
- ✅ Patterns documented
- ✅ Token savings reported
- ✅ Clear summary provided

## Error Handling

- **No results**: Suggest broader query or different terms
- **Too many results**: Suggest narrowing scope
- **Ambiguous query**: Ask for clarification
- **Invalid path**: Report and suggest valid directories

---
*Explore Skill v1.0.0 - Quick codebase understanding*
