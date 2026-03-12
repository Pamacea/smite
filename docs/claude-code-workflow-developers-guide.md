# Claude Code Workflow - Guide Complet des Développeurs

> **Version:** 1.0.0 | **Dernière mise à jour:** 12 Mars 2026
> **Source:** Documentation officielle Anthropic Claude Code

---

## 📋 Table des Matières

1. [Introduction à Claude Code](#1-introduction-à-claude-code)
2. [Installation et Configuration](#2-installation-et-configuration)
3. [Concepts Fondamentaux](#3-concepts-fondamentaux)
4. [Système de Plugins](#4-système-de-plugins)
5. [Skills et Workflows](#5-skills-et-workflows)
6. [Subagents Spécialisés](#6-subagents-spécialisés)
7. [Model Context Protocol (MCP)]#7-model-context-protocol-mcp)
8. [Memory et Contexte](#8-memory-et-contexte)
9. [Meilleures Pratiques](#9-meilleures-pratiques)
10. [Écosystème et Économie](#10-écosystème-et-économie)
11. [Ressources et Communauté](#11-ressources-et-communauté)

---

## 1. Introduction à Claude Code

### Qu'est-ce que Claude Code ?

Claude Code est un **outil de codage agentique** qui vit dans votre terminal, comprend votre codebase et vous aide à coder plus rapidement en exécutant des tâches routinières, en expliquant du code complexe et en gérant les workflows Git - le tout via des commandes en langage naturel.

### Capacités Principales

| Capacité | Description |
|----------|-------------|
| **Build features** | Décrivez ce que vous voulez construire en anglais, Claude planifie, écrit le code et vérifie que ça fonctionne |
| **Debug & Fix** | Décrivez un bug ou collez un message d'erreur, Claude analyse votre codebase, identifie le problème et implémente la correction |
| **Navigate codebase** | Posez des questions sur votre codebase, Claude maintient une compréhension de la structure entière de votre projet |
| **Automate tasks** | Corrigez les problèmes de lint, résolvez les conflits de merge, écrivez des release notes |

### Pourquoi les développeurs adorent Claude Code

- **Works in your terminal** - Pas une autre fenêtre de chat, pas un autre IDE
- **Takes action** - Peut directement éditer des fichiers, exécuter des commandes, créer des commits
- **Unix philosophy** - Composable et scriptable
- **Enterprise-ready** - Sécurité, confidentialité et conformité de niveau entreprise

---

## 2. Installation et Configuration

### Méthodes d'Installation

#### macOS/Linux (Recommandé)
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

#### Homebrew (macOS/Linux)
```bash
brew install --cask claude-code
```

#### Windows (Recommandé)
```powershell
irm https://claude.ai/install.ps1 | iex
```

#### WinGet (Windows)
```powershell
winget install Anthropic.ClaudeCode
```

### Prérequis

- Node.js 18 ou plus récent
- Un compte Claude.ai (recommandé) ou Anthropic Console

### Première Utilisation

```bash
# Naviguez vers votre projet
cd your-awesome-project

# Lancez Claude
claude

# Vous serez invité à vous connecter lors de la première utilisation
```

---

## 3. Concepts Fondamentaux

### Architecture Agentique

Claude Code est un environnement de codage agentique. Contrairement à un chatbot qui répond à des questions et attend, Claude Code peut :

1. **Lire vos fichiers**
2. **Exécuter des commandes**
3. **Apporter des modifications**
4. **Travailler de manière autonome** pendant que vous regardez, redirigez ou partez

### Boucle Agentique (Agentic Loop)

```
EXPLORE → PLAN → CODE → TEST
   ↑                    ↓
   └────────────────────┘
```

| Phase | Description |
|-------|-------------|
| **EXPLORE** | Recherche sémantique, lecture de patterns, recherche parallèle |
| **PLAN** | Stratégie, fichiers à modifier, tests, cas limites |
| **CODE** | Suivre les patterns existants, exports barrel, self-documenting |
| **TEST** | Lint, typecheck, tests liés uniquement |

### Gestion du Contexte

Le **context window** est la ressource la plus importante à gérer :

- Chaque conversation, chaque fichier lu, chaque sortie de commande consomme des tokens
- La performance LLM se dégrade lorsque le contexte se remplit
- Utilisez `/clear` fréquemment entre les tâches non liées
- Utilisez `/compact <instructions>` pour résumer et libérer de l'espace

---

## 4. Système de Plugins

### Qu'est-ce qu'un Plugin ?

Les plugins Claude Code sont des extensions qui améliorent Claude Code avec :

- **Commandes slash personnalisées**
- **Agents spécialisés**
- **Hooks**
- **Serveurs MCP**

### Plugins Officiels

| Nom | Description | Contenu |
|-----|-------------|---------|
| **agent-sdk-dev** | Kit de développement pour Agent SDK | Commande: `/new-sdk-app`, Agents: verify |
| **claude-opus-4-5-migration** | Migration depuis Sonnet 4.x et Opus 4.1 | Skill: migration automatique |
| **code-review** | Review automatique de PR avec agents parallèles | Commande: `/code-review` |
| **commit-commands** | Automatisation Git workflow | Commands: `/commit`, `/commit-push-pr` |
| **feature-dev** | Workflow développement complet 7 phases | Commande: `/feature-dev` |
| **frontend-design** | Interfaces frontend distinctives | Skill: design guidance |
| **hookify** | Création facile de hooks personnalisés | Commands: `/hookify`, `/hookify:list` |
| **plugin-dev** | Boîte à outils complète pour plugins | Commande: `/plugin-dev:create-plugin` |
| **pr-review-toolkit** | Review PR complet spécialisé | Commande: `/pr-review-toolkit:review-pr` |
| **security-guidance** | Rappels de sécurité | Hook: PreToolUse monitoring |

### Structure d'un Plugin

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Métadonnées du plugin
├── commands/                # Slash commands (optionnel)
├── agents/                  # Agents spécialisés (optionnel)
├── skills/                  # Agent Skills (optionnel)
├── hooks/                   # Event handlers (optionnel)
├── .mcp.json                # Configuration outils externes (optionnel)
└── README.md                # Documentation du plugin
```

### Installation des Plugins

```bash
# Via marketplace
claude plugin install <plugin-name>

# Test local pendant développement
claude --plugin-dir ./my-plugin

# Recharger après modifications
/reload-plugins
```

---

## 5. Skills et Workflows

### Qu'est-ce qu'un Skill ?

Un **Skill** est un ensemble d'instructions que Claude peut utiliser automatiquement ou invoquer directement. Les skills suivent le standard **Agent Skills**.

### Skills Bundlé (Intégrés)

| Skill | Description |
|-------|-------------|
| `/simplify` | Revoit le code modifié pour qualité, réutilisation et efficacité |
| `/batch <instruction>` | Orchestre des changements à grande échelle en parallèle |
| `/debug [description]` | Débugue la session en lisant le log de debug |
| `/loop [interval] <prompt>` | Exécute un prompt de manière récurrente |
| `/claude-api` | Référence API Claude et Agent SDK |

### Créer un Skill

#### Structure
```
my-skill/
├── SKILL.md           # Instructions principales (requis)
├── template.md        # Template à remplir
├── examples/          # Exemples de sortie
└── scripts/           # Scripts exécutables
```

#### Frontmatter SKILL.md

```yaml
---
name: explain-code
description: Explique le code avec diagrammes visuels et analogies
disable-model-invocation: false
allowed-tools: Read, Grep, Bash
model: inherit
---
```

| Champ | Description |
|-------|-------------|
| `name` | Nom d'affichage (devient `/slash-command`) |
| `description` | Aide Claude à décider quand utiliser le skill |
| `disable-model-invocation` | Empêche Claude de l'invoquer automatiquement |
| `allowed-tools` | Outils autorisés sans permission |
| `model` | Modèle à utiliser (`sonnet`, `opus`, `haiku`, `inherit`) |

### Substitutions de Chaînes

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Tous les arguments passés au skill |
| `$ARGUMENTS[N]` ou `$N` | Argument spécifique par index (0-based) |
| `${CLAUDE_SESSION_ID}` | ID de session actuelle |
| `${CLAUDE_SKILL_DIR}` | Répertoire contenant SKILL.md |

### Portée des Skills

| Location | Path | S'applique à |
|----------|------|--------------|
| **Enterprise** | Managed settings | Tous utilisateurs de l'organisation |
| **Personal** | `~/.claude/skills/<skill-name>/` | Tous vos projets |
| **Project** | `.claude/skills/<skill-name>/` | Ce projet uniquement |
| **Plugin** | `<plugin>/skills/<skill-name>/` | Là où le plugin est activé |

---

## 6. Subagents Spécialisés

### Qu'est-ce qu'un Subagent ?

Un **subagent** est un assistant IA spécialisé qui gère des types spécifiques de tâches. Chaque subagent :

- Exécute dans sa propre fenêtre de contexte
- A un prompt système personnalisé
- A un accès spécifique aux outils
- A des permissions indépendantes

### Subagents Intégrés

| Subagent | Modèle | Outils | Usage |
|----------|--------|--------|-------|
| **Explore** | Haiku | Read-only | Découverte de codebase, recherche |
| **Plan** | Inherit | Read-only | Recherche pour planification |
| **General-purpose** | Inherit | All | Tâches complexes multi-étapes |
| **Bash** | Inherit | Terminal | Commandes terminal |
| **statusline-setup** | Sonnet | - | Configuration status line |
| **Claude Code Guide** | Haiku | - | Questions sur Claude Code |

### Créer un Subagent

#### Via la commande `/agents`

```bash
/agents
# Interface interactive pour créer, éditer, supprimer des agents
```

#### Manuellement (Markdown + Frontmatter)

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: default
maxTurns: 50
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
```

### Configuration des Subagents

| Emplacement | Portée | Priorité |
|-------------|--------|----------|
| `--agents` CLI flag | Session actuelle | 1 (plus haute) |
| `.claude/agents/` | Projet actuel | 2 |
| `~/.claude/agents/` | Tous vos projets | 3 |
| Plugin `agents/` | Là où plugin activé | 4 (plus basse) |

### Modes de Permission

| Mode | Comportement |
|------|---------------|
| `default` | Vérification standard avec prompts |
| `acceptEdits` | Auto-accepte les éditions de fichiers |
| `dontAsk` | Auto-refuse les prompts de permission |
| `bypassPermissions` | Saute toutes les vérifications |
| `plan` | Plan mode (exploration read-only) |

### Patterns Communs

#### Isoler les opérations volumineuses
```
Use a subagent to run the test suite and report only the failing tests
```

#### Recherche parallèle
```
Research the authentication, database, and API modules in parallel using separate subagents
```

#### Chaîner les subagents
```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

---

## 7. Model Context Protocol (MCP)

### Qu'est-ce que MCP ?

Le **Model Context Protocol** est un standard open source pour les intégrations IA-outils. MCP permet à Claude Code de se connecter à des centaines d'outils externes et sources de données.

### Ce que vous pouvez faire avec MCP

- **Implémenter des features depuis les issue trackers**
- **Analyser les données de monitoring**
- **Interroger des bases de données**
- **Intégrer des designs** (Figma, etc.)
- **Automatiser les workflows** (Gmail, Slack, etc.)

### Serveurs MCP Populaires

| Service | Description |
|---------|-------------|
| **GitHub** | Code review, issues, PRs |
| **Sentry** | Monitoring et erreur tracking |
| **PostgreSQL** | Requêtes base de données |
| **Google Drive** | Accès documents |
| **Slack** | Communication équipe |
| **Notion** | Gestion connaissance |
| **Jira** | Gestion tickets |
| **Figma** | Design files |

### Installation MCP

#### HTTP Server (Recommandé)
```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

#### Avec Authentification
```bash
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

#### SSE Server
```bash
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

#### Stdio (Local)
```bash
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```

### Gestion des Serveurs

```bash
# Lister tous les serveurs
claude mcp list

# Détails d'un serveur
claude mcp get github

# Supprimer un serveur
claude mcp remove github

# Dans Claude Code, vérifier le statut
/mcp
```

### Scopes MCP

| Scope | Location | Usage |
|-------|----------|-------|
| **Local** | `~/.claude.json` | Privé, projet actuel seulement |
| **Project** | `.mcp.json` | Équipe, version control |
| **User** | `~/.claude.json` | Tous vos projets |

### Ressources MCP

Les serveurs MCP peuvent exposer des ressources référençables avec `@` :

```
@github:anthropic/claude-code
@notion:my-page
@database:customers
```

---

## 8. Memory et Contexte

### CLAUDE.md vs Auto Memory

| Aspect | CLAUDE.md | Auto Memory |
|--------|-----------|-------------|
| **Qui écrit** | Vous | Claude |
| **Contenu** | Instructions et règles | Apprentissages et patterns |
| **Scope** | Projet, utilisateur ou org | Par working tree |
| **Chargement** | Toute session | Toute session (200 premières lignes) |
| **Usage** | Standards de codage, workflows | Commandes build, debugging insights |

### Fichiers CLAUDE.md

#### Emplacements

| Scope | Location | Usage |
|-------|----------|------|
| **Managed policy** | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) | Organization-wide |
| **Project** | `./CLAUDE.md` ou `./.claude/CLAUDE.md` | Team-shared |
| **User** | `~/.claude/CLAUDE.md` | Personnel tous projets |

#### Structure Effective

```markdown
# Code style
- Use ES modules (import/export) syntax
- Destructure imports when possible

# Workflow
- Typecheck when done making code changes
- Prefer running single tests

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-instructions.md
```

#### Règles `.claude/rules/`

Pour les projets plus larges, organisez les instructions en fichiers multiples :

```
.claude/
├── CLAUDE.md           # Instructions principales
└── rules/
    ├── code-style.md   # Style guidelines
    ├── testing.md      # Testing conventions
    └── security.md     # Security requirements
```

**Règles avec scope de fichiers :**

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use standard error response format
```

### Auto Memory

#### Emplacement

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Index concis
├── debugging.md       # Notes debugging patterns
├── api-conventions.md # Décisions API
└── ...                # Fichiers thématiques
```

#### Activation/Désactivation

```bash
# Toggle via interface
/memory

# Via settings.json
{
  "autoMemoryEnabled": false
}

# Via environment variable
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
```

### Gestion du Contexte

| Commande | Action |
|----------|--------|
| `/clear` | Réinitialise le contexte entre tâches non liées |
| `/compact <instructions>` | Compacte avec instructions spécifiques |
| `/rewind` | Restaure état précédent (checkpoint) |
| `/btw` | Question rapide sans entrer dans l'historique |

---

## 9. Meilleures Pratiques

### Fournir des Critères de Vérification

Claude performe beaucoup mieux quand il peut vérifier son propre travail :

| ❌ Avant | ✅ Après |
|---------|---------|
| "implement a function that validates email addresses" | "write a validateEmail function. example test cases: [email protected] is true, invalid is false. run the tests after implementing" |
| "make the dashboard look better" | "[paste screenshot] implement this design. take a screenshot and compare" |
| "the build is failing" | "the build fails with this error: [paste error]. fix and verify. address root cause" |

### Explorer d'abord, Planifier ensuite

```
EXPLORE (10 min)
├─ Search for existing implementations
├─ Count occurrences of similar code
├─ Identify what can be removed
└─ Find components to compose

PLAN (minimal)
├─ List deletions planned
├─ List additions after deletions
└─ Verify nothing breaks

CODE (20-30 min)
├─ DELETE first
├─ THEN add
└─ Compose existing components

TEST (verify)
└─ Measure code reduction
```

### Fournir du Contexte Spécifique

| ❌ Trop vague | ✅ Spécifique |
|---------------|--------------|
| "add tests for foo.py" | "write a test for foo.py covering the edge case where user is logged out. avoid mocks" |
| "why does ExecutionFactory have weird api?" | "look through ExecutionFactory's git history and summarize how its api came to be" |
| "add a calendar widget" | "look at how existing widgets work on home page. HotDogWidget.php is good example. follow pattern" |
| "fix the login bug" | "users report login fails after timeout. check auth flow in src/auth/, especially token refresh" |

### Patterns d'Évitement

| Pattern | Problème | Solution |
|---------|----------|----------|
| **Kitchen sink session** | Context plein d'infos non pertinentes | `/clear` entre tâches non liées |
| **Correcting over and over** | Context pollué par approches échouées | Après 2 échecs, `/clear` et meilleur prompt |
| **Over-specified CLAUDE.md** | Claude ignore la moitié | Tailler ruthlessly, conversion en hook |
| **Trust-then-verify gap** | Implémentation plausible mais cassée | Toujours fournir vérification |
| **Infinite exploration** | Claude lit des centaines de fichiers | Scope narrow ou utiliser subagents |

### Communication Efficace

#### Poser des questions sur le codebase

- "How does logging work?"
- "How do I make a new API endpoint?"
- "What does `async move { ... }` do?"
- "What edge cases does `CustomerOnboardingFlowImpl` handle?"
- "Why does this code call `foo()` instead of `bar()`?"

#### Laisser Claude vous interviewer

```
I want to build [brief description]. Interview me in detail using AskUserQuestion.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs.
Don't ask obvious questions, dig into the hard parts.

Keep interviewing until covered, then write complete spec to SPEC.md.
```

---

## 10. Écosystème et Économie

### Architecture de l'Écosystème Claude Code

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  DEVELOPERS │◄──►│   PLUGINS    │◄──►│  MARKETPLACE │  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│         │                  │                    │          │
│         ▼                  ▼                    ▼          │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    SKILLS   │◄──►│      MCP     │◄──►│   INTEGRATIONS│  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│         │                  │                    │          │
│         └──────────────────┴────────────────────┘          │
│                            │                                │
│                            ▼                                │
│                  ┌──────────────────┐                       │
│                  │   CLAUDE CODE    │                       │
                  │   CORE ENGINE    │                       │
                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Modèle Économique

#### Pour les Développeurs

**Opportunités :**

1. **Développement de Plugins** - Créer et vendre des plugins spécialisés
2. **MCP Servers** - Construire des connecteurs pour services populaires
3. **Skills Marketplace** - Vendre des skills spécialisés par industrie
4. **Consulting** - Expertise en implémentation Claude Code
5. **Formation** - Cours et tutoriels sur l'écosystème

#### Types de Monétisation

| Type | Description | Exemple |
|------|-------------|---------|
| **Plugins Premium** | Fonctionnalités avancées payantes | Linters spécialisés, outils de migration |
| **MCP Connectors** | Intégrations enterprise | SAP, Salesforce, Jira enterprise |
| **Skills Packs** | Collections de skills par domaine | Finance, Healthcare, Legal |
| **Support Services** | Maintenance et support | SLA pour équipes enterprise |

### Technologies Connexes

| Technologie | Lien avec Claude Code |
|--------------|------------------------|
| **Agent SDK** | Créer des applications agents personnalisées |
| **Anthropic API** | Intégration Claude dans applications |
| **Model Context Protocol** | Standard ouvert pour IA-tools |
| **Chrome DevTools** | Debug UI avec extension Claude in Chrome |

### Stack Technique Recommandé

```
Frontend: Next.js 16, React 19.2, TypeScript (strict)
State: TanStack Suite (Router, Query, Form, Start)
Backend: Prisma, Supabase, NestJS (occasionnel)
Testing: Vitest, Playwright
CI/CD: GitHub Actions
Deployment: Vercel
```

---

## 11. Ressources et Communauté

### Documentation Officielle

| Ressource | URL |
|-----------|-----|
| **Claude Code Docs** | https://code.claude.com/docs |
| **Anthropic API Docs** | https://docs.anthropic.com |
| **GitHub Repository** | https://github.com/anthropics/claude-code |
| **Claude.ai** | https://claude.ai |

### Communauté

| Plateforme | Lien |
|------------|------|
| **Discord** | Claude Developers Discord |
| **Twitter/X** | @AnthropicAI |
| **GitHub Issues** | Report bugs et feature requests |

### Commandes Utiles

```bash
# Aide
/help

# Liste des skills
What skills are available?

# Mémoire
/memory

# Plugins
/plugin
/reload-plugins

# Agents
/agents

# MCP
/mcp

# Permissions
/permissions

# Hooks
/hooks

# Contexte
/context
/compact
/clear

# Git
/bug
```

### Variables d'Environnement

```bash
# Désactiver auto memory
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1

# Limite output MCP
MAX_MCP_OUTPUT_TOKENS=50000

# Tool search threshold
ENABLE_TOOL_SEARCH=auto:5

# Désactiver background tasks
CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1

# Additional directories CLAUDE.md
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1

# Désactiver claude.ai MCP servers
ENABLE_CLAUDEAI_MCP_SERVERS=false
```

### Guides Rapides

#### Prompt Engineering

1. **Be clear and direct** - Instructions explicites
2. **Use examples** - Multishot prompting
3. **Let Claude think** - Chain of thought
4. **Use XML tags** - Structurer les prompts
5. **Give Claude a role** - System prompts

#### Git Workflow

```bash
# Format des commits
TYPE: PROJECT_NAME - vX.Y.Z

- Change 1
- Change 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

#### Testing Strategy

- **Unit tests** - Vitest pour tests isolés
- **E2E tests** - Playwright pour flows utilisateur
- **Behavior testing** - Tester le comportement, pas l'implémentation
- **Coverage cible** - ≥80% (≥95% pour code critique)

---

## 📝 Conclusion

Ce guide couvre les fondamentaux de Claude Code Workflow pour les développeurs. L'écosystème évolue rapidement, avec :

- **Plugins** communautaires en croissance constante
- **MCP servers** pour de plus en plus de services
- **Skills** spécialisés par domaine
- **Best practices** qui émergent de la communauté

### Prochaines Étapes

1. **Expérimenter** - Créez vos premiers skills et plugins
2. **Contribuer** - Partagez vos créations avec la communauté
3. **Apprendre** - Suivez la documentation officielle
4. **Collaborer** - Rejoignez le Discord des développeurs

---

**Sources :**
- [Claude Code Documentation](https://code.claude.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)

---

*Document généré le 12 Mars 2026 - Basé sur la documentation officielle Anthropic*
