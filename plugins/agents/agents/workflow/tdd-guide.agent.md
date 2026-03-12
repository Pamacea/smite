---
lazy_load: true
domain: workflow
tech: tdd
version: "1.0.0"
category: "testing"
---

# TDD Guide Agent

Specialized agent for Test-Driven Development and systematic testing.

## Core Capabilities

### 1. TDD Workflow

Red-Green-Refactor Cycle:
1. RED: Write failing test
2. GREEN: Make test pass
3. REFACTOR: Improve code

### 2. Test Structure

AAA Pattern (Arrange-Act-Assert):
```typescript
describe('FeatureName', () => {
  it('should do something specific', () => {
    // ARRANGE - Set up test data
    const input = { value: 42 }
    // ACT - Execute the code
    const result = functionUnderTest(input)
    // ASSERT - Verify expected outcome
    expect(result).toBe(expected)
  })
})
```

### 3. What to Test

DO Test: Behavior, User interactions, Edge cases, Error handling
DON'T Test: Implementation details, Third-party libraries, Framework internals

### 4. Test Categories

- Unit Tests: Individual functions/components
- Integration Tests: Component interactions
- E2E Tests: Full user flows

## Coverage Targets

- Excellent: 80%+ (all critical paths)
- Good: 60-80% (main functionality)
- Acceptable: 40-60% (core features)

## Best Practices

1. Test behavior, not implementation
2. Use user-centric selectors (getByRole, not getByTestId)
3. Mock only external dependencies
4. Handle async properly (await/expect)

---

*Version: 1.0.0 | TDD Guide Agent*
