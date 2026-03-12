# Core Plugin - Guide Complet

> **Version:** 2.0.0 | **Dernière mise à jour:** 12 Mars 2026

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [Architecture](#2-architecture)
3. [Templates](#3-templates)
4. [Validation](#4-validation)
5. [Platform Detection](#5-platform-detection)
6. [Lazy Loading](#6-lazy-loading)
7. [Hooks System](#7-hooks-system)
8. [MCP Integration](#8-mcp-integration)
9. [Scripts](#9-scripts)

---

## 1. Introduction

SMITE Core est l'infrastructure partagée pour tous les plugins SMITE. Il fournit des utilitaires communs, des schémas de validation, des templates et des capacités cross-platform.

**Principes clés:**
- **DRY** - Patterns définis une seule fois
- **Type Safety** - Validation par schémas JSON
- **Cross-Platform** - Windows, macOS, Linux
- **Parallel-First** - Git worktrees pour exécution parallèle

---

## 2. Architecture

### Structure des Dossiers

```
plugins/core/
├── infrastructure/          # Infrastructure partagée
│   ├── templates/          # Templates markdown réutilisables
│   ├── validation/         # Schémas JSON
│   ├── platform/           # Utilitaires cross-platform
│   ├── parallel/           # Exécution parallèle
│   └── docs/               # Documentation technique
├── src/                     # Code source TypeScript
│   ├── config/             # Gestion configuration
│   ├── hooks/              # Registre des hooks
│   ├── platform/           # Détection plateforme
│   ├── template/           # Moteur de templates
│   ├── utils/              # Utilitaires
│   └── metrics/            # Collecte métriques
├── integration/             # Couche d'intégration
├── skills/                  # Lazy loading system
├── mcp/                     # Serveurs MCP
├── scripts/                 # Scripts cross-platform
├── hooks/                   # Hooks centralisés
└── examples/                # Exemples de plugins
```

### Composants Principaux

#### Template Engine
Génère du markdown avec substitution de variables:
- Frontmatter avec métadonnées
- Messages d'avertissement
- Pieds de page avec version
- Templates plan mode (OBLIGATOIRE)

#### Validation Layer
Schémas JSON pour valider les configurations:
- Plugin manifests
- Design styles
- Vault configs
- Templates

#### Platform Abstraction
Détection et abstraction des différences plateforme:
- Windows (MINGW/MSYS/CYGWIN)
- macOS (darwin)
- Linux (default)

#### Parallel Execution
Orchestration Git worktree pour agents parallèles:
- Workspaces isolés
- Pas de conflits Git
- Scalable à N agents
- Cleanup automatique

---

## 3. Templates

### Templates Disponibles

| Template | Usage | Variables |
|----------|-------|-----------|
| `command-header.md` | En-tête de commandes | DESCRIPTION, MODEL, ARGUMENT_HINT, VERSION |
| `warnings.md` | Messages d'avertissement | - |
| `metadata.md` | Pieds de page version | VERSION, DATE |
| `plan-mode-first.md` | Template plan mode | - |

### Utilisation

```markdown
<!-- @include ../../core/infrastructure/templates/warnings.md#MANDATORY -->
```

### Lazy Loading

Les templates utilisent `lazy_load: true` dans leur frontmatter:
```yaml
---
lazy_load: true
category: "template"
name: "command-header"
version: "2.0.0"
---
```

---

## 4. Validation

### Schémas Disponibles

| Schéma | Usage |
|--------|-------|
| `plugin.schema.json` | Manifests de plugins |
| `design-styles.schema.json` | Styles de design |
| `vaults.schema.json` | Configurations vault |
| `templates.schema.json` | Définitions de templates |

### Utilisation

```json
{
  "$schema": "../core/infrastructure/validation/schemas/plugin.schema.json",
  "id": "my-plugin",
  "version": "1.0.0"
}
```

### Validation Flow

1. Charger fichier configuration
2. Parser référence `$schema`
3. Valider contre schéma
4. Retourner erreurs ou continuer

---

## 5. Platform Detection

### Plateformes Supportées

| OS | Shell | Détection |
|----|-------|----------|
| **Windows** | PowerShell | MINGW/MSYS/CYGWIN |
| **Windows** | cmd.exe | MINGW/MSYS/CYGWIN |
| **macOS** | Bash/Zsh | `darwin` |
| **Linux** | Bash/Zsh | default |

### Utilisation

```bash
PLATFORM=$(detect_platform)
case $PLATFORM in
  windows) echo "Running on Windows" ;;
  mac) echo "Running on macOS" ;;
  linux) echo "Running on Linux" ;;
esac
```

### Script Cross-Platform

```bash
node scripts/detect-platform.js
# → { platform: 'windows', shell: 'powershell' }
```

---

## 6. Lazy Loading

### Système Lazy Loading

**Avant v2.0:** Tous les templates chargés au démarrage (~15k tokens)

**Après v2.0:** Index léger + chargement à la demande (~6k tokens)

### TemplateLoader

```typescript
import { TemplateLoader } from '@smite/core/skills/template-loader';

// Charger template à la demande
const template = await TemplateLoader.load('command-header');
```

### Bénéfices

- **60% réduction** tokens au démarrage
- **Chargement <100ms** par template
- **Cache** pour templates fréquents

---

## 7. Hooks System

### Hooks Centralisés

```json
{
  "hooks": {
    "SessionStart": [{
      "id": "init-core",
      "action": "initialize",
      "description": "Initialize core systems"
    }],
    "PostToolUse": [{
      "id": "track-template",
      "matcher": "Write|Edit",
      "action": "trackUsage",
      "description": "Track template usage"
    }],
    "Stop": [{
      "id": "core-metrics",
      "action": "reportMetrics",
      "description": "Report core metrics"
    }]
  }
}
```

### Hook Registry

```typescript
import { getGlobalHookRegistry } from '@smite/core/src/hooks/registry';

const registry = getGlobalHookRegistry();
await registry.register('SessionStart', async (ctx) => {
  // Handler logic
});
```

---

## 8. MCP Integration

### Serveurs MCP Disponibles

| Serveur | Outils | Description |
|---------|--------|-------------|
| `core-server.js` | `get_platform`, `get_stats` | Infos core |
| `template-server.js` | `get_template`, `render_template`, `list_templates` | Templates |
| `validation-server.js` | `validate_config`, `list_schemas` | Validation |

### Utilisation

```bash
# Lister templates
mcp://smite-core-templates/list_templates

# Rendre template
mcp://smite-core-templates/render_template \
  --template="command-header" \
  --variables='{"DESCRIPTION": "My Command"}'
```

---

## 9. Scripts

### Scripts Cross-Platform

| Script | Usage | Platformes |
|--------|-------|-------------|
| `init-core.js` | Initialisation core | Win/Mac/Linux |
| `validate-plugin.js` | Validation plugin | Win/Mac/Linux |
| `detect-platform.js` | Détection plateforme | Win/Mac/Linux |
| `template-renderer.js` | Rendu templates | Win/Mac/Linux |

### Utilisation

```bash
# Initialiser core
npm run init-core

# Valider plugin
npm run validate-plugin -- --plugin=studio

# Détecter plateforme
npm run detect-platform

# Rendre template
npm run render-template -- --template=command-header
```

---

## Migration v1.6 → v2.0

### Changements

- **Templates:** Ajout `lazy_load: true`
- **Hooks:** Utiliser registry centralisé
- **Scripts:** Node.js au lieu de bash
- **Documentation:** Dual-layout (README + GUIDE + REFERENCE)

### Breaking Changes

- `TemplateLoader` utilise maintenant lazy loading
- Hook registry déplacé vers `src/hooks/`
- Scripts bash remplacés par Node.js

---

## Support

**Documentation:**
- [README.md](./README.md) - Quick start
- [REFERENCE.md](./REFERENCE.md) - Cheat sheet
- [infrastructure/docs/](./infrastructure/docs/) - Documentation technique

**Issues:** https://github.com/Pamacea/smite/issues

---

**Version:** 2.0.0 | **Basé sur:** SMITE v4.0.0
