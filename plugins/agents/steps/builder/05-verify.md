# Step 5: Verify

**Flag**: `-v` or `--verify`

## Purpose

Run comprehensive verification including linting, type checking, all tests, and smoke tests to ensure the implementation is production-ready.

## What To Do

### 1. Load Test Configuration

Check `package.json` (or equivalent) for available scripts:

**Next.js:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "build": "next build"
  }
}
```

**Rust:**
```toml
# Cargo.toml
[dependencies]
# ...

[dev-dependencies]
# ...
```

**Python:**
```toml
# pyproject.toml
[tool.poetry.scripts]
lint = "flake8 src"
typecheck = "mypy src"
test = "pytest"
```

### 2. Verification Steps

Run verification in this order:

```
Linting → Type Checking → Tests → Build → Smoke Tests
```

### 3. Linting

Check code quality and style.

**Next.js/ESLint:**
```bash
npm run lint
```

**Rust/Clippy:**
```bash
cargo clippy -- -D warnings
```

**Python:**
```bash
flake8 src/
black --check src/
isort --check-only src/
```

**Go:**
```bash
go fmt ./...
go vet ./...
golangci-lint run
```

#### Fix Linting Issues

If linting fails:
1. **Auto-fix** if available: `npm run lint:fix`
2. **Fix manually** for auto-fixable issues
3. **Disable rules** only if absolutely necessary (add comment explaining why)

**Example disabling ESLint rule:**
```typescript
// eslint-disable-next-line no-magic-numbers
const timeout = 5000; // Default timeout in milliseconds
```

### 4. Type Checking

Verify type safety.

**Next.js/TypeScript:**
```bash
npm run typecheck
```

**Python:**
```bash
mypy src/ --strict
```

**Rust/Go:**
Type checking is built into compilation, so `cargo check` or `go build` handles this.

#### Fix Type Errors

If type checking fails:
1. **Add proper types** - Don't use `any`
2. **Fix type mismatches** - Ensure types align
3. **Add null checks** - Handle optional values
4. **Use type assertions** - Only when absolutely necessary

**Common fixes:**
```typescript
// ❌ BAD - Using any
function process(data: any) { }

// ✅ GOOD - Proper type
function process(data: DataType) { }

// ❌ BAD - Potential null access
const value = data.field.value;

// ✅ GOOD - Optional chaining
const value = data.field?.value;
```

### 5. Run All Tests

Execute the full test suite.

**Next.js/Vitest:**
```bash
npm run test
npm run test:coverage
```

**Rust:**
```bash
cargo test
```

**Python:**
```bash
pytest
pytest --cov
```

**Go:**
```bash
go test ./...
go test -cover ./...
```

#### Verify Coverage

Ensure coverage targets are met:

- **Unit test coverage**: 80%+
- **Branch coverage**: 70%+
- **Critical paths**: 100%

If coverage is low:
1. **Identify uncovered lines** from coverage report
2. **Add tests** for uncovered paths
3. **Re-run** to verify improvement

### 6. Build Verification

Build the project to ensure production-ready.

**Next.js:**
```bash
npm run build
```

**Rust:**
```bash
cargo build --release
```

**Python:**
```bash
poetry build
# or
python -m build
```

**Go:**
```bash
go build -o bin/app ./cmd/app
```

#### Fix Build Errors

If build fails:
1. **Check import paths** - All imports must resolve
2. **Check dependencies** - All deps must be installed
3. **Check environment** - All env vars must be defined
4. **Check bundle size** - No excessive bundles

### 7. Smoke Tests

Run quick manual/smoke tests to verify basic functionality.

#### Smoke Test Checklist

- [ ] **Application starts** without errors
- [ ] **Key features work** (manual testing)
- [ ] **API endpoints respond** (test with curl/Postman)
- [ ] **Database operations succeed** (CRUD works)
- [ ] **UI renders correctly** (no console errors)
- [ ] **Performance acceptable** (no obvious slowdowns)

#### Example Smoke Tests

**Next.js:**
```bash
# Start dev server
npm run dev

# In another terminal, test endpoints
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/data -d '{"field1":"test","field2":42}'
```

**Rust:**
```bash
# Run binary
cargo run

# Test basic functionality
echo "test input" | ./bin/app
```

**Python:**
```bash
# Run server
python -m uvicorn main:app

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/data
```

### 8. Verification Checklist

#### Code Quality
- [ ] Linting passes (no errors)
- [ ] Type checking passes (no errors)
- [ ] Code formatted correctly
- [ ] No console warnings

#### Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage targets met
- [ ] No flaky tests

#### Build
- [ ] Build succeeds without errors
- [ ] No missing dependencies
- [ ] Bundle size reasonable
- [ ] No build warnings

#### Functionality
- [ ] Application starts
- [ ] Key features work
- [ ] API endpoints respond
- [ ] UI renders correctly
- [ ] No runtime errors

### 9. Verification Report

Create a verification report:

```markdown
# Verification Report: [Feature Name]

**Date**: [Timestamp]
**Tech Stack**: [Next.js/Rust/Python/Go]

## Linting ✅

**Tool**: [ESLint/Clippy/flake8/golangci-lint]
**Result**: PASSED
**Issues Found**: [N]
**Issues Fixed**: [N]

## Type Checking ✅

**Tool**: [TypeScript/mypy/cargo check]
**Result**: PASSED
**Errors**: [N]

## Tests ✅

**Tool**: [Vitest/cargo test/pytest/go test]
**Result**: PASSED

### Test Results
- Total tests: [N]
- Passed: [N]
- Failed: [N]
- Skipped: [N]

### Coverage
- Line coverage: [X]%
- Branch coverage: [X]%
- Function coverage: [X]%

## Build ✅

**Result**: PASSED
**Build time**: [X]s
**Bundle size**: [X] MB
**Warnings**: [N]

## Smoke Tests ✅

- [x] Application starts
- [x] Key features work
- [x] API endpoints respond
- [x] UI renders correctly
- [x] No runtime errors

## Issues Found

### Critical (Must Fix)
None ✅

### Warning (Should Fix)
1. [Warning description] - [File:Line]

### Info (Nice to Have)
1. [Info description] - [File:Line]

## Verification Status

**Overall**: ✅ PASSED

**Ready for**: [Production/Review/Further Testing]

## Notes

[Any additional notes about the verification process]
```

Save to: `.claude/.smite/builder-verification.md`

## Output

- ✅ Linting passed
- ✅ Type checking passed
- ✅ All tests passing
- ✅ Build successful
- ✅ Smoke tests passed
- ✅ Verification report created
- ✅ Implementation production-ready

## MCP Tools Used

- ✅ **Lint** - Code quality checks
- ✅ **Type Checker** - Type safety verification
- ✅ **Test Runner** - Execute all tests
- ✅ **Coverage Tool** - Generate coverage reports

## Next Steps

**Implementation Complete!** 🎉

- Ready for code review
- Ready for merge to main branch
- Ready for deployment

**Optional:**
- Run `/refactor` to optimize code
- Run `/finalize` for comprehensive QA (if available)

## ⚠️ Critical Rules

1. **All checks must pass** - Don't proceed with failures
2. **Fix issues, don't ignore** - Address all problems
3. **Document exceptions** - Explain why rules were disabled
4. **Verify manually** - Smoke tests are critical
5. **Be honest** - Report all issues found
