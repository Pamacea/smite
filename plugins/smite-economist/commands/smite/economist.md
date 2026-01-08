---
description: Technical debt optimization and cost management
argument-hint: [--mode=assess|prioritize|track] [--metric=complexity|interest|principal]
---

Use the smite-economist skill to analyze and optimize technical debt economics.

**Modes:**
- `assess` - Calculate technical debt cost
- `prioritize` - Rank debt by ROI
- `track` - Monitor debt over time

**Metrics:**
- `complexity` - Cyclomatic complexity analysis
- `interest` - Cost of delay (interest on debt)
- `principal` - Principal debt amount

**Output:** `docs/DEBT_ECONOMICS.md` with financial analysis

**Usage:**
/smite:economist --mode=assess
/smite:economist --mode=prioritize --metric=interest
