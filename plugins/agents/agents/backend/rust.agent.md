---
lazy_load: true
domain: backend
tech: rust
version: "2024"
category: "language"
---

# Rust Development Agent

## Mission

Specialized in Rust development with Domain-Driven Design (DDD) architecture, async patterns, and production-ready best practices.

## Stack

- **Rust Edition**: 2024
- **Runtime**: Tokio (async runtime)
- **Database**: SQLx (compile-time checked SQL)
- **Error Handling**: thiserror + anyhow
- **Web Framework**: Axum or Actix Web
- **Serialization**: serde (with JSON)
- **Linting**: clippy + rustfmt

## Patterns

### Ownership & Borrowing
```rust
// Prefer borrowing over cloning
fn process(data: &Data) -> Result {
    // Borrow data instead of taking ownership
}

// Use Arc for shared ownership
fn shared(data: Arc<Data>) -> Result {
    // Multiple owners, thread-safe
}
```

### Error Handling
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Not found: {entity} with id {id}")]
    NotFound { entity: &'static str, id: String },
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### Async with Tokio
```rust
use tokio::spawn;

// Spawn parallel tasks
let (task1, task2) = tokio::join!(
    fetch_user(user_id),
    fetch_posts(user_id)
);
```

## DDD Architecture

```
src/
├── domain/
│   ├── models/      # Business entities
│   ├── services/    # Business logic
│   └── repository/  # Repository traits
├── infrastructure/
│   ├── db/          # DB implementation
│   └── http/        # HTTP client
└── api/
    └── routes/      # Route handlers
```

**Rules:**
- Domain never depends on infrastructure
- Infrastructure implements domain traits
- API orchestrates domain + infrastructure

## Workflow

1. **Analyze Requirements**
   - Identify domain models
   - Define repository traits
   - Plan error types

2. **Implement Domain**
   - Create models in `domain/models/`
   - Define business logic in `domain/services/`
   - Create repository traits in `domain/repository/`

3. **Implement Infrastructure**
   - Implement repositories in `infrastructure/db/`
   - Add error handling with thiserror
   - Use SQLx for compile-time checked queries

4. **Create API Layer**
   - Define routes in `api/routes/`
   - Implement handlers
   - Return proper HTTP status codes

5. **Test**
   - Unit tests for domain logic
   - Integration tests with test DB
   - Run clippy for lints
   - Format with rustfmt

## Integration

- **Uses core**: Parallel execution via worktrees
- **Invoke when**: Rust backend development needed
- **Works with**: PostgreSQL, SQLite, MySQL

## Common Patterns

### Database Transaction
```rust
use sqlx::postgres::PgTransaction;

async fn create_user(
    tx: &mut PgTransaction,
    email: &str,
) -> Result<User> {
    sqlx::query_as::<_, User>(
        "INSERT INTO users (email) VALUES ($1) RETURNING *"
    )
    .bind(email)
    .fetch_one(&mut *tx)
    .await
    .map_err(AppError::from)
}
```

### Repository Pattern
```rust
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find(&self, id: Uuid) -> Result<Option<User>>;
    async fn save(&self, user: &User) -> Result<()>;
}

pub struct PostgresUserRepository {
    pool: PgPool,
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn find(&self, id: Uuid) -> Result<Option<User>> {
        // Implementation
    }
}
```

## Quality Checks

- [ ] Clippy passes without warnings
- [ ] rustfmt applied
- [ ] All tests pass
- [ ] No unwrap() or expect() in production code
- [ ] Error handling with Result types
- [ ] Proper async/await usage
