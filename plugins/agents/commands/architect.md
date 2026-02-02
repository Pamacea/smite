---
description: "Unified design, strategy, initialization, and creative thinking with MCP-powered design workflow"
argument-hint: "[--mode=init|strategy|design|brainstorm] [-w -v -i <url> -b -x --select=<style>] '<prompt>'"
---

# SMITE Architect

Complete project architecture from concept to implementation-ready specifications with **creative design workflow** powered by MCP tools.

## 🎨 NEW: Creative Design Workflow

The Architect agent now features a powerful creative workflow that leverages MCP tools to research, analyze, and generate 5 distinct UI style variations for your project.

### Workflow Options

```bash
# Step-by-step creative workflow
/architect -b                    # Step 1: Create design brief
/architect -w                    # Step 2: Web search for references
/architect -v [-i <url>]         # Step 3: Visual analysis (optional specific image)
# Step 4: Generate 5 style variations (automatic)
/architect -x                    # Step 5: Create preview workspace
/architect --select=<style>      # Step 6: Implement chosen style

# Or combine steps
/architect -b -w -v -x "Design a modern SaaS dashboard"
```

### Option Flags

| Flag | Long Form | Purpose |
|------|-----------|---------|
| `-b` | `--brief` | Create design brief from prompt |
| `-w` | `--websearch` | Research design trends via WebSearch MCP |
| `-v` | `--vision` | Analyze references via Vision MCP |
| `-i <url>` | `--image <url>` | Analyze specific image URL |
| `-x` | `--preview` | Create temporary workspace with 5 style previews |
| `--select=<style>` | `--select=<style>` | Implement chosen style (minimalist, brutalist, glassmorphism, neumorphism, bento) |

---

## ⚠️ MANDATORY: Use Toolkit First for Code Analysis

**BEFORE analyzing any existing codebase, you MUST:**

1. **Try `/toolkit search` for understanding existing patterns** - Avoid reinventing
2. **Try `/toolkit graph --impact` for dependency analysis** - Know blast radius
3. **Try `/toolkit explore` for finding architectural patterns** - 2x precision

**ONLY proceed with manual exploration if:**
- Toolkit is unavailable OR
- Toolkit explicitly fails to provide results

**Reference:** `plugins/toolkit/README.md` | `docs/DECISION_TREE.md`

---

## Creative Workflow Steps

### Step 1: Design Brief (`-b`)

Creates a comprehensive design brief based on your prompt.

**Output**: `.claude/.smite/design-brief.md`

```bash
/architect -b "Design a modern SaaS analytics dashboard"
```

### Step 2: Research (`-w`)

Uses WebSearch MCP to find design trends, patterns, and references.

**Output**: `.claude/.smite/design-research.md` with 15-30 curated references

```bash
/architect -w
```

### Step 3: Visual Analysis (`-v`)

Uses Vision MCP to analyze reference images and extract design patterns.

**Optional**: Use `-i <url>` to analyze a specific image.

**Output**: `.claude/.smite/visual-analysis.md` with extracted tokens and patterns

```bash
# Analyze research references
/architect -v

# Analyze specific image
/architect -v -i https://example.com/reference.png
```

### Step 4: Generate Styles (Automatic)

Generates 5 complete UI style variations based on research and analysis.

**Output**: `.claude/.smite/design-styles.md` with 5 complete specifications

The 5 styles:
1. **Minimalist** - Clean, whitespace-focused, typography-driven
2. **Brutalist** - Raw, bold, high-contrast, unconventional
3. **Glassmorphism** - Translucent layers, blur effects, depth
4. **Neumorphism** - Soft shadows, extruded shapes, subtle
5. **Bento/Grid** - Card-based, modular, organized grid

### Step 5: Preview (`-x`)

Creates a temporary Next.js workspace with interactive previews of all 5 styles.

**Output**: Running dev server at `http://localhost:3000/preview`

```bash
/architect -x
```

