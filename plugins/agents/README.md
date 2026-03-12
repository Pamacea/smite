# Agents Plugin

**23+ specialized agents** organized by domain - frontend, backend, database, devops, testing, workflow.

**Quick Start:**
```bash
/studio build --tech=rust "Create API"
/studio build --tech=nextjs --scale "Build feature"
```

**Tech Coverage:** Rust, Next.js, NestJS, Prisma, Docker, Vitest...

**Documentation:** @GUIDE.md @REFERENCE.md

---

## Overview

SMITE Agents plugin provides domain-specific development agents with deep expertise in best practices and patterns for each technology stack.

## Quick Examples

```bash
# Auto-discover agent by tech stack
/studio build --tech=rust "Create user API with DDD"
/studio build --tech=nextjs "Build dashboard with auth"

# Manual agent selection
/studio build --agent=backend/rust "Create API endpoint"
/studio build --agent=frontend/nextjs "Build UI component"

# Combine flags
/studio build --tech=prisma --quality "Design database schema"
```

## Tech Stack Coverage

| Domain | Technologies |
|--------|-------------|
| **Frontend** | Next.js 16, React, Vite, React Native |
| **Backend** | Rust, NestJS, Express, FastAPI |
| **Database** | Prisma, Drizzle, PostgreSQL, MongoDB |
| **DevOps** | Docker, Kubernetes, CI/CD, Terraform |
| **Testing** | Vitest, Playwright, Jest, MSW |
| **Workflow** | TDD, Performance, Security, Planning |

## Installation

```bash
/plugin install agents
```

**Requirements:** SMITE v4.0.0+, core plugin

---

**Version:** 2.0.0 | **Last Updated:** 2026-03-12
