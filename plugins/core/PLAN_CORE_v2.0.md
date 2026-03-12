# Plan d'Amélioration - Core Plugin v2.0.0

> **Version actuelle:** 1.6.5 | **Cible:** 2.0.0
> **Date:** 12 Mars 2026

---

## 📋 État Actuel

**Fonctionnalités existantes:**
- Infrastructure partagée (templates, validation, platform, parallel)
- Système d'intégration (lazy loading, model routing, agent memory)
- Hooks registry et configuration
- Détection de plateforme cross-platform
- Système de templates markdown

**Points forts:**
- Architecture modulaire bien conçue
- TypeScript strict avec types exports
- Documentation infrastructure complète

**Faiblesses identifiées:**
- Pas de lazy_load sur les skills/templates
- Pas de hooks centralisés (hooks.json)
- Pas de scripts cross-platform
- Pas de MCP integration
- Documentation dual-layout manquante (GUIDE.md, REFERENCE.md)
- Pas de tracking métriques

---

## 🎯 Objectifs v2.0.0

### 1. Lazy Loading System

**Actuellement:** Le lazy loading existe dans `skill-loader.ts` mais n'est pas appliqué uniformément

**Proposition:**
- Ajouter `lazy_load: true` à tous les templates infrastructure
- Créer un index léger des templates au démarrage
- Charger le contenu complet uniquement à la demande

**Bénéfice:** 40-60% réduction des tokens au démarrage

### 2. Hooks Centralization

**Actuellement:** Chaque plugin gère ses hooks indépendamment

**Proposition:**
```
plugins/core/
├── hooks/
│   ├── hooks.json              # Hooks globaux partagés
│   ├── registry.ts             # Registre central
│   └── dispatcher.ts           # Dispatcher d'événements
```

**Hooks globaux:**
- `SessionStart` → Initialise core + lazy loading
- `PreToolUse` → Validation partagée
- `PostToolUse` → Telemetry partagée
- `Stop` → Cleanup + métriques

### 3. Cross-Platform Scripts

**Actuellement:** Pas de scripts dans core (utilisation dans autres plugins)

**Proposition:**
```
plugins/core/
├── scripts/
│   ├── init-core.js            # Initialisation core
│   ├── validate-plugin.js       # Validation plugin
│   ├── detect-platform.js      # Détection plateforme
│   └── template-renderer.js    # Rendu templates
```

**Caractéristiques:**
- Node.js pour portabilité Win/Mac/Linux
- Utilitaires CLI réutilisables
- Integration avec les hooks

### 4. MCP Integration

**Actuellement:** Aucune intégration MCP dans core

**Proposition:**
```
plugins/core/
├── mcp/
│   ├── core-server.js           # MCP server principal
│   ├── template-server.js       # Template access MCP
│   ├── validation-server.js     # Schema validation MCP
│   └── package.json
```

**Outils MCP:**
- `get_template` - Récupérer un template
- `render_template` - Rendre avec variables
- `validate_schema` - Valider contre schema
- `list_templates` - Lister templates disponibles
- `get_platform_info` - Infos plateforme

### 5. Dual-Layout Documentation

**Actuellement:** README.md + documentation infrastructure/

**Proposition:**
- `README.md` - 30-second hook (existant, à mettre à jour v2.0.0)
- `GUIDE.md` - Guide complet 5-minute storytelling (NOUVEAU)
- `REFERENCE.md` - Cheat sheet rapide (NOUVEAU)

### 6. Metrics & Telemetry

**Actuellement:** Telemetry existe mais pas centralisé dans core

**Proposition:**
```
plugins/core/
├── metrics/
│   ├── collector.ts            # Collecte métriques
│   ├── aggregator.ts           # Agrège les stats
│   └── reporter.ts              # Rapporte les stats
```

**Métriques collectées:**
- Template usage (les plus utilisés)
- Schema validation (erreurs fréquentes)
- Platform distribution (Win/Mac/Linux)
- Hook performance (latence)
- Lazy loading efficacy (token savings)

---

## 📁 Structure Cible v2.0.0

