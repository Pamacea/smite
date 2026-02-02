# SMITE Core

Shared utilities, templates, and schemas for all SMITE plugins.

`★ Insight ─────────────────────────────────────`
**Why core exists:**
1. DRY principle - common patterns defined once, referenced everywhere
2. Consistency - all plugins follow the same standards
3. Type safety - JSON schemas validate configurations at load time
`─────────────────────────────────────────────────`

---

## Directory Structure

```
plugins/core/
├── templates/           # Reusable markdown templates
│   ├── command-header.md    # Standard frontmatter template
│   ├── warnings.md          # Common warning messages
│   ├── metadata.md          # Version/footer templates
│   └── plan-mode-first.md   # Planning template (OBLIGATORY)
├── validation/          # JSON schemas for config validation
│   └── schemas/
│       ├── design-styles.schema.json
│       ├── vaults.schema.json
│       ├── templates.schema.json
│       └── plugin.schema.json
├── parallel/            # Parallel execution infrastructure
│   ├── worktree-orchestrator.md  # Git worktree orchestration
│   └── parallel-task-template.md # Task assignment template
├── platform/            # Cross-platform utilities
│   └── platform-detector.md
├── dependency-resolution.md  # Plugin dependency patterns
└── README.md
```

---

## Usage

### Referencing Templates

In command files, use include-style references:

```markdown
<!-- @include ../../core/templates/warnings.md#MANDATORY -->
```

### Validation Schemas

Add schema reference to JSON configs:

```json
{
  "$schema": "../core/validation/schemas/design-styles.schema.json",
  ...
}
```

### Platform Detection

Use the platform detection pattern from `platform-detector.md`:

```bash
PLATFORM=$(detect_platform)
case $PLATFORM in
  windows) ... ;;
  mac) ... ;;
  linux) ... ;;
esac
```

---

## Templates Reference

### command-header.md

Standard frontmatter for command definitions.

**Variables:**
- `{{DESCRIPTION}}` - Command description
- `{{MODEL}}` - Default model (default: haiku)
- `{{ARGUMENT_HINT}}` - Command arguments
- `{{VERSION}}` - Version number

### warnings.md

Standard warning messages:
- MANDATORY: Use Toolkit First
- MANDATORY: MCP Tool Availability
- Platform Detection
- Error Handling Standards
- Git Best Practices

### plan-mode-first.md

**OBLIGATOIRE** avant toute action significative. Template de planification:

- Objectifs (quoi on veut accomplir)
- Scope (fichiers touchés)
- Approche (comment procéder)
- Risques (quoi pourrait mal tourner)
- Tests (comment valider)
- Critères de succès (quand c'est fini)

**À utiliser** avant de:
- Lancer des subagents
- Modifier >2 fichiers
- Créer nouveaux fichiers
- Refactoriser

### metadata.md

Standard footer templates:
- Command Footer
- Plugin Manifest
- SKILL.md Footer
- Version Changelog

---

## Validation Schemas

### design-styles.schema.json

Validates `design-styles.json`:
- Style definitions
- Color palettes
- Typography scales
- Layout configurations

### vaults.schema.json

Validates `vaults.json`:
- Vault configurations
- Folder mappings
- Template paths

### templates.schema.json

Validates note template definitions:
- Template variables
- Output paths
- Default tags

### plugin.schema.json

Validates `plugin.json`:
- Plugin metadata
- Dependencies
- MCP tool requirements
- Hook configurations

---

## Platform Detection

The platform detector provides cross-platform utilities:

```bash
detect_platform() {
  if uname | grep -qE "(MINGW|MSYS|CYGWIN)"; then
    echo "windows"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "mac"
  else
    echo "linux"
  fi
}
```

---

## Dependency Management

See `dependency-resolution.md` for:
- Plugin dependency patterns
- MCP tool availability checks
- Graceful degradation strategies
- Error message templates

---

## Parallel Execution

The parallel module provides Git worktree-based parallel execution for all SMITE agents.

**Usage:**
```bash
/implement --predator --parallel=3
/refactor --full --parallel=2
/explore --mode=deep --parallel=4
```

**How it works:**
1. Creates N Git worktrees alongside the main repository
2. Assigns each worktree a specific sub-task
3. Agents work in isolation, then merge results
4. Worktrees are cleaned up after completion

**Full documentation:** `parallel/worktree-orchestrator.md`

---

## Version

**Version**: 1.1.0
**Last Updated**: 2025-02-02

---

## Integration

**Used by:**
- `@smite/refactor`
- `@smite/explore`
- `@smite/implement`
- `@smite/agents`
- `@smite/basics`
- All future SMITE plugins
