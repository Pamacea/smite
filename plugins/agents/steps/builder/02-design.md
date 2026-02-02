# Step 2: Design Structure

**Flag**: `-d` or `--design`

## Purpose

Design the implementation structure, define types/interfaces, create schemas, and plan the architecture before writing code.

## What To Do

### 1. Load Exploration Context

Read `.claude/.smite/builder-exploration.md` to understand:
- Existing patterns
- Codebase conventions
- Available utilities
- Dependencies

### 2. Load Spec (If Available)

If `.claude/.smite/current_spec.md` exists:
- Read the Architect's specification
- Understand requirements
- Follow the structure defined in spec
- **DO NOT deviate from spec**

### 3. Design Structure

Define the complete file structure:

```markdown
# Implementation Design: [Feature Name]

**Date**: [Timestamp]
**Tech Stack**: [Next.js/Rust/Python/Go]

## File Structure

```
src/
├── components/
│   └── [ComponentName].tsx       # Main component
├── lib/
│   └── [utilName].ts             # Utility functions
├── services/
│   └── [serviceName].ts          # API/business logic
├── validation/
│   └── [schemaName].ts           # Zod schemas
├── types/
│   └── [featureName].types.ts    # TypeScript types
└── index.ts                      # Barrel export
```

## Types & Interfaces

### TypeScript Types (or Rust Structs, Python Dataclasses)

```typescript
// Input types
interface [InputType] {
  field1: string;
  field2: number;
  field3: Option<number>;
}

// Output types
interface [OutputType] {
  id: string;
  result: boolean;
}

// Domain types
interface [DomainType] {
  // Domain-specific fields
}
```

### Validation Schemas (Zod)

```typescript
import { z } from 'zod';

export const [SchemaName]Schema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
  field3: z.number().optional(),
});

export type [SchemaName] = z.infer<typeof [SchemaName]Schema>;
```

### Database Models (if applicable)

```prisma
// Prisma schema
model [ModelName] {
  id        String   @id @default(cuid())
  field1    String
  field2    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Component Interface

### Props (for React Components)

```typescript
interface [ComponentName]Props {
  // Required props
  requiredProp: string;

  // Optional props
  optionalProp?: number;

  // Callback props
  onAction?: (data: DataType) => void;

  // Children
  children?: React.ReactNode;
}
```

### Service Interface

```typescript
interface [ServiceName] {
  // Methods
  method1(param: Type): Promise<Result>;
  method2(param: Type): Result;
}
```

## Data Flow

```
[User Input]
    ↓
[Validation Layer] → Zod schemas validate input
    ↓
[Service Layer] → Business logic
    ↓
[Data Layer] → Database/API calls
    ↓
[Response] → Formatted output
```

## Error Handling Strategy

```typescript
// Error types
class [FeatureName]Error extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
  }
}

// Error handling pattern
try {
  // Operation
} catch (error) {
  if (error instanceof [SpecificError]) {
    // Handle specific error
  } else {
    // Handle generic error
  }
}
```

## State Management

### Client State (if needed)
- **Library**: [Zustand/Context/etc]
- **Store Location**: `src/store/[featureName]Store.ts`
- **Actions**: [List actions]

### Server State (if needed)
- **Library**: [TanStack Query/SWR/etc]
- **Hooks**: [List custom hooks]
- **Cache Keys**: [Define cache key pattern]

## API Endpoints (if applicable)

### Routes

```typescript
// Next.js App Router
// app/api/[route]/route.ts
export async function POST(request: Request) {
  // Implementation
}

// Next.js Pages Router
// pages/api/[route].ts
export default async function handler(req, res) {
  // Implementation
}

// Express/FastAPI
// app.post('/api/[route]', async (req, res) => {
//   Implementation
// });
```

### Request/Response Schemas

```typescript
// Request
export const [RequestSchema] = z.object({
  // Request fields
});

// Response
export const [ResponseSchema] = z.object({
  // Response fields
});
```

## Testing Strategy

### Unit Tests
- **Location**: `__tests__/[featureName].test.ts` or `tests/[featureName]_test.rs`
- **Framework**: [Vitest/Jest/cargo test/pytest]
- **Coverage Target**: [80%+]

### Test Cases

```typescript
describe('[FeatureName]', () => {
  it('should handle case 1', () => {
    // Test implementation
  });

  it('should handle error case', () => {
    // Test implementation
  });

  it('should validate input', () => {
    // Test implementation
  });
});
```

### Integration Tests
- **Location**: `__tests__/integration/[featureName].test.ts`
- **Scope**: [What integration scenarios]

## Implementation Checklist

### Phase 1: Types & Validation
- [ ] Define TypeScript types
- [ ] Create Zod schemas
- [ ] Export from barrel file

### Phase 2: Core Logic
- [ ] Implement utility functions
- [ ] Create service layer
- [ ] Add error handling

### Phase 3: Components/UI
- [ ] Build React components
- [ ] Implement hooks (if needed)
- [ ] Add state management (if needed)

### Phase 4: Data Layer
- [ ] Create API routes (if needed)
- [ ] Implement database queries
- [ ] Add data transformations

### Phase 5: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Achieve coverage target

## Dependencies

### External Packages
- [Package name] - [Purpose]
- [Package name] - [Purpose]

### Internal Modules
- [Module name] - [Purpose]
- [Module name] - [Purpose]

## Security Considerations

- [ ] Input validation on all user input
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize output)
- [ ] CSRF protection (if applicable)
- [ ] Rate limiting (if applicable)
- [ ] Authentication/authorization checks

## Performance Considerations

- [ ] Lazy loading for heavy components
- [ ] Memoization for expensive computations
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] Bundle size optimization

## Accessibility

- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)

## Design Document

Save this design to: `.claude/.smite/builder-design.md`

## Next Step

Proceed to `03-implement.md` (use `-i` flag) to write the implementation