```
plugins/core/
├── .claude-plugin/
│   └── plugin.json              # v2.0.0
│
├── infrastructure/              # (EXISTANT - à mettre à jour)
│   ├── templates/              # Ajouter lazy_load frontmatter
│   ├── validation/
│   ├── platform/
│   ├── parallel/
│   └── docs/                   # Mettre à jour pour v2.0.0
│
├── src/                         # (EXISTANT - à compléter)
│   ├── config/
│   ├── hooks/                  # Ajouter hooks centralisés
│   ├── platform/
│   ├── template/
│   ├── utils/
│   ├── metrics/                # NOUVEAU
│   └── index.ts
│
├── integration/                 # (EXISTANT - à mettre à jour)
│   ├── smite-integrator.ts
│   ├── model-router.ts
│   ├── hooks.ts
│   ├── index.ts
│   └── README.md
│
├── skills/                      # (EXISTANT - à mettre à jour)
│   ├── skill-loader.ts         # Améliorer avec lazy_load
│   └── template-loader.ts      # NOUVEAU
│
├── memory/                      # (EXISTANT)
│   └── agent-memory.ts
│
├── mcp/                         # NOUVEAU
│   ├── core-server.js
│   ├── template-server.js
│   ├── validation-server.js
│   └── package.json
│
├── scripts/                     # NOUVEAU
│   ├── init-core.js
│   ├── validate-plugin.js
│   ├── detect-platform.js
│   └── template-renderer.js
│
├── hooks/                       # NOUVEAU
│   └── hooks.json              # Hooks centralisés
│
├── examples/                    # (EXISTANT - à mettre à jour)
│   ├── simple-plugin/
│   └── advanced-plugin/
│
├── tests/                       # NOUVEAU
│   ├── unit/
│   └── integration/
│
├── README.md                    # Mettre à jour v2.0.0
├── GUIDE.md                     # NOUVEAU
├── REFERENCE.md                 # NOUVEAU
├── PLAN_v2.0.md                 # Ce fichier
└── package.json                 # NOUVEAU
```

---

## 🚀 Phases d'Implémentation

### Phase 1: Documentation & Configuration (Priorité HAUTE)

**Délai:** 1-2 heures

**Tâches:**
1. Créer `GUIDE.md` - Guide complet 5-minute storytelling
2. Créer `REFERENCE.md` - Cheat sheet rapide
3. Mettre à jour `README.md` - Version 2.0.0
4. Mettre à jour `.claude-plugin/plugin.json` - Nouvelles capabilities

**Livraison:**
- Documentation dual-layout complète
- Configuration plugin.json v2.0.0

### Phase 2: Lazy Loading Templates (Priorité HAUTE)

**Délai:** 2-3 heures

**Tâches:**
1. Ajouter frontmatter avec `lazy_load: true` à tous les templates
2. Créer `skills/template-loader.ts` - Lazy loader pour templates
3. Créer index léger des templates
4. Intégrer avec `skill-loader.ts` existant

**Templates à mettre à jour:**
- `command-header.md`
- `warnings.md`
- `metadata.md`
- `plan-mode-first.md`

**Livraison:**
- Templates avec lazy_load
- TemplateLoader fonctionnel
- 40-60% réduction tokens

### Phase 3: Hooks Centralization (Priorité MOYENNE)

**Délai:** 2-3 heures

**Tâches:**
1. Créer `hooks/hooks.json` - Configuration centralisée
2. Créer `hooks/registry.ts` - Registre partagé
3. Créer `hooks/dispatcher.ts` - Dispatcher d'événements
4. Mettre à jour `integration/hooks.ts` - Utiliser registre central

**Hooks partagés:**
- `SessionStart` → Init core + lazy loading
- `PreToolUse` → Validation template
- `PostToolUse` → Tracking usage
- `Stop` → Métriques + cleanup

**Livraison:**
- Hooks centralisés fonctionnels
- Registry partagée
- Documentation hooks

### Phase 4: Cross-Platform Scripts (Priorité MOYENNE)

**Délai:** 2-3 heures

**Tâches:**
1. Créer `scripts/init-core.js` - Initialisation core
2. Créer `scripts/validate-plugin.js` - Validation plugin
3. Créer `scripts/detect-platform.js` - Détection plateforme
4. Créer `scripts/template-renderer.js` - Rendu templates
5. Créer `package.json` - Scripts npm

**Scripts Win/Mac/Linux friendly:**
- Utiliser Node.js pour portabilité
- Éviter bash/PowerShell spécifiques
- Générer scripts natifs si besoin

**Livraison:**
- 4 scripts cross-platform
- package.json avec scripts
- Documentation scripts

### Phase 5: MCP Integration (Priorité BASSE)

**Délai:** 3-4 heures

**Tâches:**
1. Créer `mcp/core-server.js` - MCP server principal
2. Créer `mcp/template-server.js` - Template access MCP
3. Créer `mcp/validation-server.js` - Schema validation MCP
4. Créer `mcp/package.json` - Dépendances MCP
5. Documentation MCP tools

