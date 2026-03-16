# Refactor Skill - Reference Documentation

> **Complete reference** for the Refactor skill. See @SKILL.md for quick start.

---

## Best Practices (Detailed)

### 1. Validate Before Refactoring

**Always ensure tests exist and pass:**
- Run existing tests first
- Add tests for uncovered code
- Fix failing tests before refactoring
- Use tests as safety net

### 2. Make Incremental Changes

**Small, reviewable commits:**
- One logical change per commit
- Test after each change
- Commit working state frequently
- Enable easy rollback if needed

### 3. Measure Before and After

**Objective improvement metrics:**
- Baseline metrics before starting
- Target metrics defined
- Post-refactor measurement
- Documented comparison

### 4. Focus on High-Value Areas

**Prioritize by impact:**
- High complexity first
- High duplication areas
- Critical paths
- Frequently used code

### 5. Separate Concerns

**One type of refactor at a time:**
- Logic refactors separate from style
- Type improvements separate from logic
- Performance separate from security
- Each commit has single purpose

### 6. Use Appropriate Mode

**Match mode to task:**
```bash
--quick     # Low-risk, auto-fix items
--full      # Complete workflow with validation
--analyze   # Analysis and reporting only
--profile   # Performance optimization
--security  # Security vulnerability scan
--types     # Type safety improvement
```

### 7. Leverage Agent Teams

**Use --team for complex refactors:**
- Large scope (>=5 files)
- Multiple domains (perf + security + types)
- High complexity detected
- Cross-cutting concerns

### 8. Document Thoroughly

**Explain what and why:**
- Problem statement
- Solution approach
- Rationale for changes
- Metrics achieved

---

## Mode Details

### --quick (Quick Mode)

**Purpose:** Auto-fix low-risk items

**Criteria:**
- Risk score < 30
- Complexity < 8
- Test coverage > 80%

**Workflow:**
1. Identify low-risk items
2. Apply refactoring patterns
3. Test after each change
4. Commit safe changes

**Output:** Applied changes (no analyze/review)

---

### --full (Full Mode - Default)

**Purpose:** Complete refactoring workflow

**Workflow:**
1. ANALYZE - Detect issues
2. REVIEW - Classify and prioritize
3. RESOLVE - Apply changes
4. VERIFY - Validate results

**Output:** Complete documentation

---

### --analyze (Analysis Only)

**Purpose:** Detect and catalog issues

**Steps:**
1. Complexity analysis (cyclomatic, cognitive, nesting)
2. Duplication detection
3. Code smell identification
4. Maintainability assessment
5. Technical debt scoring

**Output:** `.claude/.smite/studio refactor-analysis.md`

---

### --review (Review and Prioritize)

**Purpose:** Create action plan

**Steps:**
1. Classify by severity (P1-P4)
2. Assess business impact
3. Estimate effort and risk
4. Identify quick wins
5. Create timeline

**Output:** `.claude/.smite/studio refactor-review.md`

---

### --resolve (Resolve Specific Items)

**Purpose:** Apply validated refactoring

**Steps:**
1. Load item from review
2. Apply proven patterns
3. Make incremental changes
4. Test continuously
5. Document changes
6. Commit logically

**Output:** `.claude/.smite/studio refactor-resolution-[ID].md`

---

### --verify (Verify Results)

**Purpose:** Comprehensive verification

**Steps:**
1. All tests passing
2. No type errors
3. Metrics improved
4. No regressions
5. Deployment ready

**Output:** `.claude/.smite/studio refactor-verification.md`

---

## Specialized Modes

### --profile (Performance Profiling Mode)

**Purpose:** Identify and fix performance bottlenecks

**When to Use:**
- Functions are slow
- Memory usage is high
- Need optimization metrics

**Workflow:**
```
ANALYZE (performance, 15 min)
  - Identify slow functions
  - Measure execution time
  - Check memory usage
  - Find N+1 queries
  - Profile hot paths
  - Output: profile.md with metrics

OPTIMIZE (systematic, 30-45 min)
  1. Quick wins:
     - Cache repeated computations
     - Remove unnecessary loops
     - Optimize database queries
     - Add pagination

  2. Medium effort:
     - Lazy loading
     - Code splitting
     - Memoization
     - Debouncing/throttling

  3. Complex (if needed):
     - Algorithm optimization
     - Data structure changes
     - Parallel processing

MEASURE (before/after)
  - Benchmark before
  - Apply changes
  - Benchmark after
  - Verify improvement
  - Output: comparison.md
```

