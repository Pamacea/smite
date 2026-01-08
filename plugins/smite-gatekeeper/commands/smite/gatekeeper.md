---
description: Code review & architecture validation
argument-hint: [--mode=pre-dev|commit-validation] [--artifact=path]
---

Use the smite-gatekeeper skill to validate code quality and architecture compliance.

**Modes:**
- `pre-dev` - Validate design before implementation (5-10 min)
- `commit-validation` - Check commit readiness

**Flags:**
- `--artifact` - Specific file/design to validate
- `--auto` - Automatic trigger by orchestrator

**Validates:**
- CLAUDE.md principles compliance
- Architecture decisions
- Code quality standards
- Type safety enforcement

**Output:** `docs/VALIDATION_ARCHITECTURE.md` with Pass/Fail report

**Usage:**
/smite:gatekeeper --mode=pre-dev --artifact="docs/architecture.md"
/smite:gatekeeper --mode=commit-validation
