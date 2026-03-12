---
lazy_load: true
category: "template"
name: "metadata"
version: "2.0.0"
description: "Standard metadata templates for consistent documentation - command footers, plugin manifests, skill footers, changelogs"
---

# SMITE Core - Metadata Templates

Standard metadata templates for consistent documentation across all plugins.

---

## Command Footer Template

```markdown
---

## Version

**Version**: {{VERSION}}
**Last Updated**: {{LAST_UPDATED}}

## Integration

**Works with:**
{{WORKS_WITH_LIST}}

## Best Practices

{{BEST_PRACTICES_LIST}}

## When To Use

**Use {{COMMAND_NAME}} when:**
{{USE_CASE_LIST}}

**Before {{COMMAND_NAME}}:**
{{PREREQUISITES}}
```

---

## Plugin Manifest Template

```json
{
  "name": "{{PLUGIN_NAME}}",
  "description": "{{PLUGIN_DESCRIPTION}}",
  "version": "{{VERSION}}",
  "author": {
    "name": "Pamacea",
    "email": "[email protected]"
  },
  "homepage": "https://github.com/Pamacea/smite/tree/main/plugins/{{PLUGIN_NAME}}",
  "repository": "https://github.com/Pamacea/smite",
  "license": "MIT",
  "keywords": [{{KEYWORDS}}],
  "commands": "./commands/",
  "skills": "./skills/",
  "dependencies": {
    "required": [{{REQUIRED_PLUGINS}}],
    "optional": [{{OPTIONAL_PLUGINS}}]
  }
}
```

---

## SKILL.md Footer Template

```markdown
---

## Auto-Generated Content

**Last sync**: {{TODAY}}
**Source**: `plugins/{{PLUGIN_NAME}}/commands/{{COMMAND_FILE}}`

This skill is automatically synchronized with its command definition.
Changes to the command file will be reflected here.
```

---

## Version Changelog Format

```markdown
## [VERSION] - [DATE]

### Added
- New feature 1
- New feature 2

### Changed
- Updated behavior 1
- Modified behavior 2

### Fixed
- Bug fix 1
- Bug fix 2

### Removed
- Deprecated feature 1
```
