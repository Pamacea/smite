# Step 4: Test

**Flag**: `-t` or `--test`

## Purpose

Write comprehensive tests covering unit tests, integration tests, and edge cases to ensure the implementation works correctly.

## What To Do

### 1. Load Design Document

Read `.claude/.smite/builder-design.md` to understand:
- Testing strategy
- Test cases to cover
- Coverage targets

### 2. Check Test Framework

Identify the test framework from the codebase:

**Next.js**: Vitest or Jest
**Rust**: cargo test (built-in)
**Python**: pytest
**Go**: go test (built-in)

### 3. Test Structure

Follow the testing structure:

```
__tests__/                          # Next.js/Vitest
├── unit/
│   ├── [feature].test.ts
│   └── [service].test.ts
├── integration/
│   └── [feature].test.ts
└── e2e/
    └── [feature].test.ts

tests/                              # Rust
├── [feature]_test.rs
└── integration/

tests/                              # Python
├── test_[feature].py
└── test_integration.py
```

### 4. Writing Tests

#### A. Unit Tests

Test individual functions and components in isolation.

**Next.js/Vitest Example:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { processInput, updateState } from '@/core/feature';

describe('processInput', () => {
  it('should process valid input correctly', () => {
    const input = {
      field1: 'test',
      field2: 42,
    };

    const result = processInput(input);

    expect(result).toHaveProperty('id');
    expect(result.field1).toBe('test');
    expect(result.field2).toBe(42);
  });

  it('should handle edge case 1', () => {
    // Test edge case
  });

  it('should throw on invalid input', () => {
    expect(() => {
      processInput({ invalid: 'data' });
    }).toThrow();
  });
});
```

**Rust Example:**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_input() {
        let input = Input {
            field1: String::from("test"),
            field2: 42,
        };

        let result = process_input(input);

        assert!(result.id.len() > 0);
        assert_eq!(result.field1, "test");
        assert_eq!(result.field2, 42);
    }

    #[test]
    fn test_edge_case() {
        // Test edge case
    }
}
```

**Python Example:**

```python
import pytest
from feature import process_input

def test_process_input():
    input = {
        "field1": "test",
        "field2": 42,
    }

    result = process_input(input)

    assert result.id is not None
    assert result.field1 == "test"
    assert result.field2 == 42

def test_edge_case():
    # Test edge case
    pass

def test_invalid_input():
    with pytest.raises(ValidationError):
        process_input({"invalid": "data"})
```

#### B. Integration Tests

Test multiple components working together.

**Next.js/Vitest Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { fetchData, createData } from '@/services/dataService';

describe('Data Service Integration', () => {
  it('should create and fetch data', async () => {
    const input = {
      field1: 'test',
      field2: 42,
    };

    const created = await createData(input);
    const fetched = await fetchData(created.id);

    expect(fetched).toEqual(created);
  });

  it('should handle concurrent operations', async () => {
    // Test concurrent requests
  });
});
```

#### C. Component Tests

Test React components with user interactions.

**Next.js + Testing Library Example:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const onAction = vi.fn();
    render(<ComponentName onAction={onAction} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<ComponentName loading />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ComponentName error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
```

#### D. API Route Tests

Test API endpoints and error handling.

**Next.js Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/data/route';
import { request } from 'node:http';

describe('/api/data', () => {
  it('should create data', async () => {
    const request = new Request('http://localhost:3000/api/data', {
      method: 'POST',
      body: JSON.stringify({ field1: 'test', field2: 42 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
  });

  it('should validate input', async () => {
    const request = new Request('http://localhost:3000/api/data', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should handle errors', async () => {
    // Test error handling
  });
});
```

### 5. Test Coverage

Ensure comprehensive coverage:

#### Coverage Targets

- **Unit tests**: 80%+ coverage
- **Branch coverage**: 70%+ coverage
- **Critical paths**: 100% coverage

#### What to Test

✅ **Happy path**: Normal operation
✅ **Edge cases**: Boundary values
✅ **Error cases**: Invalid input, failures
✅ **Async operations**: Promises, timeouts
✅ **User interactions**: Clicks, form submissions
✅ **State changes**: Updates, side effects

#### What NOT to Test

❌ External libraries (they have their own tests)
❌ Framework internals (React, Next.js, etc.)
❌ Trivial getters/setters
❌ Auto-generated code

### 6. Mocking & Fixtures

#### Mocking External Dependencies

```typescript
// Vitest
import { vi } from 'vitest';

vi.mock('@/services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mock' })),
}));
```

```python
# Python pytest
from unittest.mock import patch

@patch('feature.api_call')
def test_with_mock(mock_api):
    mock_api.return_value = {'data': 'mock'}
    # Test implementation
```

#### Test Fixtures

```typescript
// fixtures.ts
export const mockInput = {
  field1: 'test',
  field2: 42,
};

export const mockOutput = {
  id: '123',
  ...mockInput,
};
```

### 7. Running Tests

**Next.js/Vitest:**
```bash
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:coverage     # With coverage report
npm run test:watch        # Watch mode
```

**Rust:**
```bash
cargo test                # All tests
cargo test -- --nocapture # Show print output
cargo test --features "test" # With features
```

**Python:**
```bash
pytest                    # All tests
pytest -v                 # Verbose output
pytest --cov             # With coverage
pytest -k "test_name"    # Specific test
```

**Go:**
```bash
go test ./...             # All tests
go test -v ./...          # Verbose output
go test -cover ./...      # With coverage
```

### 8. Test Checklist

#### Unit Tests
- [ ] All public functions tested
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Validation tested
- [ ] Coverage target met

#### Integration Tests
- [ ] Component interactions tested
- [ ] API integration tested
- [ ] Database operations tested
- [ ] Async operations tested

#### Component Tests
- [ ] Rendering tested
- [ ] User interactions tested
- [ ] State changes tested
- [ ] Loading/error states tested

## Output

- ✅ Unit tests written
- ✅ Integration tests written
- ✅ Component tests written
- ✅ Coverage targets met
- ✅ All tests passing
- ✅ Ready for verification phase

## MCP Tools Used

- ✅ **Test Coverage** - Generate coverage reports
- ✅ **Dependency Graph** - Ensure all paths tested

## Next Step

Proceed to `05-verify.md` (use `-v` flag) to run final verification

## ⚠️ Critical Rules

1. **Test first or test with** - Either TDD or test immediately after implementation
2. **Cover critical paths** - 100% coverage for important logic
3. **Test edge cases** - Don't just test happy path
4. **Mock external deps** - Don't test external libraries
5. **All tests must pass** - Don't proceed with failing tests
