# Ralph

> Multi-agent orchestrator with parallel execution (2-3x speedup)

## 🎯 Purpose

Orchestrates multiple agents to complete complex development tasks by executing independent user stories in parallel. Achieves **2-3x speedup** over sequential execution through intelligent dependency analysis and batch optimization.

**Target Audience**: Developers working on complex features with multiple components

## 🚀 Quick Start

```bash
# 1. Install Ralph and required dependencies
/plugin install ralph@smite
/plugin install mobs@smite

# 2. Auto-generate PRD and execute
/ralph "Build a todo app with authentication"

# 3. Auto-iterating (keeps going until done)
/loop "Build a full SaaS platform"

# 4. Use existing PRD
/ralph execute .claude/.smite/prd.json
```

## 📖 Usage

### Basic Workflow

```bash
# 1. Ralph auto-generates PRD
/ralph "Add user authentication with OAuth"

# 2. Parses into user stories
# 3. Builds dependency graph
# 4. Executes independent stories in parallel
# 5. Tracks progress and commits
```

### Advanced Options

**Auto-iterating loop** (recommended for complex tasks):
```bash
/loop "Build a dashboard with real-time updates" --max-iterations 100
```

**Custom PRD**:
```json
{
  "project": "MyProject",
  "userStories": [
    {
      "id": "US-001",
      "title": "Setup Next.js",
      "agent": "architect",
      "dependencies": []
    },
    {
      "id": "US-002",
      "title": "Build UI",
      "agent": "builder",
      "dependencies": ["US-001"]
    }
  ]
}
```

**Available agents** (from mobs plugin):
- `architect` - Design & strategy
- `builder` - Implementation
- `finalize` - QA & documentation
- `refactor` - Systematic refactoring

**Status & control**:
```bash
/ralph status    # Show progress
/ralph cancel    # Cancel workflow
```

## 🔧 Configuration

### Required

- **PRD file**: `.claude/.smite/prd.json` (auto-generated or manual)
- **State directory**: `.claude/.smite/` (auto-created)

### Optional

- **`--max-iterations`**: Max loop iterations (default: 50)
- **`--completion-promise`**: Completion token (default: `COMPLETE`)

## 🔗 Integration

- **Requires**: mobs (architect, builder, finalize agents)
- **Used by**: All complex workflows
- **Compatible with**: toolkit (semantic search)

**Agents orchestrated** (from mobs plugin):
- `/architect` - Design & strategy
- `/builder` - Implementation
- `/finalize` - QA & documentation
- `/refactor` - Systematic refactoring

## 📚 Documentation

- **[Full Guide](../../docs/RALPH_GUIDE.md)** - Complete Ralph usage
- **[Examples](examples/)** - Sample PRDs
- **[Spec-First](../../docs/SPEC_FIRST.md)** - Spec-driven workflow

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Hook not installed | Run `npm run install-hook` in plugins/ralph |
| Stories failing | Check `.claude/.smite/progress.txt` for details |
| Dependency cycle detected | Fix PRD to remove circular dependencies |
| Workflow stuck | Run `/ralph cancel` then restart |

## ⚡ Performance

| Project Type | Speedup |
|--------------|---------|
| Small (3-5 stories) | 20-30% faster |
| Medium (6-10 stories) | 40-50% faster |
| Large (10+ stories) | 50-60% faster |

**Example**: 20 stories with parallel batching = **3x faster** than sequential

---
**Version**: 3.1.0 | **Category**: orchestration | **Author**: Pamacea
