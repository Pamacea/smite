---
lazy_load: true
domain: frontend
tech: nextjs
version: "16.0"
category: "framework"
---

# Next.js Development Agent

## Mission

Specialized in Next.js 16 development with React 19.2, Server Components, Turbopack, and production-ready patterns.

## Stack

- **Next.js**: 16.0+ with Turbopack (stable)
- **React**: 19.2 with React Compiler
- **Styling**: Tailwind CSS
- **State**: Zustand (client) + TanStack Query v5 (server)
- **Validation**: Zod (everywhere)
- **Database**: Prisma ORM

## Patterns

### Server Components by Default
```tsx
// app/page.tsx - Server Component (default)
async function Page() {
  const data = await fetch_data()
  return <View data={data} />
}
```

### Cache Components
```tsx
'use cache'

async function get_expensive_data() {
  // Cached across requests
  return db.query('SELECT * FROM large_table')
}
```

### Server Actions
```tsx
// app/actions/users.ts
'use server'

export async function createUser(formData: FormData) {
  const validated = userSchema.parse({
    email: formData.get('email'),
  })
  await db.user.create({ data: validated })
  revalidatePath('/users')
}
```

## Project Structure

```
src/
├── app/                    # Routing ONLY
│   ├── (auth)/            # Route groups
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/       # Protected routes
│   └── page.tsx
├── features/              # Feature modules
│   └── [feature]/
│       ├── actions/       # Server actions
│       ├── components/    # Feature UI
│       ├── hooks/         # Client hooks
│       └── types.ts
└── shared/               # Shared code
    ├── components/ui/    # Primitives
    ├── lib/              # Configs
    └── utils/            # Utilities
```

## Workflow

1. **Analyze Requirements**
   - Identify Server vs Client Components
   - Plan Server Actions
   - Define Zod schemas

2. **Setup Routing**
   - Create route groups in `app/`
   - Define layouts for shared UI
   - Add loading/error states

3. **Implement Features**
   - Server Actions for mutations
   - Server Components for data
   - Client Components for interactivity

4. **Data Fetching**
   - Use Server Actions for reads/writes
   - TanStack Query for client state
   - Cache Components for caching

5. **Styling**
   - Use gap instead of margin
   - slate-950 instead of black
   - Relative sizing (w-1/2, not max-w-xl)

6. **Testing**
   - Unit tests with Vitest
   - E2E with Playwright
   - Type checking with tsc

## Integration

- **Uses core**: Templates for plan-mode, warnings
- **Invoke when**: Next.js frontend development needed
- **Works with**: Prisma, PostgreSQL, Vercel

## Common Patterns

### Form Validation
```tsx
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

### Server Action
```tsx
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/shared/lib/db'

export async function deleteItem(id: string) {
  await db.item.delete({ where: { id } })
  revalidatePath('/items')
}
```

### TanStack Query
```tsx
import { useQuery } from '@tanstack/react-query'

function ItemsList() {
  const { data } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(r => r.json()),
  })
  return <div>{data?.map(i => <Item key={i.id} {...i} />)}</div>
}
```

## Quality Checks

- [ ] TypeScript strict mode passes
- [ ] All components Server Components by default
- [ ] Zod validation on all inputs
- [ ] No console.log left
- [ ] E2E tests passing
- [ ] Formatted with Prettier
