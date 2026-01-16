# 🤖 SMITE Agents Convention

## 🚨 PRIORITÉS D'UTILISATION - READ THIS FIRST

### 1️⃣ OBLIGATOIRE : Recherche Sémantique (TOUJOURS en premier)

**Toujours commencer par la recherche sémantique :**

```bash
# 1er CHOIX : Toolkit SMITE
/toolkit search "query"           # 75% économie tokens, 2x précision
/toolkit explore --task=X         # Exploration intelligente
/toolkit graph --impact           # Analyse dépendances
/toolkit detect --patterns="..."  # Détection bugs (+40%)

# 2e CHOIX : mgrep (alternative)
mgrep "authentication function"   # Recherche sémantique CLI

# DERNIER RECOURS : Grep/Glob (avec permission)
```

**Pourquoi la recherche sémantique en priorité ?**
- ✅ **75% d'économie de tokens** (180k → 45k)
- ✅ **2x plus précis** que grep/Glob (40% → 95%)
- ✅ **40% de bugs en plus** détectés
- ✅ **Compréhension du langage naturel** vs regex

**Voir :** [`docs/DECISION_TREE.md`](docs/DECISION_TREE.md) | [`plugins/toolkit/README.md`](plugins/toolkit/README.md) | [mgrep.dev](https://www.mgrep.dev/)

---

### 2️⃣ Agents Spécialisés (si toolkit échoue)

| Agent | Usage | Quand |
|-------|-------|------|
| `/explorer` | Mapping architecture complet | Structure globale du projet |
| `/builder` | Implémentation de code | Nouvelles fonctionnalités |
| `/architect` | Design & stratégie | Nouveau projet / architecture |
| `/finalize` | QA & documentation | Avant commit/merge |
| `/simplifier` | Refactoring | Code trop complexe |
| `/ralph` | Multi-agent orchestrateur | Workflows complexes |

---

### ⚠️ Interdictions (STRICTEMENT APPLIQUÉ)

**NE JAMAIS utiliser en premier :**
- ❌ Grep tool → **BLOCKÉ** par hook. Utiliser `/toolkit search`
- ❌ Glob tool → **BLOCKÉ** par hook. Utiliser `/toolkit explore`
- ❌ Bash pour chercher du code → **BLOCKÉ** par hook. Utiliser `/toolkit`
- ❌ Read sans contexte → **BLOCKÉ** par hook. Utiliser `/toolkit explore`

**🚨 BLOQUAGE AUTOMATIQUE :**
- Ces outils sont **blockés automatiquement** par le hook `toolkit-enforcer-hook.js`
- Si vous essayez de les utiliser pour l'exploration de code, vous recevrez une erreur
- Vous DEVEZ utiliser `/toolkit` à la place

**Ces outils sont réservés :**
- ⚠️ En dernier recours si toolkit échoue (après 3 essais)
- ⚠️ Pour des opérations non liées au code (file system, git, etc.)

---

## 📋 Convention

```bash
# Direct usage (interactive)
/agent-name

# Ralph PRD usage (orchestrated)
agent-name:task
```

## 🎯 Available Agents

### `/explorer` - Codebase exploration
```bash
/explorer --task=find-function --target="getUserData"
/explorer --task=map-architecture
/explorer --task=find-bug --target="memory leak"
```

**Use:** Finding functions, mapping dependencies, analyzing architecture

---

### `/builder` - Implementation
```bash
/builder --tech=nextjs --feature="user authentication"
/builder --design --component="Button"
```

**Tech:** `nextjs`, `rust`, `python`, `go`

**Use:** Building features, implementing components, writing code

---

### `/architect` - Design & strategy
```bash
/architect --mode=init "Build a SaaS dashboard"
/architect --mode=strategy "Define pricing strategy"
/architect --mode=design "Modern fintech design system"
/architect --mode=brainstorm "Improve user engagement"
```

**Use:** Starting projects, planning strategy, creating design systems

---

### `/finalize` - QA & documentation
```bash
/finalify                              # Full QA + docs
/finalize --mode=qa                    # QA only
/finalize --mode=qa --type=test        # Tests
/finalize --mode=docs                  # Docs only
```

**Use:** Before commits, comprehensive QA, updating documentation

---

### `/simplifier` - Refactoring
```bash
/simplifier --scope=file src/ComplexComponent.tsx
/simplifier --scope=directory src/components
/simplifier --scope=all
```

**Use:** Code too complex, need refactoring, reducing technical debt

---

### `/ralph` - Multi-agent orchestrator
```bash
/ralph execute .claude/.smite/prd.json
/ralph "Build a todo app with auth"
/ralph status
/ralph cancel
```

**Use:** Full PRD execution, complex workflows, state persistence

---

### `/toolkit` - Code analysis & optimization
```bash
/toolkit search "authentication flow" --mode=hybrid
/toolkit explore --task=find-function --target="authenticateUser"
/toolkit graph --target=src/auth/jwt.ts --impact
/toolkit detect --scope=src/auth --patterns="security"
/toolkit budget
```

**Use:** Semantic search, dependency analysis, bug detection, token optimization

---

## 📊 Usage Comparison

| Scenario | Approach |
|----------|----------|
| Quick task | `/agent-name` |
| Medium workflow | Native Task tool |
| Complex workflow | `/ralph` |

## 🔄 Typical Workflow

```bash
# 1. Initialize
/architect --mode=init "Build a task management app"

# 2. Strategy
/architect --mode=strategy "Productivity tools market"

# 3. Design
/architect --mode=design "Modern minimalist design"

# 4. Explore (if existing code)
/explorer --task=map-architecture

# 5. Implement
/builder --tech=nextjs --feature="task CRUD"

# 6. Finalize
/finalize
```

## 🎓 Best Practices

1. **Start with Architect** - Define before building
2. **Use Explorer** - Understand existing code
3. **Build with Builder** - Implement following specs
4. **Finalize** - Ensure quality before commits
5. **Simplify** - Reduce complexity incrementally
6. **Orchestrate with Ralph** - For complex workflows

## 📚 Detailed Docs

- `plugins/*/commands/*.md` - Individual agent documentation
- `plugins/ralph/README.md` - Ralph complete guide
