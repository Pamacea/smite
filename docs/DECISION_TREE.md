# 🌳 SMITE Decision Tree - Quel outil utiliser ?

## 🚨 RÈGLE #1 : TOUJOURS commencer par la recherche sémantique

```
Besoin d'explorer/chercher du code ?
│
├─ OUI → Recherche SÉMANTIQUE [OBLIGATOIRE]
│         │
│         ├─ 1er CHOIX → /toolkit search "query"
│         │                (75% économie, 2x précision)
│         │
│         ├─ 2e CHOIX → mgrep "query"
│         │                (Alternative sémantique)
│         │
│         └─ DERNIER RECOURS → Grep/Glob (avec permission)
│
├─ Analyse dépendances → /toolkit graph --impact
│
├─ Trouver fonction → /toolkit explore --task=find-function
│
└─ Détection bugs → /toolkit detect --patterns
```

## 🎯 Outils de Recherche Sémantique

### 1️⃣ `/toolkit search` (PREMIER CHOIX)

```bash
/toolkit search "authentication flow" --mode=hybrid
```

**Avantages :**
- ✅ 75% d'économie de tokens (180k → 45k)
- ✅ 2x plus précis que grep (40% → 95%)
- ✅ Intégré aux workflows SMITE
- ✅ Modes : semantic, literal, hybrid

**Quand l'utiliser :**
- Toujours en premier choix
- Pour la recherche dans le code
- Pour trouver des patterns similaires
- Pour analyser l'impact

### 2️⃣ `mgrep` (ALTERNATIVE)

```bash
mgrep "authentication function that validates JWT tokens"
```

**Avantages :**
- ✅ Recherche sémantique naturelle
- ✅ Fonctionne sur code, PDFs, images
- ✅ CLI natif, rapide
- ✅ Indépendant du toolkit

**Quand l'utiliser :**
- Si toolkit indisponible
- Pour rechercher dans des PDFs/documents
- Comme alternative légère

### ⚠️ Interdictions

**NE JAMAIS utiliser en premier :**
- ❌ Grep tool → Utiliser `/toolkit search` ou `mgrep`
- ❌ Glob tool → Utiliser `/toolkit explore`
- ❌ Bash pour chercher du code → JAMAIS
- ❌ Read sans contexte → Utiliser la recherche sémantique

## 📊 Pourquoi le toolkit en priorité ?

| Métrique | Traditionnel | Toolkit | Gain |
|----------|-------------|---------|------|
| **Tokens** | 180k | 45k | **75% économie** |
| **Précision recherche** | 40% | 95% | **+137%** |
| **Détection bugs** | 60% | 84% | **+40%** |
| **Vitesse** | 1.0x | 2.5x | **+150%** |

## 🎯 Scénarios d'utilisation

### 1. Je cherche du code / une fonction

```bash
# ✅ PREMIER CHOIX
/toolkit search "authentication flow" --mode=hybrid
/toolkit explore --task=find-function --target="authenticateUser"

# ⚠️ SI ÉCHEC
/explorer --task=find-function --target="authenticateUser"

# ❌ DERNIER RECOURS
# Grep/Glob manuels
```

### 2. Je veux comprendre l'architecture

```bash
# ✅ PREMIER CHOIX
/toolkit graph --target=src/ --impact

# ⚠️ COMPLÉMENT
/explorer --task=map-architecture
```

### 3. Je cherche des bugs / problèmes

```bash
# ✅ PREMIER CHOIX
/toolkit detect --scope=src/auth --patterns="security"

# ⚠️ COMPLÉMENT
/explorer --task=find-bug --target="memory leak"
```

### 4. Je veux implémenter une feature

```bash
# ✅ WORKFLOW COMPLET
/toolkit search "similar feature"  # Éviter de réinventer
/builder --feature="new feature"
/finalize
```

### 5. Workflow complexe multi-étapes

```bash
# ✅ ORCHESTRATION
/ralph "Build complete feature with authentication"
```

## 🚨 Interdictions

**NE JAMAIS utiliser en premier :**
- ❌ Grep tool (utiliser `/toolkit search`)
- ❌ Glob tool (utiliser `/toolkit explore`)
- ❌ Bash pour chercher du code (JAMAIS)
- ❌ Read sans contexte (utiliser `/toolkit explore`)

**Ces outils sont réservés :**
- ⚠️ En dernier recours si toolkit échoue
- ⚠️ Pour des opérations non liées au code (file system, etc.)

## 📚 Références

- [toolkit README](../plugins/toolkit/README.md) - Documentation complète
- [AGENTS.md](../AGENTS.md) - Liste des agents spécialisés
- [agents.md](../.claude/rules/agents.md) - Règles multi-agent

---

**Principe :** Le toolkit n'est pas une option, c'est le DEFAULT. Tout le reste est l'exception.
