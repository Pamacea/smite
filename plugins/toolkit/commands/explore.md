# toolkit explore

Structured codebase exploration with task-specific workflows for finding functions, components, bugs, dependencies, and mapping architecture.

## Description

Explore your codebase with targeted tasks using semantic search and dependency analysis. Each task provides structured insights and findings.

## Usage

```bash
/toolkit explore --task=<task> [options]
```

## Tasks

### find-function
Locate specific functions and their usage across the codebase.

```bash
/toolkit explore --task=find-function --target="authenticateUser"
```

**Output:**
- Function locations (file, line)
- Function signature
- Call tree (who calls it)
- Usage examples
- Related functions

### find-component
Find React/Vue/Angular components and their relationships.

```bash
/toolkit explore --task=find-component --target="Button"
```

**Output:**
- Component locations
- Props and state
- Parent/child relationships
- Usage instances
- Related components

### find-bug
Investigate potential bugs or error patterns.

```bash
/toolkit explore --task=find-bug --target="memory leak"
```

**Output:**
- Suspected bug locations
- Bug type and severity
- Code patterns
- Fix suggestions
- Related issues

### find-deps
Map dependencies and imports between modules.

```bash
/toolkit explore --task=find-deps --target="src/auth"
```

**Output:**
- Import tree
- Dependency graph
- Circular dependencies
- Unused imports
- Module relationships

### map-architecture
Create a visual map of the codebase architecture.

```bash
/toolkit explore --task=map-architecture
```

**Output:**
- Directory structure
- Module relationships
- Entry points
- Layer separation
- Architecture patterns

### analyze-impacts
Analyze the impact of proposed changes.

```bash
/toolkit explore --task=analyze-impacts --target="src/auth/jwt.ts"
```

**Output:**
- Affected files
- Blast radius
- Breaking changes
- Risk assessment
- Test suggestions

## Options

- `--task <task>` - Exploration task (required)
- `--target <name>` - Target to find (function, component, bug, directory, file)
- `--scope <path>` - Limit exploration to specific directory
- `--depth <n>` - Depth for dependency analysis (default: 3)
- `--output <format>` - Output format: `table` (default), `json`, `markdown`, `visual`

## Examples

```bash
# Find a function
/toolkit explore --task=find-function --target="validateToken"
# → Found in 3 files, call tree with 12 callers

# Find components
/toolkit explore --task=find-component --target="LoginForm"
# → Component with props, state, used in 5 places

# Investigate bugs
/toolkit explore --task=find-bug --target="race condition"
# → Found 2 potential race conditions in auth module

# Map dependencies
/toolkit explore --task=find-deps --target="src/api"
# → 15 dependencies, 1 circular, 3 unused imports

# Map architecture
/toolkit explore --task=map-architecture
# → Visual tree with 4 layers, 12 modules

# Analyze change impact
/toolkit explore --task=analyze-impacts --target="src/auth/jwt.ts"
# → 8 files affected, 2 high-risk changes
```

## Output Format

### Table Output (default)

```
🔍 Explore Results: find-function

Target: "validateToken"
Tokens: 3,124 (vs 24,567 traditional - 87% saved)

┌─────────────────────────────┬──────────┬──────────────────────────────────┐
│ Location                    │ Line     │ Details                          │
├─────────────────────────────┼──────────┼──────────────────────────────────┤
│ src/auth/jwt.ts             │ 45       │ export function validateToken... │
│ src/middleware/auth.ts      │ 12       │ Calls validateToken              │
│ src/controllers/user.ts     │ 89       │ Calls validateToken              │
└─────────────────────────────┴──────────┴──────────────────────────────────┘

Call Tree (12 callers):
  ├─ src/middleware/auth.ts (main entry point)
  ├─ src/controllers/user.ts (login endpoint)
  ├─ src/controllers/admin.ts (admin check)
  └─ 9 more files...

✓ Analysis complete in 4.2 seconds
```

### Visual Output

```
🏗️  Architecture Map

src/
├─ api/           [API Layer]
│  ├─ routes/     [8 files]
│  └─ controllers/ [12 files]
├─ services/      [Business Logic]
│  ├─ auth/       [5 files]
│  └─ data/       [7 files]
├─ models/        [Data Models]
│  └─ schema.ts   [Prisma schema]
└─ utils/         [Utilities]
   └─ helpers.ts  [Helper functions]

Layers: 4 | Modules: 32 | Entry Points: 3
```

## Performance by Task

| Task | Tokens | Speed | Findings |
|------|--------|-------|----------|
| find-function | 3,124 | 4.2s | 3 locations, 12 callers |
| find-component | 4,567 | 5.1s | 1 component, 5 usages |
| find-bug | 8,234 | 12.3s | 2 bugs, 5 patterns |
| find-deps | 5,123 | 6.7s | 15 deps, 1 circular |
| map-architecture | 12,345 | 15.2s | 4 layers, 32 modules |
| analyze-impacts | 6,789 | 8.9s | 8 files, 2 high-risk |

## Notes

- Combines Search API + Graph API + Detect API
- Token savings: 70-87% vs traditional grep/glob + Read
- Best for: understanding codebase, refactoring, impact analysis
- Falls back to grep/glob if toolkit unavailable

## See Also

- `/toolkit search` - Free-form semantic search
- `/toolkit graph` - Dependency graph visualization
- `/toolkit detect` - Semantic bug detection
