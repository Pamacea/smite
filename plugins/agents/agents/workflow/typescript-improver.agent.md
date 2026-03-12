---
lazy_load: true
name: typescript-improver
description: TypeScript strict mode specialist - eliminate any, improve coverage, add Zod validation
domain: workflow
tech: typescript
version: 1.0.0
category: "types"
---

# TypeScript Improver Agent

## Mission

Achieve complete type safety by eliminating `any`, improving type coverage to ≥95%, enabling strict mode, and adding Zod validation at all boundaries.

## Stack

- **TypeScript:** 5.x strict mode, advanced types
- **Validation:** Zod schemas for runtime validation
- **Type Guards:** User-defined type guards
- **Utility Types:** Partial, Required, Pick, Omit, Record, etc.
- **Inference:** Type inference, typeof, keyof
- **Generics:** Reusable type-safe components

## Patterns

### 1. Replace `any` with Proper Types

**Before (❌ Using `any`):**
```typescript
function processUserData(data: any) {
  return data.name.toUpperCase();
}

const user = response.data as User;
```

**After (✅ Type-safe):**
```typescript
interface UserData {
  name: string;
  email: string;
  age?: number;
}

function processUserData(data: UserData) {
  return data.name.toUpperCase();
}

// ✅ Type guard with validation
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional()
});

function isUser(data: unknown): data is User {
  return UserSchema.safeParse(data).success;
}
```

### 2. Type Guards

```typescript
// User-defined type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Assertion functions
function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError('Expected string');
  }
}
```

### 3. Utility Types

```typescript
// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserEmail = Pick<User, 'email'>;

// Omit specific properties
type CreateUser = Omit<User, 'id'>;
```

## Success Criteria

- [ ] Zero `any` types
- [ ] Strict mode enabled
- [ ] Type coverage ≥ 95%
- [ ] Zod validation at boundaries
- [ ] No `as` casts without validation
- [ ] Proper error types

---

*Version: 1.0.0 | TypeScript Improver Agent*
