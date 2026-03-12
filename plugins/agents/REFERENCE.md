# Agents Plugin - Quick Reference

> **23+ specialized agents** | Lazy loading | MCP integration

---

## 🚀 Quick Start

```bash
# Auto-discover agent by tech
/studio build --tech=nextjs "Create dashboard"
/studio build --tech=rust "Build API"
/studio build --tech=prisma "Design schema"

# Manual selection
/studio build --agent=frontend/nextjs "Build component"
/studio build --agent=backend/rust "Create service"

# Domain selection
/studio build --agent=frontend "UI work"
/studio build --agent=backend "API work"
```

---

## 🎯 --tech Flag Mapping

| Flag | Domain | Agent File | Stack |
|------|--------|------------|-------|
| `--tech=nextjs` | frontend | `frontend/nextjs.agent.md` | Next.js 16, React 19, RSC |
| `--tech=vite` | frontend | `frontend/vitejs.agent.md` | Vite, React/Vue/Svelte |
| `--tech=react-native` | frontend | `frontend/react-native.agent.md` | React Native, Expo |
| `--tech=rust` | backend | `backend/rust.agent.md` | Rust, Actix/Axum, SQLx |
| `--tech=nestjs` | backend | `backend/nestjs.agent.md` | NestJS, TypeScript, DI |
| `--tech=express` | backend | `backend/route-api.agent.md` | Express, FastAPI |
| `--tech=prisma` | database | `database/prisma.agent.md` | Prisma ORM |
| `--tech=docker` | devops | `devops/docker.agent.md` | Docker, containers |
| `--tech=vitest` | testing | `testing/vitest.agent.md` | Vitest, test runner |

---

## 📂 Domain Structure

```
agents/
├── frontend/           # UI frameworks
│   ├── nextjs.agent.md
│   ├── vitejs.agent.md
│   └── react-native.agent.md
├── backend/            # Server frameworks
│   ├── rust.agent.md
│   ├── nestjs.agent.md
│   └── route-api.agent.md
├── database/           # Data layers
│   └── prisma.agent.md
├── devops/             # Infrastructure
│   └── docker.agent.md
├── workflow/           # Development workflows
│   ├── planner.agent.md
│   ├── tdd-guide.agent.md
│   ├── code-reviewer.agent.md
│   ├── security-reviewer.agent.md
│   ├── security-scanner.agent.md
│   ├── performance-profiler.agent.md
│   └── typescript-improver.agent.md
├── optimization/       # Performance & SEO
│   ├── performance.agent.md
│   ├── seo.agent.md
│   └── optimization.agent.md
└── testing/            # Test strategies
    └── (via workflow/tdd-guide)
```

---

## 🔍 Agent Selection

### By Tech Stack
```bash
# Frontend
/studio build --tech=nextjs "Server Components"
/studio build --tech=vite "HMR plugin"

# Backend
/studio build --tech=rust "Async service"
/studio build --tech=nestjs "Microservice"

# Database
/studio build --tech=prisma "Schema migration"
```

### By Domain
```bash
# All frontend agents
/studio build --agent=frontend "Build UI library"

# All backend agents
/studio build --agent=backend "API system"
```

### By Specific Agent
```bash
# Exact agent
/studio build --agent=workflow/tdd-guide "TDD feature"
```

---

## 🤖 MCP Tools

### Agent Discovery Server

```bash
# Discover all agents
mcp://smite-agents-discovery/discover_agents

# Find by tech
mcp://smite-agents-discovery/find_agent?query=rust

# Get agent content
mcp://smite-agents-discovery/get_agent_content?agent_id=nextjs

# List domains
mcp://smite-agents-discovery/list_domains
```

### Pattern Library Server

```bash
# Save pattern
mcp://smite-agents-patterns/save_pattern

# Get patterns by domain/tech
mcp://smite-agents-patterns/get_patterns

# List all patterns
mcp://smite-agents-patterns/list_patterns
```

---

## 📊 Metrics & Hooks

### Tracking Storage
```
.smite/agents/
├── metrics.json           # Total invocations
├── invocations.log        # Call history
└── patterns/              # Stored patterns
    ├── {domain}-{tech}-{timestamp}.json
```

### Hook Events
| Event | Handler | Purpose |
|-------|---------|---------|
| `SessionStart` | `init-agents.sh` | Initialize metrics |
| `PreAgentInvoke` | `validate-agent.sh` | Validate agent exists |
| `PostAgentInvoke` | `track-usage.sh` | Record usage |
| `Stop` | `agent-metrics.sh` | Display summary |

---

## 🎯 Common Patterns

### Next.js RSC Pattern
```tsx
// Server Component (default)
async function Page() {
  const data = await fetch_data()
  return <View data={data} />
}

// Client Component (when needed)
'use client'
export function Interactive() {
  const [state, setState] = useState()
  // ...
}
```

### Rust DDD Pattern
```rust
// Domain layer
pub struct User { id: Uuid, name: String }

// Application layer
pub async fn create_user(cmd: CreateUser) -> Result<User>;

// Infrastructure layer
pub struct PostgresUserRepository;
```

### NestJS Module Pattern
```typescript
@Module({
  imports: [ConfigModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
```

---

## 🔧 Scripts

| Script | Purpose |
|--------|---------|
| `init-agents.sh` | Initialize tracking |
| `validate-agent.sh` | Validate before load |
| `track-usage.sh` | Track invocation |
| `agent-metrics.sh` | Show metrics |
| `list-agents.sh` | List available agents |

---

## 📚 Documentation Links

- **README.md** - 30-second hook
- **GUIDE.md** - Complete guide (5-min storytelling)
- **AGENT_DISCOVERY.md** - Discovery system details

---

*Version: 2.0.0 | Last Updated: 2026-03-12*
