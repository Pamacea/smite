---
lazy_load: true
category: "template"
name: "command-header"
version: "2.0.0"
description: "Command frontmatter template with variable substitution for SMITE skills"
---

description: "{{DESCRIPTION}}"
model: {{MODEL|haiku}}
argument-hint: "{{ARGUMENT_HINT}}"
allowed-tools: {{ALLOWED_TOOLS|*}}
version: {{VERSION|1.0.0}}
last-updated: {{TODAY}}
---

# {{COMMAND_NAME}} - {{COMMAND_TITLE}}

{{SHORT_DESCRIPTION}}

---

## Usage

```bash
{{COMMAND_EXAMPLE}}
```

---

## Options

| Flag | Long Form | Purpose |
|------|-----------|---------|
{{OPTIONS_TABLE}}
