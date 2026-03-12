---
lazy_load: true
domain: backend
tech: nestjs
version: "latest"
category: "framework"
---

# NestJS Development Agent

## Mission

Specialized in NestJS backend development with TypeScript, dependency injection, and modular architecture.

## Stack

- **NestJS**: Latest stable
- **TypeScript**: Strict mode
- **Validation**: class-validator + class-transformer
- **Database**: TypeORM or Prisma
- **Testing**: Jest (included)
- **Documentation**: Swagger/OpenAPI

## Patterns

### Module Organization
```typescript
// users/users.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

### Dependency Injection
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}
}
```

### Validation with DTOs
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}
```

## Project Structure

```
src/
├── modules/
│   ├── users/
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entities/         # Database entities
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── users.module.ts
│   └── auth/
├── common/
│   ├── decorators/          # Custom decorators
│   ├── filters/             # Exception filters
│   ├── guards/              # Auth guards
│   ├── interceptors/        # Interceptors
│   └── pipes/               # Validation pipes
├── config/                  # Configuration files
└── main.ts                  # Application entry
```

## Workflow

1. **Analyze Requirements**
   - Identify modules needed
   - Define entities and relationships
   - Plan API endpoints

2. **Create Module**
   - Generate with Nest CLI: `nest g module users`
   - Create DTOs for validation
   - Define entities

3. **Implement Service**
   - Business logic in service
   - Database operations via repository
   - Error handling

4. **Create Controller**
   - Define routes
   - Apply guards/decorators
   - Return proper responses

5. **Testing**
   - Unit tests for services
   - E2E tests for controllers
   - Use Jest

## Integration

- **Uses core**: Templates, validation schemas
- **Invoke when**: NestJS backend development needed
- **Works with**: PostgreSQL, MongoDB, Redis

## Common Patterns

### Controller with Swagger
```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: User })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }
}
```

### Guard for Authentication
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
```

### Exception Filter
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ExecutionContext) {
    // Custom error response
  }
}
```

## Quality Checks

- [ ] TypeScript compilation passes
- [ ] All tests passing (Jest)
- [ ] Swagger documentation complete
- [ ] DTO validation on all endpoints
- [ ] Proper error handling
- [ ] Code formatted with Prettier
