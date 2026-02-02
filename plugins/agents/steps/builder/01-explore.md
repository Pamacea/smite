# Step 1: Explore Codebase

**Flag**: `-e` or `--explore`

## Purpose

Search the existing codebase to understand patterns, find similar implementations, and gather context before writing code.

## What To Do

### 1. Determine Scope

Based on the feature or component being built:
- Identify the domain (auth, UI, API, data, etc.)
- Note the tech stack (Next.js, Rust, Python, Go)
- Understand the feature boundaries

### 2. Use Semantic Search (MANDATORY)

**BEFORE any manual exploration, you MUST:**

```bash
# Primary choice
/toolkit search "[feature description]"

# Alternative
grepai search "[pattern to find]"

# ONLY if toolkit fails:
# Then use Grep/Glob/Read
```

### 3. Search Strategy

Search for:
- Similar features/components
- Existing patterns for the domain
- Utility functions that can be reused
- Type definitions and interfaces
- Test patterns for similar features

### 4. Build Context

Create comprehensive context document:

```markdown
# Exploration Context: [Feature Name]

**Date**: [Timestamp]
**Tech Stack**: [Detected stack]
**Domain**: [Feature domain]

## Existing Patterns Found

### Similar Features
1. **[Feature 1]** - `src/path/to/file.ts`
   - Pattern: [Description]
   - Reusable: [Yes/No]
   - Notes: [Implementation details]

2. **[Feature 2]** - `src/path/to/file.ts`
   - Pattern: [Description]
   - Reusable: [Yes/No]
   - Notes: [Implementation details]

### Utilities Available
- `[util name]` - `src/utils/util.ts` - [Purpose]
- `[util name]` - `src/utils/util.ts` - [Purpose]

### Types & Interfaces
- `[Type name]` - `src/types/index.ts`
- `[Interface name]` - `src/types/index.ts`

### Test Patterns
- Framework: [Vitest/Jest/cargo test/pytest]
- Location: `__tests__/` or `tests/`
- Pattern: [Description]

## Codebase Conventions

### File Structure
```
src/
├── components/    # React components
├── lib/          # Utilities
├── services/     # API calls
└── types/        # TypeScript types
```

### Naming Conventions
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `PascalCase.types.ts`

### Import Patterns
- Absolute imports: `@/` for `src/`
- Relative imports: `./` for same directory
- Barrel exports: `index.ts` per directory

## Dependencies Available

### UI Libraries
- [List UI component libraries]

### Data Fetching
- [List data fetching libraries]

### State Management
- [List state management libraries]

## Tech Stack Details

### Framework
- **Name**: [Next.js/Express/etc]
- **Version**: [From package.json]
- **Key Patterns**: [Server Components, etc]

### Database
- **ORM**: [Prisma/SQLx/etc]
- **Client**: [PostgreSQL/MySQL/etc]
- **Pattern**: [Repository/Service/etc]

### Styling
- **Method**: [Tailwind/CSS Modules/etc]
- **Theme**: [If using theming]

## Potential Challenges

1. **[Challenge 1]**
   - Issue: [Description]
   - Solution: [Approach]

2. **[Challenge 2]**
   - Issue: [Description]
   - Solution: [Approach]

## Files to Modify

### New Files
- `src/...` - [Purpose]
- `src/...` - [Purpose]

### Modified Files
- `src/...` - [What changes]
- `src/...` - [What changes]

## Next Steps

- ✅ Patterns identified
- ✅ Context built
- ✅ Ready for design phase
```

### 5. Save Context

- Location: `.claude/.smite/builder-exploration.md`
- Include file paths and line references
- List reusable components and utilities

## MCP Tools Used

- ✅ **Toolkit Search** - Semantic code search
- ✅ **grepai** - Alternative semantic search
- ✅ **Dependency Graph** - Impact analysis (if needed)
- ⚠️ **Grep/Glob/Read** - ONLY if toolkit fails

## Output

- ✅ Comprehensive exploration context
- ✅ List of similar implementations
- ✅ Reusable utilities and components
- ✅ Codebase conventions documented
- ✅ Saved to `.claude/.smite/builder-exploration.md`

## Next Step

Proceed to `02-design.md` (use `-d` flag) to design the structure and types

## ⚠️ Critical Rules

1. **NEVER skip semantic search** - Always use `/toolkit search` first
2. **Document everything found** - Create reusable knowledge
3. **Look for patterns, not just code** - Understand conventions
4. **Build context efficiently** - Use toolkit's surgeon mode for large codebases
