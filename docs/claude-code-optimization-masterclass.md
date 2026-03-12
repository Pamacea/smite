# Claude Code - Masterclass d'Optimisation

> **Version:** 1.0.0 | **Dernière mise à jour:** 12 Mars 2026
> **Audience:** Développeurs avancés, créateurs de plugins, power users

---

## 📋 Table des Matières

1. [Prompting Avancé](#1-prompting-avancé)
2. [Optimisation Mémoire & Contexte](#2-optimisation-mémoire--contexte)
3. [Skills & Rules - Patterns Avancés](#3-skills--rules---patterns-avancés)
4. [Plugins Performance](#4-plugins-performance)
5. [Scripts & Hooks](#5-scripts--hooks)
6. [MCP Optimization](#6-mcp-optimization)
7. [Debugging & Troubleshooting](#7-debugging--troubleshooting)
8. [Anti-Patterns à Éviter](#8-anti-patterns-à-éviter)
9. [Checklist d'Excellence](#9-checklist-dexcellence)

---

## 1. Prompting Avancé

### Principes Fondamentaux du Prompting Claude Code

| Principe | ❌ Mauvais | ✅ Bon |
|----------|-----------|-------|
| **Spécificité** | "Fix the code" | "Fix the type error in src/auth/login.ts at line 45 where user.id might be undefined" |
| **Vérification** | "Write a function" | "Write a validateEmail function with these tests: [email protected]=true, invalid=false. Run tests after." |
| **Contexte** | "How does this work?" | "Look at ExecutionFactory's git history and explain why its API uses this pattern" |
| **Contraintes** | "Clean up the code" | "Remove unused imports from src/components/*.tsx. Don't modify existing logic" |

### Structure d'un Prompt Efficace

```markdown
## Context
[Background information about the task]

## Task
[Specific action to take]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Examples
[Before/After or sample inputs/outputs]

## Verification
[How to verify the solution is correct]
```

### Patterns de Prompting par Type de Tâche

#### Pattern 1: Task de Code Refactoring

```markdown
## Context
I need to refactor the authentication module in src/auth/ to use the new API client pattern.

## Task
1. Read src/auth/login.ts and src/auth/signup.ts
2. Identify direct fetch() calls
3. Replace with apiClient from src/lib/api-client.ts
4. Preserve error handling logic
5. Update type imports if needed

## Constraints
- Do NOT modify error handling logic
- Use existing apiClient methods (get, post, put, delete)
- Run typecheck after changes

## Verification
- Run: npm run typecheck
- Run: npm test -- auth.test.ts
- All tests should pass
```

#### Pattern 2: Task de Debugging

```markdown
## Context
Tests are failing after the latest changes to checkout flow.

## Task
1. Run failing tests and capture error output
2. Identify root cause in src/checkout/process.ts
3. Implement minimal fix
4. Add regression test

## Error Output
[paste actual error]

## Constraints
- Address root cause, don't suppress errors
- Keep existing functionality intact
- Don't add new dependencies

## Verification
- Tests pass: npm test -- checkout.test.ts
- Edge cases covered: empty cart, expired payment, network timeout
```

#### Pattern 3: Task de Feature Development

```markdown
## Context
We need to add user profile editing to the dashboard.

## Requirements
- Users can edit: name, email, bio, avatar URL
- Form validation: email format, max lengths
- Success/error feedback
- Loading states during save

## Existing Patterns to Follow
- Reference: src/components/EditProfileModal.tsx
- Form validation uses: src/lib/validate.ts
- API calls use: src/lib/api-client.ts

## Technical Constraints
- Use TypeScript strict mode
- No new dependencies
- Follow existing component structure

## Verification
1. Component renders without errors
2. Form validation works
3. API call succeeds with valid data
4. Error handling works with invalid data
```

### Prompting pour Subagents

#### Prompt Explore Agent (Codebase Analysis)

```markdown
Explore the authentication system thoroughly:

1. Find all authentication-related files using Glob and Grep
2. Read and analyze the code structure
3. Identify the authentication flow (login → token → refresh)
4. List all entry points and dependencies
5. Note any security patterns or concerns

Focus on: src/auth/, lib/auth/, middleware/auth-*

Report with specific file references and line numbers.
```

#### Prompt Plan Agent (Architecture)

```markdown
Plan the implementation of a notification system:

Requirements:
- Real-time push notifications
- WebSocket connection
- Per-user notification queue
- Read/unread status
- Notification types: mention, reply, like

Research:
1. Find existing WebSocket implementations in the codebase
2. Identify database schema patterns for notifications
3. Check if there's a message queue system already

Deliver:
- 3-step implementation plan
- File structure for new components
- Database schema proposal
- Integration points with existing auth
```

### Prompts de Maintenance

#### CLAUDE.md Prompts Effectifs

```markdown
# Build Commands
- `pnpm install` - Install dependencies
- `pnpm dev` - Start dev server on localhost:3000
- `pnpm build` - Production build
- `pnpm test` - Run all tests
- `pnpm test:watch` - Watch mode for specific tests
- `pnpm lint` - ESLint check
- `pnpm typecheck` - TypeScript validation

# Code Style
- Use 2-space indentation
- Use ES modules (import/export)
- Destructure imports: `import { useState, useEffect } from 'react'`
- Default exports for components, named exports for utilities

# Git Workflow
- Feature branches: `feature/<ticket-id>-short-description`
- Commit format: `<type>: <scope> <description>`
- PRs must pass CI and have at least 1 approval

# Testing Preferences
- Unit tests alongside source files: `Component.test.tsx`
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/`
- Test files use `.test.ts` or `.spec.ts` extension

# Architecture Decisions
- API routes in `src/app/api/`
- Server components in `src/app/`
- Client components in `src/components/`
- Shared utilities in `src/lib/`
- Types in `src/types/`

# Important Gotchas
- Environment variables must be prefixed with `NEXT_PUBLIC_` for client access
- Database connections must be singleton patterns
- WebSocket connections close after 60 seconds idle
```

#### Rules Scoped par Type de Fichier

```yaml
---
paths:
  - "src/app/api/**/*.ts"
---

# API Route Development Rules

## Request Validation
- All API routes must validate input using Zod schemas
- Validation must happen BEFORE any business logic
- Return 400 Bad Request with validation errors

## Error Handling
- Use `ApiError` class from `@/lib/errors`
- Include error code, message, and stack trace in development
- Log errors before returning

## Response Format
- Success: `{ data: T, error: null }`
- Error: `{ data: null, error: { code: string, message: string } }`
- Always set appropriate HTTP status codes

## Security
- Check authentication via `getSession()`
- Check authorization via `hasPermission()`
- Never expose internal errors to client

## Examples
See: `src/app/api/users/route.ts` for reference implementation
```

---

## 2. Optimisation Mémoire & Contexte

### Comprendre le Context Window

```
┌─────────────────────────────────────────────┐
│          CONTEXT WINDOW (200K tokens)       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  CLAUDE.md (loaded at start)          │ │
│  │  ~200 lines recommended                │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Conversation History                │ │
│  │  Grows with each turn                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  File Contents (Read tool output)     │ │
│  │  Each file adds tokens                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Command Outputs (Bash tool)          │ │
│  │  Can be very large                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
     ⚠️ Performance degrades as it fills!
```

### Stratégies de Réduction des Tokens

#### 1. Imports Intelligents dans CLAUDE.md

```markdown
# CLAUDE.md

# Keep it minimal!
See @README.md for project overview
See @package.json for available scripts

# Only include what Claude can't infer
- Use `pnpm` not `npm` (non-standard)
- Run `pnpm typecheck` before committing (project rule)
```

#### 2. Chargement Conditionnel de Rules

```yaml
---
paths:
  - "**/*.test.ts"
---

# Test-Specific Rules
- Use `describe` blocks for test organization
- Mock external dependencies
- Tests must be deterministic
- Use `beforeEach` for setup, not nested describes
```

#### 3. Utilisation de Subagents pour Isoler le Context

```
Main Conversation: ~50K tokens
                    ↓
         Spawns Subagent
                    ↓
Subagent Context: ~20K tokens (isolated)
                    ↓
         Returns summary only
                    ↓
Main Conversation: ~52K tokens (saved ~18K)
```

### Techniques de Compaction

#### Compaction Manuelle

```bash
# Compacter avec instructions spécifiques
/compact Focus on the API changes we made

# Compacter à un point spécifique
/compact Summarize from "Let's add the user profile feature"

# Compacter et garder certains éléments
/compact Preserve the full list of modified files and test commands
```

#### Compaction Automatique

```json
// .claude/settings.json
{
  "autoCompactThreshold": 0.95,
  "autoCompactTrigger": "tokens",
  "autoCompactPreserve": [
    "modifiedFiles",
    "testCommands",
    "decisionsMade"
  ]
}
```

### Variables d'Environnement pour l'Optimisation

```bash
# Override auto-compact threshold (default 95%)
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=80

# Tool search threshold for MCP
ENABLE_TOOL_SEARCH=auto:5

# MCP output token limit
MAX_MCP_OUTPUT_TOKENS=25000

# Disable memory features to save context
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
```

### Gestion de l'Auto Memory

#### Structure Optimale de MEMORY.md

```markdown
# MEMORY.md (Index - < 200 lines)

## Quick Reference

### Build Commands
- `pnpm dev` - Dev server
- `pnpm build` - Production build
- `pnpm test` - All tests

### Common Issues
- **Port 3000 in use**: `lsof -ti:3000 | xargs kill`
- **Type errors in auth**: Check session types
- **Test timeouts**: Increase `jest.timeout` in setup

### Architecture
- Auth: `src/lib/auth/` - Session management
- API: `src/app/api/` - Next.js routes
- DB: `src/lib/db/` - Prisma client

## Detailed Topics
- Full debugging guide: See @memory/debugging.md
- API patterns: See @memory/api-patterns.md
- Deployment: See @memory/deployment.md
```

### Techniques de Context Splitting

#### Par Type de Tâche

```bash
# Session 1: Architecture & Planning
claude
# Explore, plan, design documents

# Session 2: Implementation
claude --continue
# Implement based on plan

# Session 3: Testing & Review
claude --continue
# Test, fix, review
```

#### Par Feature Module

```bash
# Auth workflow
cd src/features/auth && claude

# Checkout workflow
cd src/features/checkout && claude
```

---

## 3. Skills & Rules - Patterns Avancés

### Architecture d'un Skill Efficace

```
skill-name/
├── SKILL.md              # Point d'entrée (requis)
├── reference.md          # Documentation détaillée
├── examples.md           # Cas d'usage
├── templates/            # Templates de code
│   ├── component.tsx
│   └── test.spec.ts
└── scripts/              # Scripts utilitaires
    └── validate.sh
```

### Frontmatter Optimal

```yaml
---
name: api-endpoint-generator
description: Generate REST API endpoints with proper validation, error handling, and documentation. Use when creating new API routes or refactoring existing endpoints.

# Invocation control
disable-model-invocation: false  # Let Claude decide when to use
user-invocable: true              # Visible in / menu

# Tool restrictions
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep

# Model selection
model: inherit  # or: sonnet, opus, haiku

# Execution context
context: inline  # or: fork (subagent isolation)

# Preloaded skills for context
skills:
  - api-conventions
  - error-handling-patterns

# Lifecycle hooks
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: validate
          command: "./scripts/validate-api-changes.sh"

# Arguments expected
argument-hint: "<route-path> <method>"
---

# Skill instructions start here
```

### Patterns de Skills par Domaine

#### Pattern: Skill de Génération de Code

```yaml
---
name: react-component-generator
description: Generate React components with TypeScript, proper typing, and best practices. Use when creating new UI components.
argument-hint: "<ComponentName> [props]"
model: sonnet
---

# React Component Generator

## Template Location
See @templates/component.tsx for base structure

## Props Pattern
All components accept:
- `className?: string` - Additional classes
- `children?: ReactNode` - Child content
- `testId?: string` - Testing identifier

## Type Safety
- Define props interface separately
- Use generic types for reusable components
- Export props type for consumption

## Styling
- Use Tailwind CSS utility classes
- Use clsx for conditional classes
- Follow design system tokens

## Example
/react-component-generator UserProfileCard avatarUrl name bio
```

#### Pattern: Skill de Refactoring

```yaml
---
name: refactor-to-async
description: Refactor synchronous code to async/await pattern. Use when identified callback hell or Promise chains.
model: inherit
allowed-tools: Read, Edit, Bash, Grep
---

# Async Refactoring Pattern

## Detection
Look for:
- Nested callbacks (>2 levels)
- `.then().then().catch()` chains
- Callback-based API calls

## Transformation
1. Convert to async functions
2. Use await for sequential operations
3. Use Promise.all() for parallel operations
4. Add proper error handling (try/catch)

## Constraints
- Preserve error handling logic
- Don't change function signatures unless necessary
- Add JSDoc for async functions

## Example Transformation
// Before
function fetchUser(id, callback) {
  db.get('users', id, (err, user) => {
    if (err) return callback(err)
    fetchProfile(user.profileId, (err, profile) => {
      if (err) return callback(err)
      callback(null, { user, profile })
    })
  })
}

// After
async function fetchUser(id) {
  const user = await db.get('users', id)
  const profile = await fetchProfile(user.profileId)
  return { user, profile }
}
```

#### Pattern: Skill de Migration

```yaml
---
name: migrate-to-next-15
description: Migrate code from Next.js 14 to 15 following official migration guide. Use when upgrading Next.js version.
model: opus
skills:
  - nextjs-conventions
  - react-19-patterns
hooks:
  PreToolUse:
    - matcher: "Edit"
      hooks:
        - type: command
          command: "npx next-migrate-validate --file $TOOL_INPUT_FILE"
---

# Next.js 15 Migration

## Breaking Changes to Address
1. Dynamic imports no longer accept `{ ssr: false }`
2. Image component uses `alt` prop, not `title`
3. Form actions replace `useFormStatus`
4. Server components are default

## Migration Steps
1. Find all dynamic imports
2. Replace `{ ssr: false }` with dynamic imports in client components
3. Update Image components
4. Convert forms to use server actions

## Verification
After migration:
- Run: `npm run build`
- Run: `npm run test`
- Check for hydration warnings
```

### Skills avec Injection Dynamique

```yaml
---
name: pr-analyzer
description: Analyze pull requests with live GitHub data
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

# Pull Request Analyzer

## Dynamic Context
- PR diff: !`gh pr diff`
- PR commits: !`gh pr log`
- Changed files: !`gh pr diff --name-only`
- PR metadata: !`gh pr view --json title,number,state,author`

## Analysis Tasks
1. Review commit quality and messages
2. Check for proper test coverage
3. Identify potential security issues
4. Verify documentation updates
5. Assess breaking changes

## Output Format
### Summary
[Brief overview]

### Issues Found
- **Critical**: [list]
- **Warning**: [list]
- **Suggestions**: [list]

### Files Modified
[File list with impact assessment]
```

### Skills Multi-Phases

```yaml
---
name: full-stack-feature
description: Complete feature development from database to UI
argument-hint: "<feature-name> <spec>"
model: opus
context: fork
skills:
  - api-conventions
  - frontend-patterns
  - testing-standards
---

# Full-Stack Feature Development

## Phase 1: Database
1. Create/update Prisma schema
2. Run migrations: `pnpm prisma migrate dev`
3. Create seed data if needed

## Phase 2: Backend API
1. Create API endpoints in `src/app/api/`
2. Add validation schemas
3. Implement error handling
4. Write API tests

## Phase 3: Frontend UI
1. Create components in `src/components/`
2. Implement state management
3. Add loading/error states
4. Write component tests

## Phase 4: Integration
1. End-to-end user flow
2. Error scenarios
3. Edge cases

## Phase 5: Documentation
1. Update README if public API
2. Add inline comments
3. Update API docs

## Verification
- [ ] Database migrations successful
- [ ] API tests passing
- [ ] Component tests passing
- [ ] E2E test passing
- [ ] No console errors
- [ ] Type check passing
```

---

## 4. Plugins Performance

### Structure de Plugin Optimisé

```
high-performance-plugin/
├── .claude-plugin/
│   └── plugin.json          # Minimal metadata
├── package.json             # Dependencies
├── skills/
│   ├── core/               # Core skills (always loaded)
│   │   └── SKILL.md
│   └── optional/           # Optional skills (lazy loaded)
│       └── SKILL.md
├── agents/
│   └── specialized.md       # Agents with specific models
├── hooks/
│   └── hooks.json          # Minimal hook definitions
├── scripts/
│   └── setup.sh            # Fast setup scripts
└── README.md                # Comprehensive docs
```

### plugin.json Minimal

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description for plugin marketplace",
  "author": "Your Name",
  "license": "MIT",
  "claude": {
    "minVersion": "1.0.33"
  },
  "capabilities": {
    "skills": true,
    "agents": true,
    "hooks": true,
    "mcp": false
  }
}
```

### Lazy Loading des Skills

```yaml
# skills/core/SKILL.md - Always loaded
---
name: plugin-core
description: Core plugin functionality
user-invocable: false
---
Core patterns and utilities always available.
```

```yaml
# skills/optional/SKILL.md - Loaded on demand
---
name: plugin-advanced
description: Advanced features - use when explicitly requested
disable-model-invocation: true
---
Advanced features available when user explicitly invokes /plugin-advanced.
```

### Hooks Performants

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Plugin loaded' > /dev/null"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "function",
            "function": "validateFileWrite"
          }
        ]
      }
    ]
  }
}
```

### Agents avec Modèles Spécifiques

```markdown
---
name: quick-scanner
description: Fast code scanning for basic issues
model: haiku
tools: Read, Grep, Glob
---

# Quick Scanner

Focus on:
- Missing imports
- Undefined variables
- Basic syntax errors
- Console.log statements

Do NOT:
- Deep analysis
- Performance profiling
- Security auditing
```

```markdown
---
name: deep-analyzer
description: Comprehensive code analysis
model: opus
tools: Read, Grep, Glob, Bash
maxTurns: 100
---

# Deep Analyzer

Comprehensive analysis:
- Security vulnerabilities
- Performance issues
- Code smells
- Design patterns
- Architecture assessment
```

### Optimisation des Scripts de Plugin

```bash
#!/bin/bash
# scripts/setup.sh - Fast setup with error handling

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Color output for readability
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}INFO${NC} $1"; }
log_error() { echo -e "${RED}ERROR${NC} $1" >&2; }

# Fast checks
check_dependencies() {
    local deps=("node" "pnpm" "git")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep not found"
            return 1
        fi
    done
    log_info "All dependencies available"
}

# Parallel setup where possible
setup_plugin() {
    check_dependencies

    # Run independent tasks in parallel
    pnpm install &
    pnpm run build:plugins &
    wait

    log_info "Plugin setup complete"
}

setup_plugin "$@"
```

---

## 5. Scripts & Hooks

### Hooks par Type d'Événement

| Événement | Quand | Usage |
|-----------|------|------|
| **SessionStart** | Au démarrage de session | Initialisation, setup |
| **PreToolUse** | Avant chaque outil | Validation, logging |
| **PostToolUse** | Après chaque outil | Notifications, cleanup |
| **PreAgentInvoke** | Avant lancement agent | Permission check |
| **PostAgentInvoke** | Après fin agent | Result processing |
| **Stop** | À la fin de session | Cleanup, persistence |

### Hooks de Validation

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-changes.sh",
            "timeout": 5000
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-command.sh",
            "allowFailure": false
          }
        ]
      }
    ]
  }
}
```

### Scripts de Validation

```bash
#!/bin/bash
# scripts/validate-changes.sh
# Validate file changes before write

# Read input from stdin
INPUT=$(cat)

# Extract file path
FILE=$(echo "$INPUT" | jq -r '.file_path // .tool_input.path // empty')

# Security checks
if [[ "$FILE" =~ \.(env|pem|key)$ ]]; then
    echo "Rejecting write to sensitive file: $FILE" >&2
    exit 2  # Exit code 2 blocks the operation
fi

# Check file size (prevent huge writes)
SIZE=$(echo "$INPUT" | jq -r '.content // "" | length')
if [ "$SIZE" -gt 100000 ]; then
    echo "File too large: $SIZE bytes (max 100KB)" >&2
    exit 2
fi

exit 0
```

```bash
#!/bin/bash
# scripts/validate-command.sh
# Validate bash commands before execution

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block dangerous commands
DANGEROUS=("rm -rf" "dd if=" "mkfs" "format" ":>.*")
for pattern in "${DANGEROUS[@]}"; do
    if [[ "$COMMAND" =~ $pattern ]]; then
        echo "Blocked dangerous command: $COMMAND" >&2
        exit 2
    fi
done

# Warn about risky operations
RISKY=("git push" "npm publish" "docker push")
for pattern in "${RISKY[@]}"; do
    if [[ "$COMMAND" =~ $pattern ]]; then
        echo "Warning: Risky operation - $COMMAND" >&2
        # Continue anyway (exit 0)
    fi
done

exit 0
```

### Hooks de Notification

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"File Modified\" with title \"Claude Code\"'",
            "runInBackground": true
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/log-command.sh",
            "runInBackground": true
          }
        ]
      }
    ]
  }
}
```

### Hooks de Performance Monitoring

```bash
#!/bin/bash
# scripts/performance-monitor.sh
# Monitor tool usage and performance

