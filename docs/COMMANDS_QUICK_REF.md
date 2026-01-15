# SMITE Commands Quick Reference

## Core Agent Commands

### `/explore` - Codebase Exploration
Explore and understand the codebase structure, find functions, map dependencies.

```bash
/explore --task=find-function --target="getUserData"
/explore --task=find-component --scope=module
/explore --task=map-architecture
/explore --task=find-bug --target="memory leak"
```

### `/build` - Implementation
Build features and components with technology-specific best practices.

```bash
/build --tech=nextjs --feature="authentication"
/build --tech=rust --component="api-handler"
/build --design --source="figma:file-id"
```

### `/design` - Architecture & Design
Complete project architecture from concept to implementation-ready specifications.

```bash
/design --mode=init "Build a SaaS dashboard"
/design --mode=strategy "Define pricing strategy"
/design --mode=design "Modern fintech design system"
/design --mode=brainstorm "Improve user engagement"
```

### `/finalize` - Quality Assurance
Comprehensive QA, code review, linting, and documentation.

```bash
/finalize                              # Full QA + Docs
/finalize --mode=qa                    # QA only
/finalize --mode=docs                  # Docs only
/finalize --mode=qa --type=lint        # Fix linting
```

### `/simplify` - Code Simplification
Reduce complexity and improve code maintainability.

```bash
/simplify                              # Simplify recent changes
/simplify --scope=file path/to/file.ts # Specific file
/simplify --scope=all                  # Entire project
```

## Workflow Orchestration

### `/ralph` - Multi-Agent Orchestrator
Execute PRD with parallel execution for 2-3x speedup.

```bash
/ralph "Build a todo app with auth"    # Auto-generate PRD
/ralph execute .smite/prd.json         # Execute existing PRD
/ralph status                          # Show progress
/ralph cancel                          # Cancel workflow
```

### `/loop` - Auto-Iterating Execution
Autonomous looping until task completion.

```bash
/loop "Build a feature"                # Auto-loop until complete
/loop --max-iterations 100 "..."       # Custom iteration limit
```

## Quick Workflows

### `/oneshot` - Ultra-Fast Implementation
Maximum speed implementation: Explore → Code → Test.

```bash
/oneshot "Add user authentication"
```

### `/epct-cmd` - Systematic Implementation
Explore-Plan-Code-Test methodology.

```bash
/epct-cmd "Build feature with proper planning"
```

### `/apex-cmd` - APEX Methodology
Systematic implementation using Analyze-Plan-Execute-eXamine.

```bash
/apex-cmd "Complex feature requiring analysis"
```

## Debugging & Maintenance

### `/debug` - Bug Fixing
Systematic debugging with deep analysis.

```bash
/debug "Error: Cannot read property of undefined"
```

### `/commit` - Quick Commit
Fast commit and push with clean messages.

```bash
/commit
```

### `/cleanup` - Context Cleanup
Optimize memory bank files.

```bash
/cleanup
```

### `/memory` - Memory Management
Create and update CLAUDE.md files.

```bash
/memory
```

### `/explain` - Architecture Explanation
Explain architectural patterns and decisions.

```bash
/explain "How does the authentication flow work?"
```

### `/tasks` - Task Runner
Execute GitHub issues or task files.

```bash
/tasks
```

### `/pr` - Pull Request
Create and push PR with auto-generated description.

```bash
/pr
```

## Utility

### `/statusline` - Status Bar Management
Configure the statusline plugin.

```bash
/statusline install    # Install/configure
/statusline config     # View configuration
/statusline reset      # Reset to defaults
/statusline help       # Show help
```

## Command Patterns

### Agent Selection
- **Explorer**: Understanding codebase
- **Builder**: Implementing features
- **Architect**: Planning and design
- **Finalize**: QA and documentation
- **Simplifier**: Refactoring

### Workflow Selection
- **Oneshot**: Quick implementation (5-10 min)
- **EPCT**: Systematic with planning
- **APEX**: Deep analysis required
- **Ralph**: Complex multi-story workflows
- **Loop**: Autonomous iteration

### Quality Selection
- **Debug**: Fix bugs
- **Simplify**: Reduce complexity
- **Finalize**: Comprehensive QA
- **Commit**: Quick git operations

## Quick Examples

### Start New Project
```bash
/design --mode=init "Build a task manager"
/build --tech=nextjs "Implement core features"
/finalize
```

### Fix Bug
```bash
/debug "Authentication not working"
/finalize --mode=qa --type=test
/commit
```

### Explore Codebase
```bash
/explore --task=map-architecture
/explore --task=find-function --target="getUserData"
```

### Full Feature Development
```bash
/ralph "Build user authentication with JWT"
# OR
/design --mode=design "Auth system"
/build --tech=nextjs "Implement auth"
/simplify
/finalize
```

## Tips

1. **Start with `/design`** for new projects
2. **Use `/explore`** to understand existing code
3. **Run `/finalize`** before commits
4. **Use `/ralph`** for complex workflows
5. **Try `/oneshot`** for quick features
6. **Call `/debug`** when stuck on bugs
7. **Run `/simplify`** to reduce technical debt
