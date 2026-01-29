# impl-nextjs - Next.js Implementation Specialist

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Implement production-ready Next.js features following React 19, Next.js 15, and modern web development best practices.

## Core Patterns

### Project Structure
```
src/
├── app/                    # App Router (RSC)
│   ├── (routes)/page.tsx
│   └── api/[route]/route.ts
├── components/
│   ├── ui/                 # Shadcn components
│   └── [feature].tsx       # Feature components
├── lib/                    # Utilities
├── services/               # Business logic
├── validation/             # Zod schemas
└── types/                  # TypeScript types
```

### React Server Components (RSC)
- **Default**: All components are Server Components
- **Client Components**: Use `'use client'` for interactivity
- **Server Actions**: Use for mutations
- **Data Fetching**: Async components, no SWR needed

### Prisma Database
```typescript
// Repository pattern
import { prisma } from '@/lib/prisma';

export async function getData(id: string) {
  return prisma.data.findUnique({ where: { id } });
}

export async function createData(input: CreateInput) {
  return prisma.data.create({ data: input });
}
```

### Server Actions
```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const Schema = z.object({
  field1: z.string(),
});

export async function createAction(formData: FormData) {
  const data = Schema.parse(Object.fromEntries(formData));

  await prisma.data.create({ data });
  revalidatePath('/data');
}
```

### Validation (Zod)
```typescript
import { z } from 'zod';

export const CreateSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
});

export type CreateInput = z.infer<typeof CreateSchema>;
```

### Shadcn UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Component() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

### TanStack Query (Server State)
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function useData(id: string) {
  return useQuery({
    queryKey: ['data', id],
    queryFn: () => fetch(`/api/data/${id}`).then(r => r.json()),
  });
}
```

### Styling (Tailwind CSS)
```typescript
// Use gap-* instead of margins
<div className="flex gap-4">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>

// No magic values
<div className="w-1/2"> // ✅ GOOD
<div className="w-[432px]"> // ❌ BAD
```

## Best Practices

1. **RSC First**: Use Server Components by default
2. **Type Safety**: Zod validation at boundaries, no `any` types
3. **Barrel Exports**: Export from `index.ts`
4. **Async Components**: For data fetching, not TanStack Query
5. **Server Actions**: For mutations, not API routes
6. **Proper Error Handling**: Try/catch with error boundaries

## File Templates

### Server Component
```typescript
import { prisma } from '@/lib/prisma';

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.data.findUnique({
    where: { id: params.id },
  });

  return <div>{data?.field}</div>;
}
```

### API Route
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CreateSchema } from '@/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = CreateSchema.parse(body);

  // Process data

  return NextResponse.json(data);
}
```

## Integration

- **Launched by**: Builder skill (Step 3: Implement)
- **Tech Stack**: Next.js 15, React 19, Prisma, Tailwind
- **Test Framework**: Vitest, Testing Library

---
*impl-nextjs v1.0.0 - Next.js implementation specialist*
