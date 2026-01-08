---
description: Design system and UI/UX component creation
argument-hint: [--framework=react|nextjs] [--mode=design-system|components]
---

Create design system and UI components with design tokens.

**Frameworks:**
- `react` - React components with hooks and context
- `nextjs` - Server vs Client components, streaming

**Modes:**
- `design-system` - Design tokens, component library, style guide
- `components` - Specific UI components

**Output:**
- `aura-design-system.md` - Design system specification
- `aura-tokens.json` - Design tokens (colors, spacing, typography)
- Component library

**Usage:**
/smite-aura --framework=nextjs --mode=design-system
/smite-aura --framework=react --mode=components
