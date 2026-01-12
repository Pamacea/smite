---
name: smite-finalize
description: Unified Quality Assurance, Code Review, Refactoring, Linting & Documentation agent (merged gatekeeper+surgeon+linter+handover+doc-maintainer)
version: 3.0.0
hooks:
  PostToolUse:
    - type: prompt
      prompt: "After finalize completes, if validation FAILED, block further operations until fixed. If PASSED, commit changes with 'chore: finalize - QA & documentation updates' and suggest next actions."
      matcher: "Skill.*smite-finalize"
  PreToolUse:
    - type: prompt
      prompt: "Before running Finalize, check: 1) Are there files to validate? 2) What was just implemented? 3) Which mode is appropriate (qa/docs/full)? Finalize should validate OUTPUT of development work."
      matcher: "Skill.*smite-finalize"
---

# ✅ SMITE FINALIZE

**Unified Quality Assurance, Code Review, Refactoring, Linting & Documentation**

---

## 🎯 MISSION

**Finalize development work by ensuring code quality, running comprehensive QA, performing code review, fixing linting issues, and synchronizing documentation.**

**Output type**: Complete QA report + Updated documentation + Commit ready for merge

---

## 📋 COMMANDE

### `/smite-finalize`

Finalize development work with full QA + Documentation (DEFAULT)

**Flags:**

```bash
# Mode selection
--mode=[qa|docs|full]         # qa=QA only, docs=Docs only, full=Both (default)

# QA sub-modes (when --mode=qa)
--type=[test|review|lint|perf|security|coverage]

# Docs sub-modes (when --mode=docs)
--type=[readme|agents|api|sync]

# Automation
--auto                         # Automatic execution by Ralph
--artifact="[path]"            # Specific artifact to validate
```

**Examples:**

```bash
# Full finalize (QA + Docs) - DEFAULT
/smite-finalize

# QA only
/smite-finalize --mode=qa

# Specific QA type
/smite-finalize --mode=qa --type=test
/smite-finalize --mode=qa --type=review
/smite-finalize --mode=qa --type=lint
/smite-finalize --mode=qa --type=perf
/smite-finalize --mode=qa --type=security
/smite-finalize --mode=qa --type=coverage

# Docs only
/smite-finalize --mode=docs

# Specific doc type
/smite-finalize --mode=docs --type=readme
/smite-finalize --mode=docs --type=agents
/smite-finalize --mode=docs --type=api
/smite-finalize --mode=docs --type=sync

# Automatic (by Ralph)
/smite-finalize --auto --artifact="src/components/Button.tsx"
```

---

## 🔄 MODES

### MODE 1: FULL (DEFAULT)

**Duration:** 15-30 min
**Output:** Complete QA + Documentation

Runs all QA checks and documentation updates in one pass.

**Checklist:**

#### Quality Assurance
1. **Testing**
   - [ ] Run unit tests
   - [ ] Run integration tests
   - [ ] Run E2E tests (if applicable)
   - [ ] Check test coverage (>80% target)

2. **Code Review**
   - [ ] Review for best practices
   - [ ] Check for anti-patterns
   - [ ] Verify type safety (no `any`, no `@ts-ignore`)
   - [ ] Check for technical debt (TODOs, console.logs)

3. **Linting & Formatting**
   - [ ] Run ESLint and fix issues
   - [ ] Run Prettier and format
   - [ ] Check TypeScript compilation
   - [ ] Verify no console errors

4. **Performance**
   - [ ] Run Lighthouse audit (if web)
   - [ ] Check bundle size
   - [ ] Verify no memory leaks
   - [ ] Check API response times

#### Documentation
1. **README**
   - [ ] Update installation instructions
   - [ ] Update usage examples
   - [ ] Verify all commands documented
   - [ ] Add architecture diagram if needed

2. **AGENTS.md**
   - [ ] Document discovered patterns
   - [ ] Note any gotchas or special requirements
   - [ ] Add tech stack conventions
   - [ ] Include troubleshooting tips

3. **API Docs**
   - [ ] Generate JSDoc/TSDoc
   - [ ] Create API reference
   - [ ] Document endpoints/parameters
   - [ ] Add usage examples

4. **Knowledge Transfer**
   - [ ] Create onboarding guide
   - [ ] Document setup steps
   - [ ] Note environment variables
   - [ ] Add deployment instructions