TOOL_NAME=$1
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE=".claude/performance.log"

# Log usage
echo "[$TIMESTAMP] Tool: $TOOL_NAME" >> "$LOG_FILE"

# Alert on slow operations
if [ "$TOOL_NAME" = "Bash" ]; then
    START=$(date +%s%N)
    # Let the tool execute
    # ...
    END=$(date +%s%N)
    DURATION=$(( (END - START) / 1000000 ))  # Convert to milliseconds

    if [ "$DURATION" -gt 5000 ]; then
        echo "Warning: Slow operation (${DURATION}ms)" >&2
    fi
fi
```

---

## 6. MCP Optimization

### Serveur MCP Performant

```typescript
// Fast MCP server implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'fast-mcp-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {},
    resources: {}  // Enable resources
  }
});

// Lazy tool registration - only register when needed
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fast-query',
        description: 'Fast database query with caching',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      }
    ]
  };
});

// Cache for expensive operations
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: { query } } = request.params;

  if (name === 'fast-query') {
    // Check cache first
    const cached = cache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(cached.data, null, 2)
        }]
      };
    }

    // Expensive operation
    const result = await executeQuery(query);

    // Store in cache
    cache.set(query, { data: result, timestamp: Date.now() });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function executeQuery(query: string) {
  // Database query implementation
  // ...
}
```

### Streaming MCP Responses

```typescript
// Stream large responses
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === 'stream-large-data') {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const data = await fetchLargeDataset();

          for (const chunk of data) {
            controller.enqueue({
              type: 'text',
              text: JSON.stringify(chunk)
            });

            // Small delay to prevent overwhelming the client
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return {
      content: [{ type: 'resource', uri: 'stream://data' }]
    };
  }
});
```

### MCP Resource Optimization

```typescript
// Define resources with proper metadata
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'config://app',
        name: 'Application Configuration',
        description: 'Current app configuration',
        mimeType: 'application/json'
      },
      {
        uri: 'logs://recent',
        name: 'Recent Logs',
        description: 'Last 100 log entries',
        mimeType: 'text/plain'
      }
    ]
  };
});

