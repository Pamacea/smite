# SMITE Plugins - Référence Rapide

> **Cheat sheet complet** pour toutes les commandes et configurations

---

## 🚀 Commandes Rapides

### Studio Build

```bash
# Quick fixes
/studio build --speed "fix typo"
/studio build --speed "add button"

# Features
/studio build --scale "build auth system"
/studio build --test --scale "TDD feature"

# Quality critical
/studio build --quality "payment processing"
/studio build --quality --git "OAuth with commit"

# Large projects
/studio build --team "full-stack SaaS"
/studio build --team --scale "microservices"

# Refactoring
/studio build --clean --scale "remove duplicates"
/studio build --debug "fix TypeError"

# Documentation
/studio build --docs --scale "public API"
```

### Studio Refactor

```bash
# Modes
/studio refactor --quick              # Auto-fix
/studio refactor --full               # Complete workflow
/studio refactor --analyze            # Analysis only

# Spécialisés
/studio refactor --profile            # Performance
/studio refactor --security           # OWASP scan
/studio refactor --types              # TypeScript

# Scopes
/studio refactor --scope=recent       # Last changes
/studio refactor --scope=file:PATH    # Specific file
/studio refactor --scope=directory:PATH # Directory
/studio refactor --scope=all          # Full codebase
```

### Essentials

```bash
/rename                        # Auto-rename session
/rename "custom name"          # Custom name
/install-aliases               # Install cc/ccc aliases
```

---

## 📊 Flags Référence

| Flag | Effet | Quand |
|------|--------|-------|
| `--speed` | Rapide | < 100 chars task |
| `--scale` | Complet | Multi-file feature |
| `--quality` | Validé | Production code |
| `--team` | Parallèle | Large/multi-domain |
| `--clean` | Delete-first | Refactoring |
| `--test` | TDD | Test-critical |
| `--debug` | Bug fix | Debugging |
| `--docs` | Documentation | Public API |
| `--git` | Git-aware | Version control |
| `--branch` | Context-aware | Branch workflow |
| `--profile` | Performance | Optimization |
| `--types` | TypeScript | Type safety |

---

## 🤖 Agents Disponibles

### Backend
- `backend/nestjs.agent.md` - NestJS APIs
- `backend/rust.agent.md` - Rust + Axum
- `backend/python.agent.md` - Python + FastAPI
- `backend/go.agent.md` - Go microservices

### Frontend
- `frontend/nextjs.agent.md` - Next.js 16
- `frontend/vitejs.agent.md` - Vite + React
- `frontend/react-native.agent.md` - Mobile

### Workflow
- `workflow/tdd-guide.agent.md` - TDD workflow
- `workflow/performance-profiler.agent.md` - Profiling
- `workflow/security-scanner.agent.md` - OWASP
- `workflow/typescript-improver.agent.md` - Types
- `workflow/code-reviewer.agent.md` - Review
- `workflow/planner.agent.md` - Architecture

### Database
- `database/prisma.agent.md` - Prisma ORM

### DevOps
- `devops/docker.agent.md` - Docker containers

---

## 📁 Structure des Fichiers

```
plugins/
├── core/                   # Infrastructure
│   └── scripts/
│       ├── install.sh      # Unix install
│       └── install.ps1     # Windows install
│
├── studio/                 # Main workflow
│   ├── hooks/
│   │   └── hooks.json      # Event hooks
│   ├── scripts/
│   │   ├── validate-changes.sh
│   │   ├── validate-command.sh
│   │   ├── track-metrics.sh
│   │   ├── quality-gate.sh
│   │   └── session-summary.sh
│   └── skills/
│       ├── build/SKILL.md  # Main entry
│       ├── refactor/SKILL.md
│       └── optional/
│           ├── multi-review/
│           ├── pattern-capture/
│           └── progressive-build/
│
├── essentials/             # Productivity
│   └── skills/
│       ├── auto-rename/
│       └── shell/
│
└── agents/                 # Subagents
    └── agents/
        ├── backend/
        ├── frontend/
        ├── workflow/
        ├── database/
        └── devops/
```

---

## 🔧 Scripts Utiles

```bash
# Quality gate
./plugins/studio/scripts/quality-gate.sh

# Validate changes
./plugins/studio/scripts/validate-changes.sh

# Install aliases
./plugins/core/scripts/install.sh      # Unix
./plugins/core/scripts/install.ps1     # Windows
```

---

## 🎯 Auto-Detection

Le système détecte automatiquement :

| Signal | Détecté comme |
|--------|---------------|
| < 100 chars | `--speed` |
| "feature/build/create" | `--scale` |
| "SaaS/platform/system" | `--team` |
| "critical/security/payment" | `--quality` |
| "refactor/cleanup/remove" | `--clean` |
| "test/TDD/coverage" | `--test` |
| "fix/bug/error/debug" | `--debug` |
| "docs/API/guide" | `--docs` |
| "slow/performance" | `--profile` |
| "types/TypeScript" | `--types` |

---

## 📈 Métriques de Qualité

Le quality gate vérifie :

- ✅ Barrel exports (20 pts)
- ✅ Tests inclus (30 pts)
- ✅ Type-safe sans `any` (20 pts)
- ✅ Réduction nette de code (30 pts)
- ✅ Documentation mise à jour (10 pts)

**Score ≥ 80** = Excellent
**Score 50-79** = Bon
**Score < 50** = À améliorer

---

## 🔗 Documentation

- **README.md** - Quick start (< 50 lignes)
- **GUIDE.md** - Ce fichier
- **REFERENCE.md** - Cheat sheet
- **CLAUDE.md** - Instructions projet

---

**Version:** 3.0.0 | **Last Updated:** 2026-03-12