**Example:**
```bash
# Profile recent changes
/studio refactor --profile --scope=recent

# Profile specific file
/studio refactor --profile --scope=file:src/services/user.ts

# Full codebase profiling
/studio refactor --profile --scope=all
```

**Metrics Collected:**
- Execution time (ms)
- Memory usage (MB)
- Database query count
- Network requests
- Bundle size (if applicable)

**Success Criteria:**
- Measurable performance improvement (>= 20%)
- No functionality broken
- Tests passing
- Before/after metrics documented

---

### --security (Security Scanning Mode)

**Purpose:** Detect and fix security vulnerabilities

**When to Use:**
- Security audit required
- OWASP compliance
- Production deployment prep
- Handling sensitive data

**Workflow:**
```
SCAN (security analysis, 20 min)
  - OWASP Top 10 vulnerabilities
  - Injection attacks (SQL, NoSQL, OS, LDAP)
  - XSS vulnerabilities
  - CSRF protection
  - Authentication/Authorization issues
  - Sensitive data exposure
  - Cryptographic issues
  - Dependency vulnerabilities
  - Output: security-scan.md

CLASSIFY (severity, 10 min)
  P0 - Critical (immediate fix required)
    - Remote code execution
    - SQL injection
    - Authentication bypass

  P1 - High (fix ASAP)
    - XSS attacks
    - Sensitive data exposure
    - Broken authentication

  P2 - Medium (fix soon)
    - CSRF missing
    - Weak cryptography
    - Dependency vulnerabilities

  P3 - Low (fix when possible)
    - Information disclosure
    - Missing headers

FIX (prioritized, 30-60 min)
  1. Fix P0 critical vulnerabilities
  2. Fix P1 high vulnerabilities
  3. Add security tests
  4. Document security measures
  - Output: security-fix.md

VERIFY (validate)
  - Re-run security scan
  - Verify all P0/P1 fixed
  - Add regression tests
  - Security tests passing
  - Output: security-verification.md
```

**Example:**
```bash
# Security scan on recent changes
/studio refactor --security --scope=recent

# Full security audit
/studio refactor --security --scope=all

# Security scan specific directory
/studio refactor --security --scope=directory:src/auth
```

**OWASP Top 10 Checked:**
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

**Success Criteria:**
- All P0/P1 vulnerabilities fixed
- Security tests added
- No new vulnerabilities introduced
- Documentation updated

---

### --types (TypeScript Improvement Mode)

**Purpose:** Improve type safety and eliminate `any`

**When to Use:**
- TypeScript code with poor types
- `any` types scattered
- Missing type definitions
- Type errors

**Workflow:**
```
ANALYZE (type health, 15 min)
  - Count `any` usage
  - Find type assertions (`as`)
  - Missing type annotations
  - Implicit any types
  - Type coverage %
  - Output: type-analysis.md

PRIORITIZE (by severity, 5 min)
  P0 - Explicit `any` in critical paths
  P1 - Type assertions without validation
  P2 - Missing type annotations
  P3 - Implicit any in safe contexts

FIX (systematic, 30-45 min)
  1. Replace `any` with proper types:
     - Create interfaces/types
     - Use generics
     - Add Zod validation at boundaries
     - Use utility types (Partial, Required, etc.)

  2. Remove unsafe casts:
     - Add type guards
     - Use Zod schemas
     - Add validation functions

  3. Improve type coverage:
     - Add return types
     - Type all parameters
     - Remove `@ts-ignore`
     - Fix `@ts-expect-error`

VERIFY (typescript strict, 10 min)
  - Run `tsc --noAny --strict`
  - All type errors resolved
  - Type coverage >= 95%
  - Zero `any` in production code
  - Output: type-verification.md
```

**Example:**
```bash
# Type improvement on recent changes
/studio refactor --types --scope=recent

# Type safety for entire project
/studio refactor --types --scope=all

# Fix types in specific module
/studio refactor --types --scope=directory:src/features/auth
```

**Type Improvements:**
- Replace `any` with proper types
- Add Zod validation at boundaries
- Create utility types
- Remove type assertions
- Add type guards
- Enable strict mode

