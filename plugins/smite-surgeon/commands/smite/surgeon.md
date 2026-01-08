---
description: Surgical refactoring for performance & type-safety
argument-hint: [--mode=audit|refactor|optimize] [--target=file:line] [--reason=issue]
---

Use the smite-surgeon skill for precise code refactoring and optimization.

**Modes:**
- `audit` - Analyze technical debt (10-15 min)
- `refactor` - Fix debt without functional changes
- `optimize` - Maximize performance

**Flags:**
- `--target` - Specific file:line to target
- `--reason` - Why this code needs intervention

**Output:** `docs/SURGEON_AUDIT.md` or refactored code

**Usage:**
/smite:surgeon --mode=audit
/smite:surgeon --mode=refactor --target="src/components/Button.tsx:42"
/smite:surgeon --mode=optimize --reason="Performance bottleneck detected"
