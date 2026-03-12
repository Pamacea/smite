---
lazy_load: true
name: build
description: Entry point for implementation. Auto-loads specialized skills as needed - 12 composable flags with auto-detection and memory integration.
version: 3.1.0
skills:
  - ../../optional/refactor
  - ../../optional/multi-review
  - ../../optional/pattern-capture
  - ../../optional/progressive-build
---

# Build Skill - Core Entry Point

## Quick Reference

| Task | Command |
|------|---------|
| Quick fix | `/studio build --speed "task"` |
| Feature | `/studio build --scale "task"` |
| Quality | `/studio build --quality "task"` |
| Team | `/studio build --team "task"` |

## Flags Overview

**Core Flags:**
- `--speed` - Fast, surgical (quick fixes)
- `--scale` - Comprehensive (complex features)
- `--quality` - Quality gates (production code)
- `--team` - Parallel agents (large projects)

**Extended Flags:**
- `--clean` - Delete-first philosophy
- `--test` - TDD mode (RED-GREEN-REFACTOR)
- `--debug` - Bug fixing workflow
- `--docs` - Auto-documentation
- `--git` - Git-aware mode
- `--branch` - Context-aware
- `--profile` - Performance profiling
- `--types` - TypeScript improvements

## Auto-Detection

No flags? The system analyzes your task and selects:

| Signal | Detected As |
|--------|-------------|
| Short task | `--speed` |
| "feature/build/create" | `--scale` |
| "SaaS/platform/system" | `--team` |
| "critical/security" | `--quality` |
| "refactor/cleanup" | `--clean` |
| "fix/bug/error" | `--debug` |

## Tech Stack Support

- **Next.js 16**: TypeScript, Tailwind CSS, Zustand, TanStack Query
- **Rust**: Actix/Axum, SQLx
- **Python**: FastAPI, SQLAlchemy
- **Go**: Gin/Echo, GORM

## Detailed Documentation

For complete implementation details, see the full build skill:
@../optional/refactor/SKILL.md

## Examples

```bash
# Auto-detect (recommended)
/studio build "fix login button"

# Explicit flags
/studio build --speed "quick fix"
/studio build --scale "build auth system"
/studio build --quality "payment processing"

# Combine flags
/studio build --clean --scale "refactor service"
/studio build --test --quality "TDD feature"
```

## Success Criteria

- ✅ Correct flag(s) chosen for task
- ✅ Tests passing (flag-appropriate level)
- ✅ No regressions
- ✅ Quality metrics reported
