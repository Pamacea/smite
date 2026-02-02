# Step 3: Implement

**Flag**: `-i` or `--implement`

## Purpose

Write production code following the design document and spec, using the patterns discovered during exploration.

## What To Do

### 1. Load Design Document

Read `.claude/.smite/builder-design.md` to understand:
- File structure
- Types and interfaces
- Implementation plan
- Testing strategy

### 2. Load Spec (If Available)

If `.claude/.smite/current_spec.md` exists:
- **Follow spec EXACTLY**
- Implement steps in order defined in spec
- **DO NOT deviate** - If spec is incomplete, stop and request update

### 3. Implementation Order

Follow this sequence:

```
Types & Validation → Core Logic → Components/UI → Data Layer → Tests
```

### 4. Tech-Specific Implementation

Launch the appropriate subagent based on tech stack:

**Next.js** → Launch `impl-nextjs` subagent
**Rust** → Launch `impl-rust` subagent
**Python** → Launch `impl-python` subagent
**Go** → Launch `impl-go` subagent

## Implementation Guidelines

### A. Types & Validation Layer

**File**: `src/validation/[schemaName].ts`

```typescript
import { z } from 'zod';

// Input validation
export const CreateInputSchema = z.object({
  field1: z.string().min(1, "Required"),
  field2: z.number().positive(),
});

export type CreateInput = z.infer<typeof CreateInputSchema>;

// Output types
export interface OutputData {
  id: string;
  field1: string;
  field2: number;
}
```

### B. Core Logic Layer

**File**: `src/core/[featureName].ts` or equivalent

```typescript
// Pure functions
export function processInput(input: CreateInput): OutputData {
  // Business logic
  return {
    id: generateId(),
    field1: input.field1,
    field2: input.field2,
  };
}

// Immutable operations
export function updateState(
  state: State,
  action: Action
): State {
  return {
    ...state,
    // Updated fields
  };
}
```

### C. Service Layer

**File**: `src/services/[serviceName].ts`

```typescript
// API calls and side effects
export async function fetchData(id: string): Promise<Data> {
  const response = await fetch(`/api/data/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
}

// Database operations (if applicable)
export async function createData(input: CreateInput): Promise<OutputData> {
  const data = await prisma.data.create({
    data: input,
  });
  return data;
}
```

### D. Component Layer

**File**: `src/components/[ComponentName].tsx`

```typescript
import { useState } from 'react';
import { CreateInputSchema, type CreateInput } from '@/validation';

interface Props {
  onAction?: (data: OutputData) => void;
}

export function ComponentName({ onAction }: Props) {
  const [state, setState] = useState(initialState);

  const handleClick = () => {
    // Event handler
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### E. Barrel Exports

**File**: `src/index.ts` or `src/components/index.ts`

```typescript
// Re-exports for clean imports
export { ComponentName } from './ComponentName';
export { fetchData } from './services/dataService';
export { CreateInputSchema } from '@/validation';
```

## Tech Stack Patterns

### Next.js Implementation

**Key Patterns:**
- React Server Components (RSC) by default
- Server Actions for mutations
- Prisma for database
- TanStack Query for server state
- Shadcn UI for components

**Example Structure:**
```
src/
├── app/
│   ├── [route]/page.tsx           # Server Component
│   └── api/[route]/route.ts       # API Route
├── components/
│   └── ui/                        # Shadcn components
├── lib/
│   └── utils.ts                   # Utilities
├── services/
│   └── [service].ts               # Business logic
└── validation/
    └── [schema].ts                # Zod schemas
```

### Rust Implementation

**Key Patterns:**
- Ownership and borrowing
- Async/await with tokio
- Error handling with Result<T, E>
- Zero-copy parsing where possible
- Derive macros for serialization

**Example Structure:**
```
src/
├── models/
│   └── [model].rs                 # Data structures
├── services/
│   └── [service].rs               # Business logic
├── handlers/
│   └── [handler].rs               # HTTP handlers
├── repositories/
│   └── [repo].rs                  # Database operations
└── error.rs                       # Error types
```

### Python Implementation

**Key Patterns:**
- Type hints everywhere
- Pydantic for validation
- FastAPI for REST API
- SQLAlchemy 2.0 for database
- Async/await for I/O

**Example Structure:**
```
src/
├── models/
│   └── [model].py                 # Pydantic models
├── services/
│   └── [service].py               # Business logic
├── repositories/
│   └── [repo].py                  # Database operations
├── api/
│   └── [router].py                # FastAPI routes
└── main.py                        # Application entry
```

### Go Implementation

**Key Patterns:**
- Interfaces for abstraction
- Goroutines for concurrency
- Context propagation
- Standard library preference
- Error handling with explicit checks

**Example Structure:**
```
src/
├── models/
│   └── [model].go                 # Data structures
├── services/
│   └── [service].go               # Business logic
├── handlers/
│   └── [handler].go               # HTTP handlers
├── repository/
│   └── [repo].go                  # Database operations
└── main.go                        # Application entry
```

## Code Quality Standards

### 1. Clean Code

- **DRY**: Extract duplication after 2x occurrences
- **Pure functions**: Isolate side effects
- **Immutable**: Prefer const over let
- **Naming**: Self-documenting names

### 2. Type Safety

- **No `any` types**: Use proper types
- **Strict mode**: Enable strict TypeScript
- **Zod validation**: Parse at boundaries
- **Null checks**: Explicit handling

### 3. Error Handling

```typescript
// Pattern matching style
Result.match(data, {
  Ok: (value) => { /* handle success */ },
  Err: (error) => { /* handle error */ },
});

// Or try/catch with proper typing
try {
  const result = await operation();
  return Ok(result);
} catch (error) {
  return Err(error);
}
```

## Spec-Lock Policy

**CRITICAL**: If implementing from spec:

1. **Read spec completely** before writing code
2. **Follow steps EXACTLY** in order
3. **DO NOT deviate** from spec
4. **Stop on logic gaps**:
   - STOP coding immediately
   - Report the gap clearly
   - Wait for spec to be updated
   - Only resume after spec is corrected

## Implementation Checklist

### Files to Create
- [ ] Types/interfaces
- [ ] Validation schemas
- [ ] Core logic
- [ ] Services
- [ ] Components/UI
- [ ] API routes (if applicable)
- [ ] Barrel exports

### Code Quality
- [ ] No `any` types
- [ ] No magic numbers
- [ ] Proper error handling
- [ ] Input validation
- [ ] Type checking passes

### Documentation
- [ ] JSDoc/TSDoc for public APIs
- [ ] Inline comments for complex logic
- [ ] README for complex features

## Output

- ✅ Complete implementation
- ✅ All files created
- ✅ Types defined
- ✅ Validation in place
- ✅ Barrel exports configured
- ✅ Ready for testing phase

## MCP Tools Used

- ✅ **Toolkit Context Build** - For large codebases (70-85% savings)
- ✅ **Semantic Search** - Find patterns during implementation
- ✅ **Impact Analysis** - Understand changes

## Next Step

Proceed to `04-test.md` (use `-t` flag) to write comprehensive tests

## ⚠️ Critical Rules

1. **Follow the design** - Implement exactly what was designed
2. **Spec-lock active** - If spec exists, follow it exactly
3. **Tech patterns** - Use framework-specific best practices
4. **Type-safe** - No any types, proper validation
5. **Clean code** - DRY, immutable, pure functions