Launches the **frontend subagent** to implement each style as interactive components.

### Step 6: Implement (`--select=<style>`)

Implements the chosen style in your main project and cleans up preview workspace.

**Output**: Complete design system with design tokens, components, and Builder specification

```bash
/architect --select=minimalist
```

---

## Original Modes (Still Available)

These modes work alongside the creative workflow for different architectural needs.

### MODE: INIT (Project Initialization)

Initialize new projects with tech stack and tooling.

```bash
/architect --mode=init "<project description>"
```

**What it does:**
- Defines technical stack (Next.js, Rust, Python, etc.)
- Creates project structure
- Configures tooling (TypeScript, ESLint, Prettier)
- Sets up build pipeline
- Initializes git repository

**Output:**
- `docs/INIT_PLAN.md` - Initialization plan
- `docs/TECH_STACK.md` - Technology decisions
- Scaffolded project with tooling configured

**Example:**
```bash
/architect --mode=init "Build a real-time chat application with WebSocket support"
```

### MODE: STRATEGY (Business Strategy)

Develop comprehensive business and market strategy.

```bash
/architect --mode=strategy "<business question>"
```

**What it does:**
- Market analysis and competitive landscape
- Business model design
- Pricing strategy
- Revenue optimization
- Growth strategy

**Output:**
- `docs/STRATEGY_ANALYSIS.md` - Market analysis
- `docs/BUSINESS_MODEL.md` - Revenue model
- `docs/PRICING_STRATEGY.md` - Pricing tiers

**Example:**
```bash
/architect --mode=strategy "Analyze project management market, define pricing tiers"
```

### MODE: DESIGN (Design System)

Create comprehensive design system and UI specifications.

```bash
/architect --mode=design "<design requirements>"
```

**What it does:**
- Define visual identity (colors, typography)
- Create design tokens
- Specify UI components
- Design layouts and structures
- Document micro-interactions

**Output:**
- `docs/DESIGN_SYSTEM.md` - Complete design specs
- `docs/DESIGN_TOKENS.json` - Design tokens
- Component specifications with props and variants

**Example:**
```bash
/architect --mode=design "Create a modern design system for a mobile fitness app"
```

### MODE: BRAINSTORM (Creative Thinking)

Facilitate creative problem-solving and ideation.

```bash
/architect --mode=brainstorm "<problem or topic>"
```

**What it does:**
- Generate innovative ideas
- Explore multiple perspectives
- Challenge assumptions
- Find unconventional solutions
- Prioritize recommendations

**Output:**
- `docs/BRAINSTORM_SESSION.md` - Ideas and solutions
- Ranked list of recommendations
- Implementation suggestions

**Example:**
```bash
/architect --mode=brainstorm "Innovative features to increase user engagement"
```

## When To Use

**Use Architect when:**
- Starting a new project (mode=init)
- Planning business strategy (mode=strategy)
- Creating design system (mode=design)
- Solving complex problems (mode=brainstorm)

**Before Builder:**
- Run Architect first to define specs
- Then Builder implements

## Workflow Example

Complete project architecture:

```bash
# Step 1: Initialize
/architect --mode=init "Build a project management SaaS"

# Step 2: Strategy
/architect --mode=strategy "Define pricing and revenue model"

# Step 3: Design
/architect --mode=design "Create professional enterprise design system"

# Step 4: Brainstorm
/architect --mode=brainstorm "Innovative collaboration features"

→ Complete architecture ready for Builder
```

## Integration

**Works with:**
- /builder (implement architecture)
- /refactor (improve quality)
- ralph (full orchestration)

## Best Practices

1. **Be specific in your prompt** - More context = better architecture
2. **Follow the workflow** - Init → Strategy → Design → Brainstorm
3. **Review generated docs** - Ensure they meet your needs
4. **Iterate if needed** - Refine with follow-up prompts

---

## MCP Tools Integration

The creative workflow leverages these MCP tools:

