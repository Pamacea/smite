---
description: Code review, QA, testing & performance validation
argument-hint: [--mode=commit-validation|test|coverage|performance|security] [--tech=nextjs|rust|python]
---

Validate code quality, generate tests, and analyze performance/security.

**Modes:**

- `commit-validation` - Review code for type-safety, architecture, debt
- `test` - Generate test suite (unit, integration, E2E)
- `coverage` - Analyze test coverage gaps
- `performance` - Lighthouse, Web Vitals, database queries
- `security` - OWASP Top 10 audit, vulnerability scan

**Output:**

- `docs/VALIDATION_COMMIT.md`
- `docs/TEST_SUITE_REPORT.md`
- `docs/COVERAGE_ANALYSIS.md`
- `docs/PERFORMANCE_ANALYSIS.md`
- `docs/SECURITY_AUDIT.md`

**Usage:**
/smite-gatekeeper --mode=commit-validation
/smite-gatekeeper --mode=test --tech=nextjs
/smite-gatekeeper --mode=performance
/smite-gatekeeper --mode=security