// Lazy resource loading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'config://app') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(await getConfig(), null, 2)
      }]
    };
  }

  if (uri === 'logs://recent') {
    const logs = await getRecentLogs(100); // Limit output
    return {
      contents: [{
        uri,
        mimeType: 'text/plain',
        text: logs.join('\n')
      }]
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

---

## 7. Debugging & Troubleshooting

### Debug Mode dans Claude Code

```bash
# Activer le debug mode
claude --debug

# Vérifier les logs de session
ls -la ~/.claude/projects/<project>/

# Voir la session actuelle
cat ~/.claude/projects/<project>/sessions/<session-id>/transcript.jsonl | jq -r '.content'
```

### Problèmes Courants

#### Problème: Claude ignore les instructions CLAUDE.md

**Symptôme:** Les règles ne sont pas suivies

**Causes possibles:**
1. Fichier trop long (>200 lignes)
2. Instructions contradictoires
3. Description pas assez spécifique
4. Fichier pas au bon emplacement

**Solutions:**

```bash
# Vérifier ce qui est chargé
/memory

# Vérifier la taille du fichier
wc -l CLAUDE.md .claude/CLAUDE.md

# Réduire la taille
# - Déplacer vers des fichiers séparés
# - Utiliser des imports @
# - Convertir en hooks pour les règles strictes
```

#### Problème: Context se remplit trop vite

**Symptôme:** Performance dégrade après quelques tours

**Solutions:**

```bash
# Compacter plus agressivement
/compact Keep only recent file changes and test commands

# Utiliser subagents pour tâches verbeuses
Use a subagent to run tests and return only failures

# Réduire les outputs MCP
export MAX_MCP_OUTPUT_TOKENS=10000

# Désactiver auto memory
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
```

#### Problème: Hook ne se déclenche pas

**Diagnostic:**

```bash
# Vérifier la configuration
cat .claude/settings.json | jq '.hooks'

# Tester le hook manuellement
./scripts/my-hook.sh

# Vérifier les permissions
ls -la scripts/
```

**Solutions:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/hook.sh",
            "timeout": 10000,
            "allowFailure": false
          }
        ]
      }
    ]
  }
}
```

#### Problème: Skill ne se charge pas

**Diagnostic:**

```bash
# Lister les skills disponibles
What skills are available?