**Success Criteria:**
- Zero `any` in production code
- Type coverage >= 95%
- `tsc --strict` passing
- No type assertions without validation
- Zod schemas at boundaries

---

## Auto-Team System

**Agent teams activate automatically for complex refactors.**

### Activation Criteria

| Criterion | Threshold | Team Size |
|-----------|-----------|-----------|
| Files to analyze | >= 5 | 2 agents |
| Modes | analyze/full/profile/security/types | 2-3 agents |
| Complexity detected | High | 2-3 agents |

### Disabling Teams

```bash
/studio refactor --full --no-team
/studio refactor --analyze --no-team
```

### Team Composition by Mode

| Mode | Team Composition | Responsibilities |
|------|-----------------|-------------------|
| `--full --team` | Analyzer + Reviewer + Resolver | Parallel analysis, review, resolution |
| `--analyze --team` | CodeSmellExpert + ComplexityExpert + SecurityExpert | Multi-angle analysis |
| `--profile --team` | CPUProfiler + MemoryProfiler + NetworkProfiler | Comprehensive profiling |
| `--security --team` | OWASPSpecialist + DependencyAuditor + ConfigReviewer | Full security audit |
| `--types --team` | AnyRemover + AssertionExpert + CoverageSpecialist | Complete type safety |

---

## Common Patterns

### Extract Method

Reduce complexity by extracting methods.

**Before:**
```typescript
function processUserData(user: User) {
  if (!user) return null;
  const cleaned = user.name.trim().toLowerCase();
  const email = user.email.trim().toLowerCase();
  const normalized = email.replace(/@.*/, "");
  return { name: cleaned, email, normalized };
}
```

**After:**
```typescript
function processUserData(user: User) {
  if (!user) return null;
  return {
    name: cleanName(user.name),
    email: cleanEmail(user.email),
    normalized: normalizeEmail(user.email)
  };
}

function cleanName(name: string): string {
  return name.trim().toLowerCase();
}

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.replace(/@.*/, "");
}
```

### Introduce Parameter Object

Simplify signatures by grouping parameters.

**Before:**
```typescript
function createUser(
  name: string,
  email: string,
  password: string,
  age: number,
  address: string,
  phone: string
) { ... }
```

**After:**
```typescript
interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  age: number;
  address: string;
  phone: string;
}

function createUser(params: CreateUserParams) { ... }
```

### Replace Magic Numbers

Improve clarity.

**Before:**
```typescript
if (user.level > 5) {
  user.discount = 0.15;
}
```

**After:**
```typescript
const MIN_LEVEL_FOR_DISCOUNT = 5;
const DEFAULT_DISCOUNT = 0.15;

if (user.level > MIN_LEVEL_FOR_DISCOUNT) {
  user.discount = DEFAULT_DISCOUNT;
}
```

---

## Configuration

Default config in `.claude/.smite/studio refactor.json`:

```json
{
  "defaults": {
    "scope": "recent",
    "riskThreshold": 30,
    "complexityThreshold": 8,
    "coverageTarget": 80,
    "autoCommit": true
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    ".claude/**"
  ],
  "patterns": {
    "enabled": [
      "extract-method",
      "extract-class",
      "introduce-param-object",
      "replace-magic-numbers",
      "decompose-conditional"
    ]
  },
  "security": {
    "owaspTop10": true,
    "dependencyCheck": true,
    "p0Threshold": "critical",
    "p1Threshold": "high"
  },
  "types": {
    "strictMode": true,
    "allowAny": false,
    "coverageTarget": 95
  },
  "performance": {
    "improvementTarget": 20,
    "measureBefore": true,
    "measureAfter": true
  }
}
```

---

## Examples

```bash
# Quick refactor
/studio refactor --quick

# Full workflow with performance profiling
/studio refactor --full --profile

# Security audit
/studio refactor --security --scope=all

# Type safety improvement
/studio refactor --types --scope=directory:src/features

# Comprehensive refactor (all modes with team)
/studio refactor --full --security --types --profile --team

# Bug-specific refactor
/studio refactor --scope=bug "TypeError in auth"

# Team-based performance + security
/studio refactor --profile --security --team
```

---

## Integration

**Works with:**
- toolkit (semantic search, bug detection, dependency graph)

**Used by:**
- ralph (refactor workflow)
- builder (after implementation)

**Compatible with:**
- All SMITE agents

---

*Refactor Skill Reference v2.1.0*
