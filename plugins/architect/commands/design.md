---
description: "Unified design, strategy, initialization, and creative thinking"
argument-hint: "--mode=[init|strategy|design|brainstorm] '<prompt>'"
---

# SMITE Architect

Complete project architecture from concept to implementation-ready specifications.

## Spec-First Mode

When executing with a spec file (provided in prompt):

1. **Read the spec completely** - Understand the architectural requirements
2. **Follow the design approach** - Use the specified approach in the spec
3. **Create detailed specs** - Generate comprehensive technical specifications
4. **Validate assumptions** - If architectural assumptions don't match reality, update spec first

## Toolkit Integration

When toolkit plugin is available, Architect can leverage:
- **Codebase Analysis** - Understand existing patterns using `ToolkitAPI.Search.semantic()`
- **Dependency Analysis** - Analyze architectural dependencies with `ToolkitAPI.DependencyGraph.build()`
- **Impact Assessment** - Evaluate architectural changes with `ToolkitAPI.Analysis.impact()`
- **Pattern Discovery** - Find existing patterns for consistency

## Usage

```bash
# Initialize new project
/design --mode=init "Build a SaaS dashboard for analytics"

# Define business strategy
/design --mode=strategy "Define pricing strategy for productivity tool"

# Create design system
/design --mode=design "Modern minimalist design for fintech app"

# Brainstorm solutions
/design --mode=brainstorm "How to improve user engagement"
```

## Modes

### MODE: INIT (Project Initialization)

Initialize new projects with tech stack and tooling.

```bash
/design --mode=init "<project description>"
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
/design --mode=init "Build a real-time chat application with WebSocket support"
```

### MODE: STRATEGY (Business Strategy)

Develop comprehensive business and market strategy.

```bash
/design --mode=strategy "<business question>"
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
/design --mode=strategy "Analyze project management market, define pricing tiers"
```

### MODE: DESIGN (Design System)

Create comprehensive design system and UI specifications.

```bash
/design --mode=design "<design requirements>"
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
/design --mode=design "Create a modern design system for a mobile fitness app"
```

### MODE: BRAINSTORM (Creative Thinking)

Facilitate creative problem-solving and ideation.

```bash
/design --mode=brainstorm "<problem or topic>"
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
/design --mode=brainstorm "Innovative features to increase user engagement"
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
- Then Finalize validates

## Workflow Example

Complete project architecture:

```bash
# Step 1: Initialize
/design --mode=init "Build a project management SaaS"

# Step 2: Strategy
/design --mode=strategy "Define pricing and revenue model"

# Step 3: Design
/design --mode=design "Create professional enterprise design system"

# Step 4: Brainstorm
/design --mode=brainstorm "Innovative collaboration features"

→ Complete architecture ready for Builder
```

## Integration

**Works with:**
- explore (analyze existing codebase)
- build (implement architecture)
- finalize (document decisions)
- ralph (full orchestration)

## Best Practices

1. **Be specific in your prompt** - More context = better architecture
2. **Follow the workflow** - Init → Strategy → Design → Brainstorm
3. **Review generated docs** - Ensure they meet your needs
4. **Iterate if needed** - Refine with follow-up prompts
