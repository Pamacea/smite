# Essentials Plugin - Guide Complet

> **Version:** 2.0.0 | **Dernière mise à jour:** 12 Mars 2026

---

## Table des Matières

1. [Introduction](#1-introduction)
2. [Auto-Rename](#2-auto-rename)
3. [Shell Aliases](#3-shell-aliases)
4. [Configuration](#4-configuration)
5. [Hooks System](#5-hooks-system)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Introduction

SMITE Essentials fournit des utilitaires de productivité qui améliorent votre workflow de développement quotidien avec un renommage intelligent de session et des alias shell multiplateformes.

**Fonctionnalités principales:**
- **Auto-Rename**: Renommage automatique des sessions Claude Code
- **Shell Aliases**: Alias cc/ccc pour lancer Claude Code
- **Cross-Platform**: Fonctionne sur Windows, macOS, et Linux
- **Hooks System**: Intégration transparente avec Claude Code

---

## 2. Auto-Rename

### Fonctionnement

Le système d'auto-rename analyse automatiquement le contexte de vos conversations Claude Code pour générer des noms de session intelligents suivant le format `Action: Contexte`.

### Déclencheurs

Le renommage s'active automatiquement sur:
- **SessionStart**: Analyse le premier message pour définir le nom initial
- **PostToolUse**: Renomme après les opérations importantes (Write, Bash, git)
- **UserPromptSubmit**: Met à jour selon l'évolution de la conversation

### Format des Noms

| Préfixe d'Action | Usage | Exemple |
|------------------|-------|---------|
| **Fix** | Corrections de bugs | `Fix: login bug` |
| **Add** | Nouvelles fonctionnalités | `Add: user CRUD API` |
| **Update** | Modifications | `Update: database schema` |
| **Delete** | Suppressions | `Delete: deprecated code` |
| **Refactor** | Restructuration | `Refactor: auth system` |
| **Debug** | Investigation | `Debug: memory leak` |
| **Test** | Tests | `Test: payment flow` |
| **Docs** | Documentation | `Docs: API README` |
| **Config** | Configuration | `Config: env variables` |

### Utilisation

```bash
# Automatique (aucune action requise)
# Le système renomme automatiquement les sessions

# Override manuel
/rename "Build JWT authentication system"
```

### Configuration

```json
{
  "autoRename": {
    "enabled": true,
    "maxNameLength": 50,
    "maxRenamesPerSession": 10,
    "renameTriggers": ["sessionStart", "postToolUse", "userPromptSubmit"]
  }
}
```

---

## 3. Shell Aliases

### Aliases Disponibles

| Alias | Mode | Description |
|-------|------|-------------|
| **cc** | Normal | Respecte tous les hooks et permissions |
| **ccc** | Bypass | Ignore les confirmations |

### Installation

```bash
# Installation one-time
/install-aliases

# Utilisation après installation
cc "Help me debug this issue"
ccc "Quick fix this bug"
```

### Plateformes Supportées

| OS | Shell | Fichier de config |
|----|-------|-------------------|
| **Windows** | PowerShell | `$PROFILE` |
| **Windows** | cmd.exe | `%USERPROFILE%\cc.bat` |
| **macOS/Linux** | Bash | `~/.bashrc` |
| **macOS/Linux** | Zsh | `~/.zshrc` |

### Processus d'Installation

1. Détection automatique du shell
2. Sauvegarde du fichier de config existant
3. Ajout des alias
4. Vérification de l'installation
5. Instructions pour recharger le shell

### Sécurité

- Sauvegarde automatique avant modification
- Idempotent (sûr à exécuter plusieurs fois)
- Non-destructif (ne supprime pas les alias existants)
- Vérification de l'installation

---

## 4. Configuration

### Fichier de Configuration

**Emplacement:** `.claude/.smite/essentials.json`

### Structure Complète

```json
{
  "version": "2.0.0",
  "autoRename": {
    "enabled": true,
    "triggers": [
      "user_prompt_start",
      "conversation_end"
    ],
    "maxNameLength": 50,
    "format": "title-case",
    "filters": [
      "remove-emojis",
      "remove-special-chars",
      "truncate"
    ],
    "patterns": {
      "feature": ["build", "create", "implement", "add"],
      "bugfix": ["fix", "debug", "resolve"],
      "refactor": ["refactor", "cleanup", "optimize"],
      "docs": ["document", "readme", "guide"]
    }
  },
  "shell": {
    "enabled": true,
    "aliases": {
      "cc": "claude",
      "ccc": "claude-code"
    },
    "installPaths": {
      "powershell": "$PROFILE",
      "bash": "~/.bashrc",
      "zsh": "~/.zshrc",
      "cmd": "%USERPROFILE%\cc.bat"
    }
  }
}
```

### Options

#### autoRename
- `enabled`: Active/désactive le renommage automatique
- `maxNameLength`: Longueur max du nom (défaut: 50)
- `maxRenamesPerSession`: Nombre max de renommages (défaut: 10)
- `format`: Format du nom ("title-case", "sentence-case")
- `filters`: Filtres de nettoyage du nom

#### shell
- `enabled`: Active/désactive les alias shell
- `aliases`: Alias à installer
- `installPaths`: Chemins des fichiers de config

---

## 5. Hooks System

### Hooks Disponibles

| Hook | Description | Handler |
|------|-------------|---------|
| `SessionStart` | Renommage initial | auto-rename |
| `PostToolUse` | Renommage après opération | auto-rename |
| `UserPromptSubmit` | Mise à jour du nom | auto-rename |

### Configuration des Hooks

```json
{
  "hooks": {
    "SessionStart": [{
      "skill": "auto-rename",
      "action": "rename"
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit|Bash",
      "skill": "auto-rename",
      "action": "rename"
    }],
    "UserPromptSubmit": [{
      "skill": "auto-rename",
      "action": "rename"
    }]
  }
}
```

---

## 6. Troubleshooting

### Auto-Rename Ne Fonctionne Pas

**Symptôme:** Les sessions ne sont pas renommées automatiquement

**Solutions:**
1. Vérifier que `autoRename.enabled` est `true` dans la config
2. Vérifier que les triggers sont correctement configurés
3. Vérifier que les hooks Claude Code sont activés
4. Consulter les logs dans `.claude/.smite/logs/`

### Aliases Non Trouvés

**Symptôme:** Commandes cc/ccc non reconnues

**Solutions:**
1. Réexécuter `/install-aliases`
2. Vérifier le fichier de config du shell
3. Redémarrer le terminal
4. Vérifier le bon shell (PowerShell vs cmd.exe)

### Noms de Session Trop Longs

**Symptôme:** Noms tronqués ou trop longs

**Solutions:**
1. Ajuster `maxNameLength` dans la config
2. Activer le filtre `truncate`
3. Utiliser `/rename` pour un nom personnalisé

### Installation Échoue

**Symptôme:** Erreur lors de `/install-aliases`

**Solutions:**
1. Vérifier les permissions du fichier de config
2. Essayer en mode administrateur
3. Restaurer depuis la sauvegarde créée
4. Consulter le guide d'installation détaillé

---

## Support

**Documentation:**
- [README.md](./README.md) - Quick start
- [REFERENCE.md](./REFERENCE.md) - Cheat sheet

**Issues:** https://github.com/Pamacea/smite/issues

---

**Version:** 2.0.0 | **Basé sur:** SMITE v4.0.0