---

### MODE 2: QA ONLY

**Duration:** 10-25 min
**Output:** QA report without documentation changes

#### Sub-mode: TEST

```bash
/smite-finalize --mode=qa --type=test
```

Generate and run comprehensive test suite.

**Process:**

1. **Identify Testing Scope**
   - Which components/modules need tests?
   - Unit, integration, or E2E?
   - What's the tech stack?

2. **Generate Tests**
   - Unit tests with appropriate framework
   - Integration tests for API routes
   - E2E tests for critical flows
   - Coverage analysis

3. **Run & Validate**
   - Execute test suite
   - Check coverage thresholds
   - Fix failing tests
   - Report gaps

**Output Template:**

```markdown
# TEST SUITE REPORT

## Tests Created

### Unit Tests
- ✅ Component: Button.test.tsx
- ✅ Component: TaskCard.test.tsx
- ✅ API: createTask.test.ts
- ✅ Service: authService.test.ts

### Integration Tests
- ✅ Auth flow
- ✅ CRUD operations
- ✅ Error handling

### E2E Tests
- ✅ Login flow
- ✅ Task creation
- ✅ Dashboard navigation

## Coverage
- Statements: 92%
- Branches: 88%
- Functions: 95%
- Lines: 91%

## CI Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```
```

---

#### Sub-mode: REVIEW

```bash
/smite-finalize --mode=qa --type=review
```

Comprehensive code review and refactoring recommendations.

**Review Checklist:**

1. **Type Safety**
   - [ ] No `any` types
   - [ ] No `@ts-ignore` or `@ts-expect-error`
   - [ ] Proper interface definitions
   - [ ] Type inference optimized

2. **Code Quality**
   - [ ] No anti-patterns
   - [ ] Proper error handling
   - [ ] No code duplication
   - [ ] Cyclomatic complexity < 10

3. **Best Practices**
   - [ ] SOLID principles
   - [ ] Clean code practices
   - [ ] Performance optimized
   - [ ] Security considerations

4. **Technical Debt**
   - [ ] No TODO/FIXME in production code
   - [ ] No console.log/debugger
   - [ ] No commented code
   - [ ] Proper error boundaries

**Output Template:**

```markdown
# CODE REVIEW REPORT

## Overall Assessment
Score: 85/100 ✅

## Findings

### ✅ Strengths
1. Excellent type safety
2. Clean component structure
3. Good error handling

### 🔴 Critical Issues
1. **Memory leak in useEffect**
   - File: `src/components/Chart.tsx:42`
   - Fix: Add cleanup function
   - Priority: HIGH

2. **Missing error boundary**
   - File: `src/app/dashboard/page.tsx`
   - Fix: Wrap in error boundary
   - Priority: HIGH

### ⚠️ Moderate Issues
3. **Complex function (cyclomatic complexity: 12)**
   - File: `src/utils/api.ts:156`
   - Fix: Extract to smaller functions
   - Priority: MEDIUM

### 🟢 Low Priority
4. **Missing JSDoc for exported function**
   - File: `src/lib/helpers.ts:23`
   - Fix: Add JSDoc comment
   - Priority: LOW

## Recommendations
1. Fix memory leak immediately
2. Add error boundary to dashboard
3. Refactor complex API function
4. Add JSDoc to public exports
```

---

#### Sub-mode: LINT

```bash
/smite-finalize --mode=qa --type=lint
```

Auto-fix all ESLint, TypeScript, and Prettier violations.

**Process:**

1. **Detect**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm format:check
   ```

2. **Triage**
   - Type Safety violations (CRITICAL)
   - ESLint errors (HIGH)
   - Style violations (MEDIUM)
   - Formatting issues (LOW)

3. **Fix**
   ```bash
   # Auto-fix ESLint
   pnpm lint --fix

   # Format with Prettier
   pnpm format

   # Manual fixes for complex issues
   ```

4. **Verify**
   - Re-run linting
   - Check for new violations
   - Run tests to prevent regressions

**Output Template:**

```
✅ LINTER-SENTINEL: 47 violations fixed
   - 12 type-safety issues
   - 23 ESLint errors
   - 12 formatting issues

📊 Zero-debt achieved: All checks passing
```

---

#### Sub-mode: PERF

