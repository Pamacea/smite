---
description: Synchronize documentation with code changes
argument-hint: [--mode=sync|audit|generate] [--target=README|JSDoc|API]
---

Use the doc-maintainer skill to automatically synchronize documentation with code changes.

**Modes:**
- `sync` - Update existing docs based on code changes
- `audit` - Check documentation completeness without modifying
- `generate` - Generate missing documentation from code

**Targets:**
- `README` - Project documentation and setup guides
- `JSDoc` - Inline code documentation
- `API` - API endpoint documentation

**Usage:**
/smite:doc-maintainer --mode=sync
/smite:doc-maintainer --mode=generate --target=JSDoc
