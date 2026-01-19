# 🗺️ Project Orchestration

## 🎯 Mission
Engineering Zero-Dette via GLM 4.7/4.6.

## 📚 Specialized Rules (Load on Demand)
- **Logic & Data**: `.claude/rules/engineering.md`
- **UI & UX**: `.claude/rules/frontend.md`
- **Multi-Agent Ops**: `.claude/rules/agents.md`

## ⚓ Sync Hook
Dès qu'une tâche est identifiée comme "Frontend" ou "Engineering", l'agent DOIT lire (`cat`) le fichier de règles correspondant avant de coder.

## 🛡️ Quality Gate (Automated Code Validation)

**TOUS les changements de code sont automatiquement validés par le Quality Gate.**

### 📋 Configuration
Fichier: `.claude/.smite/quality.json`

```json
{
  "enabled": true,
  "exclude": [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/.claude/**",
    "**/.git/**",
    "**/.smite/**",
    "**/plugins/quality-gate/**"
  ],
  "complexity": {
    "maxCyclomaticComplexity": 10,
    "maxCognitiveComplexity": 15
  },
  "performance": {
    "maxMemoryMB": 8192,
    "batchSize": 10
  }
}
```

### ✅ Ce qui est vérifié
- **Complexité**: Fonctions trop complexes, imbrication excessive
- **Sécurité**: Injection SQL, XSS, crypto faible, secrets hardcoded
- **Sémantique**: Types incohérents, conventions de nommage, code dupliqué
- **Tests**: Échecs de tests (Jest, Vitest, Mocha, pytest)

### 💡 Utilisation Recommandée
```bash
# Pour les gros projets, utiliser toujours des options scoped
/quality-gate:quality-check --staged      # Seulement les fichiers staged
/quality-gate:quality-check --changed     # Seulement les fichiers modifiés
/quality-gate:quality-check --files "src/**/*.ts"  # Fichiers spécifiques

# Jamais sans options sur un gros projet (risque OOM)
# ❌ /quality-gate:quality-check  # Vérifie TOUT le projet = MÉMOIRE
```

### ⚠️ Gestion de la Mémoire
Le Quality Gate utilise **8GB de mémoire par défaut** (configurable). Pour les très gros projets:
- Utilisez toujours `--staged` ou `--changed`
- Traitement par lots de 10 fichiers (configurable via `batchSize`)
- Augmentez `maxMemoryMB` si nécessaire (max recommandé: 16384)

## 🚦 Execution Decision Matrix

| Task Type | Tool / Workflow |
| :--- | :--- |
| **Small Fix** | `/debug` |
| **Complex Feature** | `/ralph:ralph` (Parallel PRD) |
| **Long Session** | `/ralph:loop` |
| **Architecture** | Architect Agent → Implementation(Builder Agent) |

## 📂 Project Tree Standards

- `src/validation/` : Schémas Zod
- `src/components/ui/` : Atomes (Shadcn)
- `src/core/` : Logique métier pure
- Barrels : Un `index.ts` par dossier obligatoire pour le Tree-shaking