```bash
/smite-finalize --mode=qa --type=perf
```

Performance testing and optimization recommendations.

**Test Types:**

**For Next.js:**
- Lighthouse CI (Performance, SEO, Accessibility)
- Bundle size analysis
- Web Vitals (LCP, FID, CLS)
- Database query analysis

**For Rust:**
- Criterion benchmarks
- Flame graphs
- Memory profiling
- CPU profiling

**Lighthouse Targets:**

```javascript
// lighthouse.config.js
module.exports = {
  extends: "lighthouse:default",
  settings: {
    onlyAudits: [
      "first-contentful-paint",
      "largest-contentful-paint",
      "cumulative-layout-shift",
      "total-blocking-time",
      "speed-index",
    ],
  },
  thresholds: {
    performance: 90,
    accessibility: 100,
    "best-practices": 95,
    seo: 95,
  },
};
```

**Output Template:**

```markdown
# PERFORMANCE ANALYSIS

## Lighthouse Scores
- Performance: 92/100 ✅
- Accessibility: 100/100 ✅
- Best Practices: 98/100 ✅
- SEO: 95/100 ✅

## Web Vitals
- LCP: 1.2s ✅ (target: <2.5s)
- FID: 45ms ✅ (target: <100ms)
- CLS: 0.02 ✅ (target: <0.1)

## Bundle Analysis
- Initial JS: 45 KB gzipped ✅
- Total JS: 180 KB gzipped
- CSS: 12 KB gzipped

## Database Queries
- Slow queries: 3 ⚠️
  - `tasks.list`: 450ms (N+1 problem)
  - `users.find`: 120ms (missing index)
  - `audit.logs`: 890ms (full table scan)

## Recommendations
1. Fix N+1 query in tasks.list
2. Add index on users.email
3. Add composite index on audit.logs
```

---

#### Sub-mode: SECURITY

```bash
/smite-finalize --mode=qa --type=security
```

OWASP Top 10 security audit.

**Audit Checklist:**

**OWASP Top 10:**
1. Injection (SQL, NoSQL, OS command)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

**Security Headers:**

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
  },
];
```

**Output Template:**

```markdown
# SECURITY AUDIT

## Overall Score
Security Posture: STRONG ✅

## Findings

### ✅ Passed
- [x] SQL Injection protection
- [x] XSS protection
- [x] CSRF protection
- [x] Authentication secure
- [x] Authorization checks
- [x] Security headers configured

### ⚠️ Warnings
1. **Debug logging in production**
   - File: `src/lib/logger.ts:45`
   - Fix: Remove console.log before deploy
   - Priority: MEDIUM

2. **Missing rate limiting**
   - Endpoint: `/api/auth/login`
   - Fix: Add rate limiter
   - Priority: HIGH

3. **CORS too permissive**
   - Current: `origin: *`
   - Fix: Whitelist specific domains
   - Priority: MEDIUM

## Recommendations
1. Add rate limiting to auth endpoints
2. Restrict CORS to specific origins
3. Set up security scanning in CI
4. Add helmet.js for additional headers
```

---

#### Sub-mode: COVERAGE

```bash
/smite-finalize --mode=qa --type=coverage
```

Coverage gap analysis and recommendations.

**Coverage Targets:**
- **Critical paths**: 95%+ coverage required
- **Business logic**: 90%+ coverage
- **UI components**: 85%+ coverage
- **Utilities**: 95%+ coverage

**Output Template:**

```markdown
# COVERAGE ANALYSIS

## Current Coverage
- Overall: 87%
- Critical: 78% ⚠️
- Business Logic: 91% ✅
- UI: 84% ⚠️

## Gaps Identified

### 🔴 Critical Gaps
1. `src/lib/auth.ts` - 45% coverage
   - Missing: password reset flow
   - Priority: HIGH

2. `src/app/api/stripe/route.ts` - 30% coverage
   - Missing: webhook handling
   - Priority: CRITICAL

### 🟡 Moderate Gaps
3. `src/components/features/tasks/task-form.tsx` - 72% coverage
   - Missing: error states
   - Priority: MEDIUM