**Outils MCP:**
- `get_template` - Récupérer template
- `render_template` - Rendre avec variables
- `validate_config` - Valider config
- `list_templates` - Lister templates
- `get_platform` - Infos plateforme

**Livraison:**
- 3 MCP servers fonctionnels
- Documentation MCP
- Integration test

### Phase 6: Metrics & Telemetry (Priorité BASSE)

**Délai:** 2-3 heures

**Tâches:**
1. Créer `src/metrics/collector.ts`
2. Créer `src/metrics/aggregator.ts`
3. Créer `src/metrics/reporter.ts`
4. Intégrer avec hooks
5. Créer dashboard métriques

**Métriques:**
- Template usage
- Validation errors
- Platform stats
- Hook performance
- Token savings

**Livraison:**
- Système métriques fonctionnel
- Dashboard basique
- Reporting automatique

### Phase 7: Tests & Validation (Priorité MOYENNE)

**Délai:** 2-3 heures

**Tâches:**
1. Créer `tests/unit/` - Tests unitaires
2. Créer `tests/integration/` - Tests intégration
3. Mettre à jour `integration/run-tests.ts`
4. Documentation testing

**Tests à couvrir:**
- Lazy loading templates
- Hooks registry
- Scripts cross-platform
- MCP servers
- Metrics collection

**Livraison:**
- Suite de tests complète
- >80% couverture
- Documentation tests

---

## 📊 Métriques de Succès

### Token Optimization
- **Avant:** ~15k tokens au chargement core
- **Après:** ~6k tokens (60% réduction)

### Performance
- **Lazy loading:** <100ms pour charger template
- **Hooks:** <50ms overhead par hook
- **Scripts:** <500ms exécution

### Qualité
- **Tests:** >80% couverture
- **Documentation:** Dual-layout complète
- **Cross-platform:** 100% scripts Win/Mac/Linux

---

## 🔄 Dépendances

### Plugins dépendants de core:
- **studio** - Utilise templates, validation, hooks
- **agents** - Utilise lazy loading, hooks
- **essentials** - Utilise hooks, platform detection

### Ordre de mise à jour:
1. **core** (d'abord)
2. **studio** (dès que core v2.0.0 prêt)
3. **agents** (dès que core v2.0.0 prêt)
4. **essentials** (dès que core v2.0.0 prêt)

---

## ✅ Checklist Finale

Phase 1: Documentation
- [ ] GUIDE.md créé
- [ ] REFERENCE.md créé
- [ ] README.md mis à jour v2.0.0
- [ ] plugin.json mis à jour v2.0.0

Phase 2: Lazy Loading
- [ ] Templates avec lazy_load
- [ ] TemplateLoader créé
- [ ] Index templates créé
- [ ] Intégration skill-loader

Phase 3: Hooks
- [ ] hooks/hooks.json créé
- [ ] hooks/registry.ts créé
- [ ] hooks/dispatcher.ts créé
- [ ] integration/hooks.ts mis à jour

Phase 4: Scripts
- [ ] init-core.js créé
- [ ] validate-plugin.js créé
- [ ] detect-platform.js créé
- [ ] template-renderer.js créé
- [ ] package.json créé

Phase 5: MCP
- [ ] core-server.js créé
- [ ] template-server.js créé
- [ ] validation-server.js créé
- [ ] mcp/package.json créé
- [ ] Documentation MCP

Phase 6: Metrics
- [ ] collector.ts créé
- [ ] aggregator.ts créé
- [ ] reporter.ts créé
- [ ] Dashboard créé
- [ ] Intégration hooks

Phase 7: Tests
- [ ] Tests unitaires créés
- [ ] Tests intégration créés
- [ ] run-tests.ts mis à jour
- [ ] Documentation tests

---

## 🎯 Bénéfices Attendus

### Pour les développeurs
- Templates plus rapides à charger
- Hooks centralisés plus faciles à utiliser
- Scripts cross-platform réutilisables
- MCP access pour automation

### Pour les plugins
- Dépendances core plus claires
- Lazy loading systematique
- Hooks partagés au lieu de dupliquer
- Metrics partagés

### Pour l'écosystème SMITE
- Cohérence accrue entre plugins
- Performance améliorée (lazy loading)
- Maintenance simplifiée (centralisation)
- Extensibilité facilitée (MCP)

---

**Version:** 2.0.0 | **Date:** 12 Mars 2026
**Auteur:** Claude Opus 4.6 | **Basé sur:** SMITE v4.0.0
