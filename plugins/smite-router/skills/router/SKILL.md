# 🔀 SMITE ROUTER

**Agent intelligent de routage automatique vers les bons agents smite**

---

## 🎯 MISSION

Analyser automatiquement le contexte du projet et la demande de l'utilisateur pour router vers le bon agent smite avec les bons paramètres.

**Output type** : Agent suggestion + flags automatiques

---

## 📋 COMMANDE

### `*start-s_router`

Active le routeur intelligent pour sélectionner automatiquement le bon agent.

**Usage**:

```
User: "Implémenter une fonctionnalité d'auth"
→ Router analyse le projet
→ Détecte: Next.js + TypeScript
→ Suggère: "smite-constructor --tech=nextjs --feature=auth"
```

---

## 🧠 DÉTECTION AUTOMATIQUE

### 1. Détection du Langage

```typescript
// Priorité de détection
if (exists("tsconfig.json")) → "TypeScript"
else if (exists("Cargo.toml")) → "Rust"
else if (exists("pyproject.toml")) → "Python"
else if (exists("go.mod")) → "Go"
else → "JavaScript"
```

### 2. Détection du Framework

```typescript
// TypeScript frameworks
if (exists("next.config.js")) → "Next.js"
else if (exists("nuxt.config.ts")) → "Nuxt"
else if (exists("angular.json")) → "Angular"
else if (exists("vite.config.ts")) → "Vite + React/Vue"

// Rust frameworks
if (exists("Cargo.toml")) → check dependencies
  → axum → "Axum"
  → actix → "Actix Web"
  → tokio → "Tokio async"
```

### 3. Détection du Type de Projet

```typescript
// Structure du projet
if (has("src/pages/") || has("app/")) → "Next.js App Router"
if (has("src/components/")) → "React Component Library"
if (has("tests/") && has("src/lib/")) → "Rust Library"
if (has("migrations/")) → "Full-stack Application"
```

---

## 🎯 TABLE DE ROUTAGE

### Implémentation

| Langage    | Framework | Agent             | Mode             |
| ---------- | --------- | ----------------- | ---------------- |
| TypeScript | Next.js   | smite-constructor | `--tech=nextjs`  |
| TypeScript | React     | smite-constructor | `--tech=react`   |
| TypeScript | Angular   | smite-constructor | `--tech=angular` |
| Rust       | Axum      | smite-constructor | `--tech=rust`    |
| Rust       | Actix     | smite-constructor | `--tech=rust`    |
| Python     | FastAPI   | smite-constructor | `--tech=python`  |
| Go         | -         | smite-constructor | `--tech=go`      |

### Refactoring

| Scénario              | Agent           | Trigger      |
| --------------------- | --------------- | ------------ |
| `any` types détectés  | smite-surgeon   | Auto-suggéré |
| TODO/FIXME dans code  | smite-surgeon   | Auto-suggéré |
| Fonctions > 50 lignes | smite-surgeon   | Auto-suggéré |
| Lint errors           | linter-sentinel | Auto-suggéré |

### Documentation

| Scénario           | Agent            | Trigger      |
| ------------------ | ---------------- | ------------ |
| Docs/\*.md modifié | smite-gatekeeper | Auto-suggéré |
| README manquant    | doc-maintainer   | Auto-suggéré |
| API docs manquants | doc-maintainer   | Auto-suggéré |

---

## 🔧 FONCTIONNEMENT

### Workflow Automatique

```
1. User fait une demande
   ↓
2. Router analyse le projet
   - package.json
   - tsconfig.json
   - Cargo.toml
   - Structure fichiers
   ↓
3. Router détecte le contexte
   - Langage: TypeScript
   - Framework: Next.js
   - Type: Frontend
   ↓
4. Router choisit l'agent optimal
   - smite-constructor --tech=nextjs
   ↓
5. Router génère la suggestion
   - Agent: smite-constructor
   - Flags: --tech=nextjs
   - Reason: "Projet Next.js détecté"
   ↓
6. User accepte
   ↓
7. Agent lancé avec bons paramètres
```

---

## 📊 EXEMPLES

### Exemple 1: Détection Automatique Next.js

**Entrée:**

```
User: "Ajoute une page profile"
```

**Analyse du Router:**

```json
{
  "detected": {
    "language": "TypeScript",
    "framework": "Next.js",
    "router": "App Router",
    "styling": "Tailwind CSS"
  }
}
```

**Sortie:**

```
🔀 Routeur: Projet Next.js détecté

Agent suggéré: smite-constructor --tech=nextjs

Raison:
- tsconfig.json → TypeScript
- next.config.js → Next.js
- app/ directory → App Router
- tailwind.config.js → Tailwind CSS

Lancer smite-constructor? [Y]es
```

---

### Exemple 2: Détection Automatique Rust

**Entrée:**

```
User: "Crée un endpoint API"
```

