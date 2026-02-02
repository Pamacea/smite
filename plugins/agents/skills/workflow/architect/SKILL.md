# Architect Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Provide complete architectural guidance from project initialization to design specifications, ensuring specs are complete and implementation-ready.

## Core Workflow

1. **Input**: Project requirements or design prompt
2. **Process**:
   - Analyze existing codebase (using toolkit)
   - Choose tech stack or design approach
   - Generate specification in `.claude/.smite/current_spec.md`
   - Validate completeness (requirements, architecture, success criteria)
   - Lock spec for implementation
3. **Output**: Complete, validated spec for Builder implementation

## Key Principles

- **Spec-first**: Always generate spec before implementation
- **Analysis-driven**: Use toolkit to understand existing patterns
- **Completeness**: Specs must have all requirements, architecture, success criteria
- **Consistency**: Build on existing patterns, don't reinvent
- **Design tokens**: Use semantic naming for colors, spacing, typography

## Integration

- **Requires**: toolkit (semantic search for codebase analysis)
- **Reads from**: Existing codebase (via toolkit search)
- **Writes to**: `.claude/.smite/current_spec.md`
- **Feeds into**: builder (implements from locked spec)

## Modes

- **`--mode=init`**: Initialize new project (structure, configs, dependencies)
- **`--mode=strategy`**: Business strategy (market analysis, revenue model)
- **`--mode=design`**: Design system (tokens, components, patterns)
- **`--mode=brainstorm`**: Creative solutions (ideation, innovation)

## Configuration

- **Spec location**: `.claude/.smite/current_spec.md`
- **Spec format**: Markdown with sections (Overview, Requirements, Architecture, Success Criteria)
- **Tech detection**: Auto-detects based on project type (Next.js, Rust, Python)

## Error Handling

- **Incomplete spec**: Builder detects gaps and requests update
- **Tech mismatch**: Re-analyze and update tech stack section
- **Conflicting patterns**: Use toolkit to find established conventions
- **Missing requirements**: Validate all user stories have acceptance criteria

---
*Auto-generated from plugin.json - Last sync: 2025-01-22*
