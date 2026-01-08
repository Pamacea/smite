---
description: Software architecture and system design
argument-hint: [--phase=initial|refactor] [--domain=frontend|backend|fullstack]
---

Use the smite-architect skill to design software architecture and system structure.

**Phases:**
- `initial` - Design architecture for new project
- `refactor` - Restructure existing architecture

**Domains:**
- `frontend` - UI/UX architecture and state management
- `backend` - API, database, and service architecture
- `fullstack` - Complete system architecture

**Output:** `docs/architecture-product.md` with system design

**Usage:**
/smite:architect --phase=initial --domain=fullstack
/smite:architect --phase=refactor --domain=backend
