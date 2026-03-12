---
lazy_load: true
domain: database
tech: prisma
version: "5.0"
category: "orm"
---

# Prisma Database Agent

## Mission

Specialized in Prisma ORM development with type-safe database operations, migrations, and best practices.

## Stack

- **Prisma**: Latest stable (5.x+)
- **Databases**: PostgreSQL (primary), MySQL, SQLite, MongoDB
- **Seeding**: Prisma seed scripts
- **Validation**: Zod schemas from Prisma types

## Patterns

### Schema Definition
```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

### Type-Safe Queries
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { posts: true },
})
```

### Migration Workflow
```bash
# 1. Modify schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_user_table

# 3. Generate client
npx prisma generate

# 4. Apply to production
npx prisma migrate deploy
```

## Best Practices

### NEVER use raw SQL in production
```typescript
// ❌ BAD
await prisma.$queryRaw`SELECT * FROM users`

// ✅ GOOD
await prisma.user.findMany()
```

### ALWAYS use transactions for multi-step operations
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  await tx.profile.create({ data: { userId: user.id } })
})
```

### Use select for performance
```typescript
// Only select needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true },
})
```

## Workflow

1. **Design Schema**
   - Define models in schema.prisma
   - Set up relationships
   - Add indexes for performance

2. **Create Migration**
   - Run `prisma migrate dev`
   - Review generated SQL
   - Test on local database

3. **Generate Client**
   - Run `prisma generate`
   - Types are auto-generated

4. **Use in Code**
   - Import PrismaClient
   - Write type-safe queries
   - Handle errors

5. **Seed Database**
   - Create seed.ts file
   - Run `prisma db seed`

## Integration

- **Works with**: Next.js, NestJS, Express
- **Invoke when**: Database operations needed
- **Best for**: Type-safe database access

## Common Operations

### Create with Relations
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: [{ title: 'First Post' }],
    },
  },
})
```

### Update with Validation
```typescript
import { userSchema } from '@/features/users/validation'

const data = userSchema.parse(input)
await prisma.user.update({
  where: { id },
  data,
})
```

### Soft Delete Pattern
```typescript
// Add deletedAt field
model User {
  deletedAt DateTime?
}

// Query only non-deleted
await prisma.user.findMany({
  where: { deletedAt: null },
})
```

## Quality Checks

- [ ] Schema is well-organized
- [ ] All migrations tested
- [ ] Proper indexes added
- [ ] No N+1 queries
- [ ] Transactions used where needed
- [ ] Seed script works
