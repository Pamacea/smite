---
description: Automatically detect project context and route to the best smite agent
argument-hint: [--auto] [--explain] [--force]
---

Intelligent routing agent that analyzes your project and selects the most appropriate SMITE agent automatically.

**Features:**

- Auto-detects programming language (TypeScript, Rust, Python, Go)
- Auto-detects frameworks (Next.js, React, Angular, Actix, FastAPI)
- Analyzes project structure and dependencies
- Suggests optimal agent with correct flags
- Explains reasoning for each choice

**Usage:**

**Auto mode (recommended):**

```
*start-s_router
```

Automatically analyzes the project and suggests the best agent for your task.

**With explanation:**

```
*start-s_router --explain
```

Shows detailed reasoning about why a specific agent was chosen.

**Custom framework:**

```
*start-s_router --framework=custom
```

When using a framework not natively supported, the router will:

- Detect it as "custom framework"
- Suggest using smite-constructor without --tech flag
- Allow you to specify framework-specific patterns

**Manual override:**

```
*start-s_router --agent=constructor --mode=custom
```

Force specific agent selection with custom mode.

**Examples:**

```bash
# Working on Next.js project
*start-s_router
→ Detects: Next.js + TypeScript
→ Suggests: smite-constructor --tech=nextjs

# Working on Rust project
*start-s_router
→ Detects: Rust + Actix
→ Suggests: smite-constructor --tech=rust

# Need to analyze codebase
*start-s_router --task=analyze
→ Suggests: smite-explorer

# Technical debt detected
*start-s_router --task=refactor
→ Detects: any types, TODOs
→ Suggests: smite-surgeon
```

**Detection Priority:**

1. **Language Detection:**
   - `tsconfig.json` → TypeScript
   - `Cargo.toml` → Rust
   - `pyproject.toml` → Python
   - `go.mod` → Go

2. **Framework Detection:**
   - `next.config.js` → Next.js
   - `angular.json` → Angular
   - `vite.config.ts` → Vite
   - `Cargo.toml` dependencies → Axum/Actix

3. **Project Type Detection:**
   - `src/pages/` or `app/` → Next.js App Router
   - `src/components/` → Component Library
   - `migrations/` → Full-stack

**Auto-routing Table:**

| Context              | Agent             | Flags            |
| -------------------- | ----------------- | ---------------- |
| TypeScript + Next.js | smite-constructor | `--tech=nextjs`  |
| Rust + Axum          | smite-constructor | `--tech=rust`    |
| Python + FastAPI     | smite-constructor | `--tech=python`  |
| Code analysis needed | smite-explorer    | `--task=analyze` |
| Documentation needed | smite-handover    | -                |
| Lint errors          | linter-sentinel   | `--mode=fix`     |
