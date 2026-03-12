---
lazy_load: true
category: "template"
name: "plan-mode-first"
version: "2.0.0"
description: "OBLIGATORY plan mode template before significant actions - subagents, multi-file changes, refactoring, testing"
---

# Plan Mode First - Template

**OBLIGATOIRE avant toute action significative.**

---

## Quand utiliser Plan Mode

**TOUJOURS** utiliser Plan Mode avant:
- Lancer des subagents
- Modifier plus de 2 fichiers
- Créer de nouveaux fichiers
- Exécuter des opérations de refactoring
- Lancer des tests complets

**Exception**: Tâches triviales (1-2 lignes, 1 fichier, évident)

---

## Structure du Plan

### 1. Objectifs (Goals)
```
Qu'est-ce qu'on essaie d'accomplir ?
- [ ] Objectif principal
- [ ] Objectifs secondaires (si applicable)
```

### 2. Scope (Portée)
```
Quels fichiers sont touchés ?
- Fichiers à lire: [liste]
- Fichiers à modifier: [liste]
- Fichiers à créer: [liste]
- Fichiers à supprimer: [liste]
```

### 3. Approche
```
Comment allons-nous procéder ?
- Étape 1: ...
- Étape 2: ...
- Étape 3: ...
```

### 4. Risques
```
Qu'est-ce qui pourrait mal tourner ?
- Risque 1: [mitigation]
- Risque 2: [mitigation]
```

### 5. Tests
```
Comment allons-nous valider ?
- Tests unitaires: [ ]
- Tests d'intégration: [ ]
- Manuel: [ ]
```

### 6. Critères de succès
```
Quand est-ce que c'est "fini" ?
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

---

## Template de Plan (Markdown)

```markdown
## Plan: [Titre de la tâche]

### Objectifs
- [ ] [Objectif principal]

### Fichiers
**À lire:**
- `path/to/file1`

**À modifier:**
- `path/to/file2` - [raison]

**À créer:**
- `path/to/file3` - [description]

### Approche
1. [Première étape]
2. [Seconde étape]
3. [Troisième étape]

### Risques
- [Risque 1] → [Mitigation]

### Validation
- [ ] lint passe
- [ ] typecheck passe
- [ ] tests liés passent

### Critères de succès
- [ ] [Critère 1]
- [ ] [Critère 2]
```

---

## Avant de lancer des subagents

**TOUJOURS** créer un plan qui inclut:
1. **Pourquoi** on lance des subagents (quelle tâche, quel scope)
2. **Quels** subagents et **quelle question** spécifique pour chacun
3. **Comment** on va fusionner les résultats
4. **Combien de temps** max par subagent

```markdown
## Plan: Lancer des subagents

### Pourquoi
[Description de la tâche qui nécessite des subagents]

### Subagents
1. **Agent 1**: [Tâche spécifique]
   - Question: "[Prompt précis]"
   - Timeout: X min

2. **Agent 2**: [Tâche spécifique]
   - Question: "[Prompt précis]"
   - Timeout: X min

### Fusion
- [ ] Comparer les résultats
- [ ] Extraire les points clés de chaque agent
- [ ] Synthétiser en réponse unique

### Sortie attendue
- [ ] [Ce qu'on veut obtenir]
```

---

## Check: Go/No-Go

Avant de passer à l'exécution, vérifier:

```
□ Le plan est complet (toutes sections remplies)
□ Les fichiers à modifier sont identifiés
□ Les risques sont mitigés
□ Les critères de succès sont clairs
□ La validation est définie
```

Si **UNE SEULE** case n'est pas cochée → **COMPLÉTER LE PLAN**

---

## Message à l'utilisateur

**Avant de lancer les subagents ou de commencer l'action:**

```markdown
## Plan préétabli

Je m'apprête à [action].

Voici mon plan:

### Objectifs
- [ ] [Objectif principal]

### Fichiers concernés
- À lire: [liste]
- À modifier: [liste]
- À créer: [liste]

### Approche
1. [Étape 1]
2. [Étape 2]

### Validation
- [ ] [Critères]

**Est-ce que je peux procéder ?** (ou suggestions/modifications)
```

---

**Version**: 2.0.0 | **Last Updated**: 2026-03-12
