---
description: Surgical code refactoring and optimization
argument-hint: [--target=pattern|file] [--mode=optimize|type-safety|performance]
---

Refactor code to eliminate technical debt and improve performance.

**Modes:**

- `optimize` - General refactoring for performance
- `type-safety` - Replace `any` types, add strict typing
- `performance` - Optimize hot paths, reduce complexity

**Usage:**
/smite-surgeon --target="src/lib/api.ts" --mode=type-safety
/smite-surgeon --target="any types" --mode=optimize

**Output:**

- Refactored code
- `docs/SURGEON_REPORT.md`