# Vérifier la structure
ls -la .claude/skills/my-skill/

# Vérifier le frontmatter
head -20 .claude/skills/my-skill/SKILL.md
```

**Solutions:**

1. Vérifier que SKILL.md existe
2. Vérifier le frontmatter (YAML valide)
3. Recharger les plugins: `/reload-plugins`
4. Vérifier le budget de caractères: `/context`

### Outils de Diagnostic

```bash
# Alias utiles pour le debugging

alias claude-logs='ls -lt ~/.claude/projects/*/sessions/ | head -20'
alias claude-debug='tail -f ~/.claude/projects/$(basename $(pwd))/sessions/latest/transcript.jsonl'
alias claude-context='echo "Context: " && /context'

# Fonction pour analyser l'usage
claude-usage() {
    local project=$(basename $(pwd))
    local sessions=~/.claude/projects/$project/sessions
    if [ -d "$sessions" ]; then
        echo "Sessions: $(ls "$sessions" | wc -l)"
        echo "Disk usage: $(du -sh "$sessions" | cut -f1)"
    fi
}
```

---

## 8. Anti-Patterns à Éviter

### Anti-Patterns CLAUDE.md

| ❌ Anti-Pattern | ✅ Solution |
|-----------------|------------|
| "Write clean code" | "Use 2-space indentation, PascalCase for components" |
| "Follow best practices" | "Use existing patterns in src/components/Button.tsx" |
| "Test your changes" | "Run `pnpm test` after changes" |
| 500+ lines of instructions | Split into @imports, keep <200 lines |
| Self-evident rules | Only include what Claude can't infer |

### Anti-Patterns Skills

| ❌ Anti-Pattern | ✅ Solution |
|-----------------|------------|
| Skill générique "fix everything" | Skills spécialisés par domaine |
| Pas de description claire | Description avec mots-clés spécifiques |
| Hardcoded values | Variables `$ARGUMENTS`, `${CLAUDE_SESSION_ID}` |
| Instructions vagues | Étapes précises avec examples |
| Pas de critères de succès | Section "Verification" explicite |

### Anti-Patterns Subagents

| ❌ Anti-Pattern | ✅ Solution |
|-----------------|------------|
| Subagent avec tous les outils | Restreindre avec `allowed-tools` |
| Pas de description | Description claire pour auto-délégation |
| Modèle opus pour tâches simples | `model: haiku` pour tâches rapides |
| Pas de limite de tours | `maxTurns: N` pour éviter boucles infinies |

### Anti-Patterns Hooks

| ❌ Anti-Pattern | ✅ Solution |
|-----------------|------------|
| Hooks synchrones lents | `runInBackground: true` |
| Pas de timeout | `timeout: 5000` (ms) |
| Block tout sans validation | Matcher spécifique |
| Pas de gestion d'erreur | `allowFailure: true` avec fallback |

### Anti-Patterns MCP

| ❌ Anti-Pattern | ✅ Solution |
|-----------------|------------|
| Retourner 100K+ tokens | Pagination ou streaming |
| Pas de cache | Cache avec TTL |
| Pas de metadata | `mimeType` pour resources |
| Requêtes synchrones lentes | Async avec timeout |

---

## 9. Checklist d'Excellence

### Pour un CLAUDE.md Efficace

- [ ] Moins de 200 lignes
- [ ] Instructions spécifiques et vérifiables
- [ ] Seules les règles non évidentes
- [ ] Imports @ pour contenu externe
- [ ] Structure claire avec headers
- [ ] Pas de contradictions
- [ ] Conventions de build documentées
- [ ] Patterns d'architecture expliqués
- [ ] Gotchas mentionnés

### Pour un Skill Efficace

- [ ] Frontmatter complet et valide
- [ ] Description avec mots-clés précis
- [ ] Instructions structurées (sections, steps)
- [ ] Exemples concrets
- [ ] Critères de vérification
- [ ] Variables utilisées (`$ARGUMENTS`)
- [ ] Templates ou fichiers de référence
- [ ] Type d'invocation approprié
- [ ] Outils restreints si nécessaire
- [ ] < 500 lignes dans SKILL.md

### Pour un Subagent Efficace

- [ ] Nom unique et descriptif
- [ ] Description précise pour auto-délégation
- [ ] Modèle approprié (haiku/sonnet/opus)
- [ ] Ouits restreints (`allowed-tools`)
- [ ] `maxTurns` défini si nécessaire
- [ ] Prompt système clair
- [ ] Workflow spécifique
- [ ] Critères de sortie
- [ ] Gestion d'erreur

### Pour un Plugin Performant

- [ ] `plugin.json` minimal
- [ ] Skills lazy-loaded si possible
- [ ] Agents avec modèles appropriés
- [ ] Hooks optimisés (background, timeout)
- [ ] Scripts rapides et robustes
- [ ] Documentation complète
- [ ] Tests pour composants critiques
- [ ] Gestion d'erreur
- [ ] Pas de dépendances inutiles

### Pour une Intégration MCP

- [ ] Caching implémenté
- [ ] Pagination pour gros résultats
- [ ] Streaming pour outputs lents
- [ ] Timeout configuré
- [ ] Gestion d'erreur robuste
- [ ] Resources avec metadata
- [ ] Tools avec schemas clairs
- [ ] Pas d'outputs massifs

---

## 📝 Conclusion

Cette masterclass couvre les techniques avancées pour optimiser votre utilisation de Claude Code :

### Points Clés à Retenir

1. **Prompting** = Spécificité + Vérification + Contexte
2. **Mémoire** = Compaction active + Subagents + Lazy loading
3. **Skills** = Description claire + Frontmatter complet + Templates
4. **Plugins** = Structure modulaire + Hooks optimisés + Scripts rapides
5. **MCP** = Caching + Pagination + Streaming

### Cycle d'Amélioration Continu

```
┌─────────────────────────────────────────┐
│          OPTIMIZATION CYCLE             │
├─────────────────────────────────────────┤
│                                         │
│  1. Measure → /context, check tokens    │
│  2. Identify → Bottlenecks             │
│  3. Optimize → Apply patterns           │
│  4. Verify → Test improvements          │
│  5. Repeat → Continuous improvement     │
│                                         │
└─────────────────────────────────────────┘
```

### Prochaines Étapes

1. **Profiler** votre configuration actuelle
2. **Appliquer** les patterns de ce guide
3. **Mesurer** les améliorations
4. **Itérer** basé sur les résultats

---

**Sources :**
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)

---

*Document créé le 12 Mars 2026 - Basé sur la documentation officielle Anthropic*
