---
description: Initialize new project with stack & structure definition
argument-hint: [--workflow=from-scratch|existing|migration] [--type=SaaS|ecommerce|blog|portfolio|dashboard|app|api]
---

Use the smite-initializer skill to define technical stack and project structure.

**Workflows:**
- `from-scratch` - Create new project from zero (5-10 min)
- `existing` - Integrate SMITE into existing project
- `migration` - Migrate from another stack

**Project Types:**
- `SaaS` - Business software with auth, DB, payments
- `ecommerce` - Online store with catalog & checkout
- `blog` - Content site with CMS
- `portfolio` - Personal showcase
- `dashboard` - Admin/analytics interface
- `app` - Mobile/web application
- `api` - Backend service only

**Output:** `docs/start-init.md` with stack, structure, and next steps

**Usage:**
/smite:init
/smite:init --workflow=from-scratch --type=SaaS
