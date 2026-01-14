# SMITE - Essential Development Commands

Essential Claude Code commands for rapid, systematic development.

## Overview

This plugin provides a collection of high-quality, battle-tested commands for your `~/.claude/commands/` directory. These are the default SMITE commands that complement SMITE agents and provide proven workflows for common development tasks.

## Installation

```bash
# 1. Install the plugin
/plugin install smite@smite

# 2. Run the installer command
/smite
```

That's it! The `/smite` command automatically installs all 11 development commands to your `~/.claude/commands/` directory.

**Cross-platform:** Works on Windows, macOS, and Linux.

## Installed Commands

### 🚀 Core Workflows

#### `/oneshot` - Ultra-Fast Implementation
Speed-focused feature implementation with minimal overhead.
- **Best for**: Quick features, small fixes, rapid prototyping
- **Workflow**: Explore → Code → Test (5-10 min max)
- **Philosophy**: Ship fast, iterate later

#### `/epct` - Systematic Implementation
Structured 4-phase workflow for complex features.
- **Best for**: Multi-file changes, thorough implementation
- **Workflow**: Explore → Plan → Code → Test
- **Philosophy**: Correctness > Speed

#### `/apex` - Quality-Focused Implementation
4-phase methodology with verification gates.
- **Best for**: Production code, critical features
- **Workflow**: Analyze → Plan → Execute → eXamine
- **Philosophy**: Quality-first with user approval

### 🔍 Exploration & Analysis

#### `/explore` - Deep Codebase Exploration
Comprehensive context gathering from codebase, docs, and web.
- **Best for**: Understanding new projects, finding patterns
- **Features**: Parallel agent execution, multi-source research
- **Output**: Structured findings with file references

#### `/explain-architecture` - Architecture Analysis
Identify and explain architectural patterns and design decisions.
- **Best for**: Onboarding, documentation, code review
- **Features**: Pattern recognition, ASCII diagrams, trade-offs
- **Output**: Comprehensive architecture documentation

### 🐛 Debugging

#### `/debug` - Systematic Bug Debugging
Deep analysis and resolution of bugs with root cause mapping.
- **Best for**: Complex bugs, production issues
- **Features**: ULTRA-THINK analysis, "WHY" technique (5x deep)
- **Output**: Root cause → Minimal targeted fix

### 📝 Documentation & Memory

#### `/claude-memory` - CLAUDE.md Management
Create and maintain CLAUDE.md files following best practices.
- **Best for**: Project setup, knowledge transfer
- **Features**: Global/folder-specific, best practice templates
- **Output**: Well-structured project memory

#### `/cleanup-context` - Memory Bank Optimization
Reduce token usage by consolidating and archiving memory files.
- **Best for**: Large projects, context optimization
- **Features**: Duplicate consolidation, archive management
- **Output**: Optimized memory with zero information loss

### 🔧 Git & Workflows

#### `/commit` - Quick Commit & Push
Fast, clean commits with conventional format.
- **Best for**: Rapid iteration, atomic commits
- **Features**: Auto-stage, auto-push, conventional format
- **Output**: Clean git history

#### `/create-pull-request` - PR Creation
Create and push PRs with auto-generated descriptions.
- **Best for**: Team collaboration, code review
- **Features**: Auto-title, diff analysis, issue links
- **Output**: Professional PR ready for review

#### `/run-tasks` - GitHub Issue Execution
Execute GitHub issues with full EPCT workflow and PR creation.
- **Best for**: Issue-driven development
- **Features**: Branch management, auto-PR, issue updates
- **Output**: Complete issue-to-PR workflow

## Command Selection Guide

| Situation | Use Command |
|-----------|-------------|
| Quick feature or fix | `/oneshot` |
| Complex feature (2-5 files) | `/epct` |
| Production-critical feature | `/apex` |
| Understanding codebase | `/explore` |
| Documenting architecture | `/explain-architecture` |
| Bug investigation | `/debug` |
| Project setup | `/claude-memory` |
| Too many context files | `/cleanup-context` |
| Commit changes | `/commit` |
| Create PR for review | `/create-pull-request` |
| Work on GitHub issue | `/run-tasks` |

The PostPluginInstall hook will automatically copy all commands to `~/.claude/commands/` without overwriting existing commands.

## Usage Examples

### Ultra-Fast Feature
```bash
/oneshot Add user authentication to the login form
```

### Systematic Implementation
```bash
/epct Build a complete dashboard with charts and filters
```

### Deep Exploration
```bash
/explore How does the payment processing system work?
```

### Debug Production Issue
```bash
debug User gets 500 error when checking out with PayPal
```

### Quick Commit
```bash
/commit
```

### GitHub Issue Workflow
```bash
/run-tasks 123
```

## Workflow Comparison

```
┌─────────────┬──────────┬───────────┬──────────┐
│   Command   │   Speed  │  Quality  │  Scope   │
├─────────────┼──────────┼───────────┼──────────┤
│ /oneshot    │ ⚡⚡⚡    │ ⚡⚡       │ Small    │
│ /epct       │ ⚡⚡      │ ⚡⚡⚡      │ Medium   │
│ /apex       │ ⚡        │ ⚡⚡⚡⚡     │ Large    │
└─────────────┴──────────┴───────────┴──────────┘
```

## Integration with SMITE

These commands work seamlessly with SMITE agents:

- Use `/oneshot` with `/builder` for rapid implementation
- Use `/explore` before `/architect` for better design
- Use `/debug` when `/simplifier` finds issues
- Use `/claude-memory` to document SMITE agent conventions
- Use `/commit` after any SMITE agent work

## Command Philosophy

All commands follow these principles:

1. **Clear Purpose**: Each command has a specific, well-defined use case
2. **Structured Workflow**: Repeatable, documented processes
3. **Quality Gates**: Validation and testing phases
4. **User Control**: Approval points for critical decisions
5. **Evidence-Based**: Deep analysis before action

## File Structure

After installation, commands are available at:

```
~/.claude/commands/
├── oneshot.md
├── explore.md
├── debug.md
├── commit.md
├── claude-memory.md
├── epct.md
├── apex.md
├── explain-architecture.md
├── cleanup-context.md
├── create-pull-request.md
└── run-tasks.md
```

## Updating

To update commands:

```bash
# 1. Update the plugin
/plugin update smite@smite

# 2. Reinstall commands
/smite
```

**Note**: Existing commands will be overwritten with the latest versions.

## Removing

To remove all installed commands:

```bash
# Uninstall plugin
/plugin uninstall smite@smite

# Manually delete commands (optional)
rm ~/.claude/commands/oneshot.md
rm ~/.claude/commands/explore.md
# ... etc for all commands
```

## Contributing

Found a bug or have a command suggestion? Open an issue at:
https://github.com/Pamacea/smite/issues

## License

MIT License - see SMITE repository for details.

## Credits

Created by **Pamacea** for SMITE v3.0

Some commands based on official Claude Code examples and community contributions.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-14
**SMITE Version**: 3.0.0