## Recommendations
1. Add password reset tests
2. Add Stripe webhook tests
3. Add error boundary tests
```

---

### MODE 3: DOCS ONLY

**Duration:** 10-20 min
**Output:** Updated documentation without QA changes

#### Sub-mode: README

```bash
/smite-finalize --mode=docs --type=readme
```

Update README.md with latest project information.

**Checklist:**
- [ ] Update project description
- [ ] Update installation instructions
- [ ] Update usage examples
- [ ] Add new features
- [ ] Update tech stack
- [ ] Add badges (if applicable)

---

#### Sub-mode: AGENTS

```bash
/smite-finalize --mode=docs --type=agents
```

Update AGENTS.md with discovered patterns and conventions.

**Checklist:**
- [ ] Document discovered patterns
- [ ] Note any gotchas or special requirements
- [ ] Add tech stack conventions
- [ ] Include troubleshooting tips
- [ ] Document project-specific rules

---

#### Sub-mode: API

```bash
/smite-finalize --mode=docs --type=api
```

Generate comprehensive API documentation.

**Checklist:**
- [ ] Generate JSDoc/TSDoc for all public APIs
- [ ] Create API reference documentation
- [ ] Document all endpoints/parameters
- [ ] Add usage examples
- [ ] Document error responses

---

#### Sub-mode: SYNC

```bash
/smite-finalize --mode=docs --type=sync
```

Synchronize all documentation with code changes.

**Process:**

1. **Detect**
   - Scan changed files since last sync
   - Categorize by documentation impact

2. **Analyze**
   - Extract code information
   - Compare with existing docs

3. **Update**
   - Apply JSDoc updates
   - Update README
   - Update API docs
   - Refresh examples

4. **Validate**
   - ✅ All public APIs have JSDoc
   - ✅ All parameters documented
   - ✅ Return types documented
   - ✅ Examples provided

**Output Template:**

```
✅ DOC-MAINTAINER: Documentation synchronized
   - Updated 12 JSDoc comments
   - Added 3 missing examples
   - Updated 2 API docs
   - Refreshed README features section

📊 Documentation coverage: 96% (+4%)
🎯 Zero documentation debt maintained
```

---

## 📝 FINAL REPORT TEMPLATE

After completing finalize, generate this report:

```markdown
# ✅ FINALIZE COMPLETE

**Date:** YYYY-MM-DD HH:mm
**Mode:** [full/qa/docs]
**Status:** ✅ PASSED / ❌ FAILED

---

## Quality Assurance

### Testing
- Unit Tests: ✅ 15/15 passing
- Integration Tests: ✅ 8/8 passing
- E2E Tests: ✅ 5/5 passing
- Coverage: 91% (target: >80%)

### Code Review
- Type Safety: ✅ No `any` types
- Best Practices: ✅ No anti-patterns
- Technical Debt: ✅ Zero TODOs
- Complexity: ✅ All functions < 10

### Linting
- ESLint: ✅ 0 errors
- TypeScript: ✅ 0 errors
- Prettier: ✅ Formatted

### Performance
- Lighthouse: 92/100 ✅
- Bundle Size: 45 KB gzipped ✅
- Web Vitals: All green ✅

---

## Documentation

### Updates
- README: ✅ Updated with new features
- AGENTS.md: ✅ Added 3 new patterns
- API Docs: ✅ Generated for 5 new functions
- JSDoc: ✅ 100% coverage

### Coverage
- Components: 100% ✅
- Functions: 95% ✅
- Types: 95% ✅
- APIs: 92% ✅

---

## Commits

1. `feat: [feature implementation]`
2. `chore: finalize - QA & documentation updates`

---

## Next Steps

- [ ] Ready for PR/merge
- [ ] Consider adding X feature
- [ ] Monitor Y metric

---

✅ _FINALIZE v3.0 - Unified QA & Documentation_
```

---

## ✅ CHECKLIST

**Before finalize:**
- [ ] Development work complete
- [ ] Files saved and committed
- [ ] Tests written (if applicable)

**After finalize:**
- [ ] All QA checks passing
- [ ] Documentation updated
- [ ] Ready for PR/merge
- [ ] No technical debt introduced

---

## 🔗 INTEGRATION

**Triggers:**
- After development completion
- Before git commit
- Before PR creation
- Manual invocation

**Works with:**
- Ralph orchestrator (automatic)
- Builder agent (post-development)
- All development agents

---

**✅ SMITE FINALIZE v3.0**
_"Zero-Debt Finalization - Complete QA & Documentation in One Agent"_