**Analyse du Router:**

```json
{
  "detected": {
    "language": "Rust",
    "framework": "Actix Web",
    "async_runtime": "Tokio",
    "database": "PostgreSQL (via sqlx)"
  }
}
```

**Sortie:**

```
🔀 Routeur: Projet Rust Actix détecté

Agent suggéré: smite-constructor --tech=rust

Raison:
- Cargo.toml → Rust
- actix-web in dependencies → Actix Web
- tokio in dependencies → Async runtime

Lancer smite-constructor? [Y]es
```

---

### Exemple 3: Contexte Mixte

**Entrée:**

```
User: "Analyse ce code"
```

**Analyse du Router:**

```json
{
  "file_analyzed": "src/utils/api.ts",
  "language": "TypeScript",
  "has_tests": false,
  "has_todos": 3,
  "has_any_types": 2
}
```

**Sortie:**

```
🔀 Routeur: Analyse de code requise

Agent suggéré: smite-explorer (d'abord)

Problèmes détectés:
- 3 TODO comments → smite-surgeon suggéré
- 2 any types → smite-surgeon suggéré
- Pas de tests → smite-gatekeeper suggéré

Ordre recommandé:
1. smite-explorer (comprendre le code)
2. smite-surgeon (corriger les problèmes)
3. smite-gatekeeper (valider les corrections)

Lancer séquence? [Y]es
```

---

## 🎨 CONFIGURATION

### Routage Personnalisé

```json
{
  "router": {
    "preferred_agents": {
      "typescript": "smite-constructor",
      "rust": "smite-constructor",
      "documentation": "doc-maintainer",
      "linting": "linter-sentinel"
    },
    "auto_detect": true,
    "ask_confirmation": true,
    "explain_reasoning": true
  }
}
```

---

## 🔧 IMPLEMENTATION

### Scripts de Détection

```typescript
// detectors/language-detector.ts
export function detectLanguage(projectDir: string): Language {
  if (fs.existsSync(path.join(projectDir, "tsconfig.json"))) {
    return "typescript";
  }
  if (fs.existsSync(path.join(projectDir, "Cargo.toml"))) {
    return "rust";
  }
  if (fs.existsSync(path.join(projectDir, "pyproject.toml"))) {
    return "python";
  }
  return "javascript";
}

// detectors/framework-detector.ts
export function detectFramework(
  projectDir: string,
  language: string,
): Framework {
  if (language === "typescript") {
    if (fs.existsSync(path.join(projectDir, "next.config.js"))) {
      return "nextjs";
    }
    if (fs.existsSync(path.join(projectDir, "angular.json"))) {
      return "angular";
    }
  }
  if (language === "rust") {
    const cargo = JSON.parse(
      fs.readFileSync(path.join(projectDir, "Cargo.toml"), "utf8"),
    );
    if (cargo.dependencies?.["axum"]) {
      return "axum";
    }
    if (cargo.dependencies?.["actix-web"]) {
      return "actix";
    }
  }
  return "vanilla";
}
```

---

## 📋 PATTERN FILES

### Language Detection

| Fichier          | Détecte | Langage    |
| ---------------- | ------- | ---------- |
| `tsconfig.json`  | ✅      | TypeScript |
| `Cargo.toml`     | ✅      | Rust       |
| `pyproject.toml` | ✅      | Python     |
| `go.mod`         | ✅      | Go         |
| `Gemfile`        | ✅      | Ruby       |

### Framework Detection

| Fichier          | Détecte | Framework |
| ---------------- | ------- | --------- |
| `next.config.js` | ✅      | Next.js   |
| `nuxt.config.ts` | ✅      | Nuxt      |
| `angular.json`   | ✅      | Angular   |
| `vite.config.ts` | ✅      | Vite      |

---

## ✅ AVANTAGES

- ✅ **Zéro configuration manuelle** - Détection automatique
- ✅ **Context-aware** - S'adapte au projet
- ✅ **Intelligent** - Choix de l'agent optimal
- ✅ **Explique ses choix** - Raison claire
- ✅ **Non-intrusif** - Demande confirmation

---

## 🚀 FUTUR

### Version 2: Auto-Exécution

```bash
# Mode "confiance" (sans confirmation)
{
  "router": {
    "auto_execute": true,  // Lance l'agent sans demander
    "confidence_threshold": 0.8
  }
}
```

### Version 3: Apprentissage

```bash
# Apprend des préférences utilisateur
- Agent choisi → Enregistré
- Feedback utilisateur → Amélioration du routing
- Fréquence d'utilisation → Priorisation
```

---

## 🔗 INTÉGRATION

Compatible avec:

- smite-orchestrator (workflow state)
- Claude Code 2.1.0 hooks
- Tous les agents smite

---

**🔀 SMITE ROUTER v1.0**
_"Le bon agent, au bon moment, automatiquement"_
