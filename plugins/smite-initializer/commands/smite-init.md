---
description: Initialize project with technical stack and structure
argument-hint: [--workflow=from-scratch|existing|migration] [--type=SaaS|ecommerce|blog|portfolio|dashboard|app|api] [--stack=nextjs|rust|python|go]
---

Initialize a new project with optimal technical stack and project structure.

**Workflows:**

- `from-scratch` - Create new project from zero
- `existing` - Integrate SMITE into existing project
- `migration` - Migrate from another stack

**Stack presets:**

- `nextjs` - React 18, TypeScript, Next.js 14, Tailwind, Prisma
- `rust` - Rust, Cargo, Tokio, Sqlx
- `python` - Python 3.12, FastAPI, SQLAlchemy, Pydantic
- `go` - Go, standard library, common frameworks

**Project Types:**

- `SaaS` - Business software with auth, DB, payments
- `ecommerce` - Online store with catalog & checkout
- `blog` - Content site with CMS
- `portfolio` - Personal showcase
- `dashboard` - Admin/analytics interface
- `app` - Mobile/web application
- `api` - Backend service only

**Output:**

- `docs/start-init.md` - Project specification
- Config files (package.json, tsconfig.json, etc.)

**Usage:**
/smite-init
/smite-init --workflow=from-scratch --type=SaaS --stack=nextjs
/smite-init --stack=rust