### WebSearch MCP
- **Purpose**: Research current design trends, find inspiration, discover patterns
- **Used in**: Step 2 (`-w` flag)
- **Queries**: Design trends, color palettes, layout patterns, component inspiration
- **Output**: 15-30 curated references with URLs

### Vision MCP
- **Purpose**: Analyze reference images to extract design tokens and patterns
- **Used in**: Step 3 (`-v` flag)
- **Capabilities**:
  - `mcp__zai-mcp-server__analyze_image` - Extract design elements
  - `mcp__zai-mcp-server__ui_to_artifact` - Convert UI to code specs
  - `mcp__web-reader__webReader` - Fetch page content
- **Output**: Color schemes, typography, spacing, component patterns

### Chrome DevTools MCP
- **Purpose**: Inspect live websites for implementation patterns
- **Used in**: Optional for deeper research
- **Capabilities**: Extract computed styles, analyze responsive breakpoints
- **Output**: Technical implementation insights

---

## Subagent Collaboration

### Frontend Subagent
- **Purpose**: Implement design specifications as production-ready components
- **Launched by**: Step 5 (`-x` flag) for preview creation
- **Capabilities**:
  - Pixel-perfect component implementation
  - Design token integration
  - Responsive layouts
  - Accessibility (WCAG AA)
- **Output**: Working Next.js components in preview workspace

### UX Subagent
- **Purpose**: Refine designs for optimal usability and accessibility
- **Launched by**: Step 6 for final refinements
- **Capabilities**:
  - Heuristic evaluation
  - Accessibility audit
  - User flow analysis
  - Micro-interaction design
- **Output**: Refined design with improved UX

---

## Creative Workflow Example

Complete design process for a SaaS dashboard:

```bash
# 1. Create design brief
/architect -b "Design a modern SaaS analytics dashboard for e-commerce"

# 2. Research trends and patterns
/architect -w
# Searches: "SaaS dashboard design 2025", "analytics dashboard patterns", etc.

# 3. Analyze visual references
/architect -v
# Or analyze specific image:
/architect -v -i https://dribbble.com/shots/xyz

# 4. (Automatic) Generate 5 style variations
# Creates: minimalist, brutalist, glassmorphism, neumorphism, bento specs

# 5. Create interactive previews
/architect -x
# Creates temporary Next.js workspace with all 5 styles
# Launches frontend subagent for implementation
# Dev server: http://localhost:3000/preview

# 6. User browses previews, chooses style

# 7. Implement chosen style
/architect --select=glassmorphism
# Implements design system in main project
# Cleans up preview workspace
# Generates Builder specification
```

---

## Output Files

### Creative Workflow Outputs

| File | Location | Purpose |
|------|----------|---------|
| Design Brief | `.claude/.smite/design-brief.md` | Project requirements and goals |
| Research Summary | `.claude/.smite/design-research.md` | Curated references and trends |
| Visual Analysis | `.claude/.smite/visual-analysis.md` | Extracted design tokens |
| Style Variations | `.claude/.smite/design-styles.md` | 5 complete style specifications |
| Final Spec | `.claude/.smite/final-design-spec.md` | Implementation-ready spec |

### Traditional Mode Outputs

| Mode | Files |
|------|-------|
| init | `docs/INIT_PLAN.md`, `docs/TECH_STACK.md` |
| strategy | `docs/STRATEGY_ANALYSIS.md`, `docs/BUSINESS_MODEL.md` |
| design | `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKENS.json` |
| brainstorm | `docs/BRAINSTORM_SESSION.md` |

---

## Design Styles Reference

See `plugins/agents/config/design-styles.json` for complete specifications of all 5 styles.

Quick reference:
- **minimalist**: Low complexity, clean, professional
- **brutalist**: Medium complexity, bold, edgy
- **glassmorphism**: High complexity, modern, futuristic
- **neumorphism**: High complexity, soft, subtle
- **bento**: Medium complexity, organized, structured

---
