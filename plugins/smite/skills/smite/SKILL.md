---
name: smite
description: SMITE essential commands - oneshot, debug, commit, explore, epct, and smite
version: 3.1.0
---

# SMITE Commands Skill

## Mission

Provide rapid development commands for quick iteration, debugging, and code management workflows.

## Core Workflow

1. **Input**: Command invocation by user or agent
2. **Process**:
   - Execute specialized workflow (oneshot/debug/explore/commit/epct/smite)
   - Apply methodology (Explore→Code→Test, E-P-C-T, etc.)
   - Handle git operations and code quality
3. **Output**: Completed task with commits as needed

## Key Principles

- **Quick implementation**: oneshot for well-defined tasks
- **Systematic debugging**: debug for error diagnosis
- **Clean git history**: commit with descriptive messages
- **Advanced workflows**: epct for systematic implementation

## Commands

### Quick Implementation
- **`/oneshot`**: Ultra-fast feature implementation (Explore → Code → Test)
- **`/debug`**: Systematic bug debugging with deep analysis
- **`/explore`**: Quick codebase exploration

### Code Management
- **`/commit`**: Quick commit and push with clean messages

### Advanced Workflows
- **`/epct`**: E-P-C-T workflow (Explore → Plan → Code → Test)

### Installation
- **`/smite`**: Install all SMITE commands

## Integration

- **Works with**: architect (design), builder (implementation), explorer (analysis), finalize (QA)
- **Typical workflow**: explore → architect → oneshot/apex → commit → finalize
- **Agent usage**: Agents can call these commands for specialized workflows

## Configuration

- **Command selection**: Choose based on task complexity and type
- **Workflow preference**: oneshot (fast), epct (methodical)
- **Git operations**: Automatic staging, clean messages, optional push

## Error Handling

- **Wrong command chosen**: Suggest appropriate alternative
- **Task too complex**: Switch from oneshot to epct
- **Git conflicts**: Report conflict, require manual resolution

---
*Auto-generated from plugin.json - Last sync: 2025-01-22*
