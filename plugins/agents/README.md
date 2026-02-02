# Agents Plugin

Multi-agent orchestration system with Spec-First development workflow.

## Overview

The agents plugin provides specialized AI agents for architecture and implementation:

- **Architect** - Design, strategy, and creative workflow with 5 UI style variations
- **Builder** - Systematic implementation with tech specialization (Next.js, Rust, Python, Go)

> **Note:** Refactor and Note are now in separate plugins (`refactor@smite` and `basics@smite`)

## Skills Structure

```
skills/
├── workflow/        # Core development workflows
│   ├── architect/   # Architecture & design
│   └── builder/     # Implementation workflow
├── technical/       # Tech-specific implementation
│   ├── impl-nextjs/ # Next.js specialist
│   ├── impl-rust/   # Rust specialist
│   ├── impl-python/ # Python specialist
│   └── impl-go/     # Go specialist
├── quality/         # Quality assurance
│   ├── validator/   # Safety & validation
│   ├── reviewer/    # Code review
│   └── resolver/    # Refactoring implementation
└── specialized/     # Niche specialists
    ├── frontend/    # UI implementation
    └── ux/          # User experience
```

## Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/architect` | Architecture design and specifications | `/architect "Design auth system"` |
| `/builder` | Systematic feature implementation | `/builder --tech=nextjs "Build dashboard"` |

## Architect Modes

- `--mode=init` - Initialize new project
- `--mode=strategy` - Business strategy analysis
- `--mode=design` - Design system creation
- `--mode=brainstorm` - Creative solutions

## Builder Tech Stack

- `--tech=nextjs` - React 19, RSC, Prisma, Server Actions
- `--tech=rust` - Ownership, async/await, zero-copy
- `--tech=python` - Type hints, FastAPI, SQLAlchemy
- `--tech=go` - Goroutines, interfaces, stdlib

## Installation

```bash
/plugin install agents@smite
```

## Version

4.2.0
