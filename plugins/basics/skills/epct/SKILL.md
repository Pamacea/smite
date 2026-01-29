---
name: epct
description: Systematic implementation using Explore-Plan-Code-Test methodology
version: 1.0.0
---

# EPCT Skill

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

Systematic implementation through the EPCT methodology: Explore codebase patterns, Plan implementation strategy, Code following existing conventions, Test with quality validation. Balanced approach between speed and quality.

## Core Workflow

### 1. EXPLORE
**Goal**: Understand codebase patterns and find relevant files

- Use `/toolkit search` for semantic code search (75% token savings)
- Find similar features or components to use as reference
- Identify code patterns, naming conventions, architectural style
- Document reusable components and utilities
- **Deliverable**: List of relevant files and patterns found

### 2. PLAN
**Goal**: Create detailed implementation strategy

- Define file structure and what needs to be created/modified
- Outline the implementation step by step
- Identify potential risks and edge cases
- Plan testing strategy
- **Deliverable**: Implementation plan with file list

### 3. CODE
**Goal**: Implement following existing patterns

- Follow the plan from step 2
- Match existing code style and conventions
- Use clear, descriptive names (comments only when needed)
- Stay in scope - implement exactly what was planned
- Run autoformatting scripts when done
- **Deliverable**: Working implementation

### 4. TEST
**Goal**: Verify implementation quality

- Run linting: `npm run lint` or equivalent
- Run type checking: `npm run typecheck` or `tsc --noEmit`
- Build verification: `npm run build`
- Run tests if applicable: `npm test`
- Fix any issues found and re-run
- **Deliverable**: All checks passing

## Key Principles

- **Systematic**: Follow all 4 phases in order
- **Pattern-Based**: Always use existing patterns from exploration
- **Quality Gates**: Don't skip test phase
- **Scope Adherence**: Implement what was planned, no more/less
- **Tool Optimization**: Use `/toolkit search` before manual exploration

## When to Use EPCT

✅ **Good for**:
- Medium-complexity features
- When you want systematic approach
- Features requiring multiple files
- When quality is important
- Learning new codebase patterns

❌ **NOT for**:
- Quick one-line fixes (use `/oneshot`)
- Complex architecture (use `/predator`)
- Simple exploration (use `/explore`)

## Usage

```bash
/epct "Add user profile with avatar upload and cropping"
/epct "Implement search functionality with filters"
/epct "Create admin dashboard with user management"
```

## Integration

- **Works with**: `/toolkit` for exploration
- **Related to**: `/oneshot` (faster), `/predator` (more thorough)
- **Requires**: Semantic search for exploration phase
- **Best used for**: Features taking 30-90 minutes

## Success Criteria

- ✅ All 4 phases completed
- ✅ Code follows existing patterns
- ✅ Linting passes
- ✅ Type checking passes
- ✅ Build succeeds
- ✅ Tests pass (if applicable)
- ✅ Implementation matches plan

## Error Handling

- **Explore fails**: Use `/toolkit search` with broader query
- **Plan unclear**: Ask user for clarification on requirements
- **Code doesn't match patterns**: Re-explore and adjust
- **Tests fail**: Fix issues until all pass

## Workflow Comparison

| Workflow | Speed | Quality | Complexity | Use When |
|----------|-------|---------|------------|----------|
| `/oneshot` | ⚡ Fast | Basic | Low | Quick tweaks |
| `/epct` | 🚶 Medium | High | Medium | Most features |
| `/predator` | 🐢 Slow | Highest | High | Production |

## Example Flow

### Input
```
/epct "Add dark mode toggle with user preference persistence"
```

### EXPLORE Output
```
Found relevant files:
- src/components/ThemeSwitcher.tsx (similar component)
- src/hooks/useTheme.ts (theme hook)
- src/lib/storage.ts (utility for localStorage)
```

### PLAN Output
```
Implementation Plan:
1. Add dark mode class to body element
2. Create useDarkMode hook with localStorage
3. Add toggle button to navigation
4. Update CSS variables for dark theme
```

### CODE Output
```
Implementation complete:
- Created src/hooks/useDarkMode.ts
- Modified src/components/Layout.tsx
- Updated src/styles/globals.css
```

### TEST Output
```
✅ ESLint: 0 errors, 0 warnings
✅ TypeScript: No type errors
✅ Build: Successful
✅ Tests: Passing
```

---
*EPCT Skill v1.0.0 - Systematic implementation workflow*
