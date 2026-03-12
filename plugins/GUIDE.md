# SMITE Plugins - Guide Complet

> **Version:** 3.0.0 | **Dernière mise à jour:** 12 Mars 2026

---

## 📖 Table des Matières

1. [Introduction](#1-introduction)
2. [Architecture des Plugins](#2-architecture-des-plugins)
3. [Installation](#3-installation)
4. [Studio - Workflow Principal](#4-studio---workflow-principal)
5. [Agents Spécialisés](#5-agents-spécialisés)
6. [Configuration Avancée](#6-configuration-avancée)
7. [Bonnes Pratiques](#7-bonnes-pratiques)

---

## 1. Introduction

SMITE est un écosystème de plugins pour **Claude Code** qui fournit un workflow de développement complet avec :

- **12 flags composables** pour un contrôle précis
- **23+ agents spécialisés** par domaine technique
- **Détection automatique** pour une utilisation sans configuration
- **Intégration mémoire** avec apprentissage automatique des patterns
- **Indicateurs de progression** pour une transparence totale
- **Métriques de qualité** pour une validation objective

---

## 2. Architecture des Plugins

```
plugins/
├── core/           # Infrastructure partagée
│   ├── templates/      # Templates Markdown
│   ├── validation/     # Schémas JSON
│   ├── platform/       # Détection OS
│   └── scripts/        # Scripts d'installation
│
├── studio/         # Workflow principal
│   ├── skills/         # Skills de build/refactor
│   │   ├── core/       # Skills toujours chargés
│   │   └── optional/   # Skills lazy-loaded
│   ├── commands/       # Commandes slash
│   ├── hooks/          # Event handlers
│   └── scripts/        # Scripts de qualité
│
├── essentials/     # Utilitaires productivité
│   └── skills/         # Auto-rename, shell
│
└── agents/         # Subagents spécialisés
    ├── backend/        # NestJS, Rust, Python, Go
    ├── frontend/       # Next.js, React, Vite
    ├── workflow/       # TDD, Performance, Security
    └── ...
```

---

## 3. Installation

### Installation de Base

```bash
cd /path/to/smite
claude --plugin-dir ./plugins
```

### Installation des Aliases (Optionnel)

```bash
# macOS/Linux
./plugins/core/scripts/install.sh

# Windows
./plugins/core/scripts/install.ps1
```

### Vérification

```bash
# Dans Claude Code
/studio build "test"
```

---

## 4. Studio - Workflow Principal

### Commande de Build

`/studio build` est le point d'entrée unique pour toutes les implémentations.

```bash
# Auto-détection (recommandé)
/studio build "fix login button"

# Avec flags explicites
/studio build --speed "quick fix"
/studio build --scale "build feature"
/studio build --quality "critical system"
/studio build --team "large project"
```

### Les 12 Flags

| Flag | Aliases | Effet | Usage |
|------|---------|--------|-------|
| `--speed` | `--fast`, `--quick` | Rapide, chirurgical | Quick fixes |
| `--scale` | `--thorough`, `--epct` | Workflow complet | Features complexes |
| `--quality` | `--validate` | Quality gates | Code critique |
| `--team` | `--swarm`, `--ralph` | Agents parallèles | Grands projets |
| `--clean` | - | Delete-first | Refactoring |
| `--test` | - | TDD mode | Tests first |
| `--debug` | - | Bug fixing | Corrections |
| `--docs` | - | Auto-documentation | APIs publiques |
| `--git` | - | Git-aware | Version control |
| `--branch` | - | Context-aware | Branch-specific |
| `--profile` | - | Performance profiling | Optimisation |
| `--types` | - | TypeScript amélioré | Type safety |

### Combinaisons de Flags

```bash
# Refactor complet avec validation
/studio build --clean --scale "refactor user service"

# TDD avec qualité maximale
/studio build --test --quality "payment processing"

# Debug avec git
/studio build --debug --git "fix TypeError"

# Performance avec équipes
/studio build --profile --team "optimize slow API"
```

---

## 5. Agents Spécialisés

### Agents Workflow

| Agent | Description | Auto-Activation |
|-------|-------------|-----------------|
| `tdd-guide` | Guide TDD RED-GREEN-REFACTOR | `--test` |
| `performance-profiler` | Profiling performance avec métriques | `--profile` |
| `security-scanner` | Scan OWASP Top 10 | `--security` |
| `typescript-improver` | Amélioration type safety | `--types` |
| `code-reviewer` | Review code qualité | `--quality` |
| `planner` | Planification architecture | `--scale` |

### Agents Backend

| Agent | Stack | Usage |
|-------|-------|-------|
| `nestjs.agent` | NestJS | APIs Node.js |
| `rust.agent` | Rust + Axum | Systems programming |
| `python.agent` | Python + FastAPI | Data/ML APIs |
| `go.agent` | Go + Gin | Microservices |

### Agents Frontend

| Agent | Stack | Usage |
|-------|-------|-------|
| `nextjs.agent` | Next.js 16 | Full-stack React |
| `vitejs.agent` | Vite + React | SPAs modernes |
| `react-native.agent` | React Native | Mobile apps |

---

## 6. Configuration Avancée

### Fichier de Configuration

`.claude/.smite/studio.json`

```json
{
  "build": {
    "defaults": {
      "flag": "scale",
      "model": "sonnet"
    },
    "memory": {
      "enabled": true,
      "autoSave": true
    },
    "progress": {
      "enabled": true,
      "compactAfter": 80
    }
  },
  "refactor": {
    "defaults": {
      "scope": "recent",
      "riskThreshold": 30
    },
    "security": {
      "owaspTop10": true
    },
    "types": {
      "strictMode": true,
      "allowAny": false,
      "coverageTarget": 95
    },
    "performance": {
      "improvementTarget": 20
    }
  }
}
```

### Variables d'Environnement

```bash
# Désactiver auto memory
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1

# Limite output MCP
export MAX_MCP_OUTPUT_TOKENS=25000

# Tool search threshold
export ENABLE_TOOL_SEARCH=auto:5
```

---

## 7. Bonnes Pratiques

### Before Writing Code

```markdown
☐ Search existing implementation
☐ Check for reusable components
☐ Consider delete-first approach
☐ Read existing patterns
```

### During Implementation

```markdown
☐ Follow existing patterns exactly
☐ Use barrel exports (index.ts)
☐ Keep functions pure
☐ Document complex logic
```

### After Implementation

```markdown
☐ Run quality gate: ./plugins/studio/scripts/quality-gate.sh
☐ Run tests
☐ Check type coverage
☐ Save patterns to memory
```

### Quality Checklist

```markdown
- [ ] Net code reduction (delete-first)
- [ ] Barrel exports present
- [ ] Tests passing
- [ ] No 'any' types
- [ ] Documentation updated
- [ ] Quality score ≥ 80
```

---

**Version:** 3.0.0 | **Basé sur:** Claude Code Optimization Masterclass + Workflow Developers Guide
