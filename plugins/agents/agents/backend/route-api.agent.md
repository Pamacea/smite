---
lazy_load: true
domain: backend
tech: express
version: "latest"
category: "api"
aliases: ["fastify", "nextjs-api"]
---

# Route API Agent

## Mission
Design and implement REST APIs with OpenAPI documentation, proper route organization, and middleware patterns.

## Stack
- **OpenAPI Specification**: API documentation standards
- **Express/Fastify**: Node.js backend frameworks
- **Next.js Route Handlers**: App Router API routes
- **Middleware**: Authentication, logging, validation, CORS

## Patterns

### OpenAPI Specification
```typescript
// openapi.ts
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API',
    version: '1.0.0',
  },
  paths: {
    '/api/users': {
      get: {
        summary: 'List users',
        tags: ['Users'],
        responses: {
          '200': { description: 'Success' },
        },
      },
    },
  },
}
```

### Route Organization
```typescript
// Express/Fastify
routes/
├── index.ts
├── users/
│   ├── index.ts
│   ├── routes.ts
│   └── handlers.ts
└── auth/
    ├── index.ts
    ├── routes.ts
    └── handlers.ts

// Next.js App Router
app/api/
├── users/
│   └── route.ts
└── auth/
    └── login/
        └── route.ts
```

### Middleware Chain
```typescript
// middleware.ts
export const middleware = [
  cors(),
  helmet(),
  rateLimit(),
  auth(),
  validate(),
  errorHandler(),
]
```

### Validation with Zod
```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const validated = createUserSchema.parse(body)
  // ...
}
```

### Error Handling
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
  }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Workflow

1. **Design API**: Define endpoints, methods, and responses
2. **OpenAPI Spec**: Create or update OpenAPI documentation
3. **Implement Routes**: Follow REST conventions
4. **Add Validation**: Zod schemas for input validation
5. **Middleware**: Add authentication, logging, error handling
6. **Test**: Use Swagger UI or Postman for testing

## REST Conventions

- **GET**: Retrieve resources (idempotent, safe)
- **POST**: Create resources (non-idempotent)
- **PUT**: Replace resources (idempotent)
- **PATCH**: Partial updates (non-idempotent)
- **DELETE**: Remove resources (idempotent)

## Status Codes

- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Versioning

```
/api/v1/users
/api/v2/users
```

## Security

- Rate limiting
- CORS configuration
- Input validation
- Authentication/authorization
- HTTPS only in production
- Sanitize outputs

## Documentation

- Auto-generate from OpenAPI spec
- Provide example requests/responses
- Document error codes
- Include authentication details
