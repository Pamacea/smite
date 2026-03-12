# SMITE Agents - Guide Complet

> **Version:** 2.0.0 | **Dernière mise à jour:** 12 Mars 2026

---

## 📋 Table des Matières

1. [Introduction](#1-introduction)
2. [Système de Découverte](#2-système-de-découverte)
3. [Agents Frontend](#3-agents-frontend)
4. [Agents Backend](#4-agents-backend)
5. [Agents Database](#5-agents-database)
6. [Agents DevOps](#6-agents-devops)
7. [Agents Workflow](#7-agents-workflow)
8. [Hooks et Métriques](#8-hooks-et-métriques)
9. [Créer un Nouvel Agent](#9-créer-un-nouvel-agent)

---

## 1. Introduction

Les agents SMITE sont des assistants spécialisés qui apportent une expertise domaine-spécifique pour chaque stack technologique.

**Principes clés :**
- **Lazy loading** - Agents chargés seulement sur demande
- **Validation** - Validation avant chargement
- **Tracking** - Métriques d'utilisation par session
- **Patterns** - Stockage de patterns réutilisables

---

## 2. Système de Découverte

### Auto-Découverte par --tech

```bash
/studio build --tech=rust "Create API endpoint"
```

**Processus :**
1. Recherche l'agent correspondant à "rust"
2. Charge le contenu de `agents/backend/rust.agent.md`
3. Injecte les patterns dans la tâche
4. Exécute avec expertise Rust

### Mapping --tech → Agents

| Flag | Domain | Agent |
|------|--------|-------|
| `--tech=nextjs` | Frontend | `frontend/nextjs.agent.md` |
| `--tech=vite` | Frontend | `frontend/vitejs.agent.md` |
| `--tech=rust` | Backend | `backend/rust.agent.md` |
| `--tech=nestjs` | Backend | `backend/nestjs.agent.md` |
| `--tech=prisma` | Database | `database/prisma.agent.md` |
| `--tech=docker` | DevOps | `devops/docker.agent.md` |
| `--tech=vitest` | Testing | `testing/vitest.agent.md` |

### Sélection Manuelle

```bash
# Spécifier un agent précis
/studio build --agent=backend/rust "Create API"

# Spécifier un domaine (tous les agents du domaine)
/studio build --agent=frontend "Build component library"
```

---

## 3. Agents Frontend

### Next.js Agent

**Stack:** Next.js 16, React 19, RSC, Server Actions, Turbopack

**Spécialités:**
- React Server Components
- App Router patterns
- Server Actions vs Client Components
- Route Handlers
- Streaming SSR

**Exemples:**
```bash
# RSC page
/studio build --tech=nextjs "Create dashboard page with data fetching"

# Client component
/studio build --tech=nextjs "Build interactive form with state"
```

### Vite.js Agent

**Stack:** Vite, React/Vue/Svelte, TypeScript, HMR

**Spécialités:**
- Plugin development
- Fast HMR
- Build optimization
- Library mode

### React Native Agent

**Stack:** React Native, Expo, iOS, Android

**Spécialités:**
- Navigation patterns
- Native modules
- Platform-specific code

---

## 4. Agents Backend

### Rust Agent

**Stack:** Rust, Actix/Axum, SQLx, thiserror, tokio

**Spécialités:**
- DDD (Domain-Driven Design)
- Ownership patterns
- Async/await
- Error handling
- Testing

**Exemples:**
```bash
# API with DDD
/studio build --tech=rust "Create user API with DDD architecture"

# Async service
/studio build --tech=rust "Build async data processing service"
```

### NestJS Agent

**Stack:** NestJS, TypeScript, Decorators, Dependency Injection

**Spécialités:**
- Modular architecture
- Modules et providers
- Guards et interceptors
- Scheduling (Cron)
- Microservices

### Route-API Agent

**Stack:** Express/FastAPI, TypeScript, Middleware

**Spécialités:**
- Minimalist patterns
- Middleware chains
- Request validation
| Domaine | Technologies |
|--------|-------------|
| **Frontend** | Next.js 16, Vite.js, React Native |
| **Backend** | Rust, NestJS, Express |
| **Database** | Prisma, Drizzle, PostgreSQL |
| **DevOps** | Docker, Kubernetes |
| **Testing** | Vitest, Playwright |
| **Workflow** | TDD, Performance, Security, Planner |

---

## 7. Hooks et Métriques

### Hooks Disponibles

| Hook | Description |
|------|-------------|
| `SessionStart` | Initialise tracking métriques |
| `PreAgentInvoke` | Valide agent avant chargement |
| `PostAgentInvoke` | Track utilisation agent |
| `Stop` | Affiche résumé session |

### Scripts

| Script | Description |
|--------|-------------|
| `init-agents.sh` | Initialisation tracking |
| `validate-agent.sh` | Validation agent |
| `track-usage.sh` | Tracking utilisation |
| `agent-metrics.sh` | Affichage métriques |
| `list-agents.sh` | Liste agents disponibles |

### Métriques Collectées

```
.smite/agents/
├── metrics.json              # Invocations totales
├── invocations.log           # Log des appels
└── patterns/                 # Patterns stockés
```

---

## 9. Créer un Nouvel Agent

### Template

```markdown
# [Tech Name] Development Agent

## Mission
Specialized agent for [tech] development with SMITE.

## Stack
- **[Tech]**: [version]
- **Key Tools**: [list]

## Patterns
### Pattern 1: [Name]
- **Context**: When to use
- **Implementation**: Code example

## Workflow
1. [Step 1]
2. [Step 2]

## Integration
Loaded via: `/studio build --tech=[tech]`
Or: `/studio build --agent=[domain]/[tech]`
```

### Étapes

1. Créer le fichier: `agents/[domain]/[tech].agent.md`
2. Ajouter le frontmatter avec métadonnées
3. Remplir les sections (Mission, Stack, Patterns, Workflow)
4. Tester: `/studio build --tech=[tech] "test"`
5. Mettre à jour `index.md` du domaine

---

## 📞 Support

**Documentation:**
- [README.md](./README.md) - Quick start
- [REFERENCE.md](./REFERENCE.md) - Cheat sheet
- [AGENT_DISCOVERY.md](./AGENT_DISCOVERY.md) - Discovery system

---

**Version:** 2.0.0 | **Basé sur:** Claude Code Best Practices
