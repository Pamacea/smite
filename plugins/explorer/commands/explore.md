---
description: Codebase exploration, dependency mapping & pattern discovery
argument-hint: [--task=find-function|find-component|find-bug|find-deps|map-architecture|analyze-impacts] [--scope=module|full] [--target=pattern]
---

Explore and understand the codebase structure.

**Tasks:**

- `find-function` - Locate specific functions and their usage across the codebase
- `find-component` - Find React/Vue/Angular components and their relationships
- `find-bug` - Investigate potential bugs or error patterns
- `find-deps` - Map dependencies and imports between modules
- `map-architecture` - Create a visual map of the codebase architecture
- `analyze-impacts` - Analyze impact of changes (blast radius)

**Scopes:**

- `module` - Explore specific module or directory
- `full` - Explore entire codebase

**Spec-First Mode:**

When executing with a spec file (provided in prompt):

1. **Read the spec completely** - Understand what exploration is needed
2. **Follow the exploration plan** - Use the steps defined in the spec
3. **Report findings** - Document results according to spec format
4. **Flag inconsistencies** - If codebase structure doesn't match spec assumptions, report immediately

**Output:**

- `docs/explorer-findings.md` - Exploration results
- `docs/explorer-dependencies.md` - Dependency mapping
- `docs/explorer-architecture.md` - Architecture overview

**Toolkit Integration:**

When toolkit plugin is available, Explorer can leverage:
- **Semantic Search** - 2x precision improvement using `ToolkitAPI.Search.semantic()`
- **Dependency Graph** - Automated dependency mapping with `ToolkitAPI.DependencyGraph.build()`
- **Bug Detection** - Pattern-based bug finding with `ToolkitAPI.Detect.issues()`
- **Token Optimization**: 60-87% savings when using toolkit features

**Usage:**
/explore --task=find-function --target="getUserData"
/explore --task=find-component --scope=module
/explore --task=map-architecture
/explore --task=find-bug --target="memory leak"
