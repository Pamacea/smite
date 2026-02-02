# Step 6: Final Implementation

**Flag**: `--select=<style-name>`

## Purpose

Implement the chosen style in the main project, clean up the preview workspace, and prepare implementation specifications for the Builder agent.

## What To Do

### 1. Confirm User Selection

```markdown
# Style Confirmed: [Style Name]

You selected: [Style Name]

## Implementation Plan
- Extract design tokens from preview
- Create Tailwind config / CSS variables
- Build base components
- Implement sample layouts
- Generate specification for Builder

Proceeding with implementation...
```

### 2. Create Design System Files

#### A. Design Tokens

`src/styles/design-tokens.ts`:

```typescript
export const designTokens = {
  colors: {
    primary: '#HEX',
    secondary: '#HEX',
    // ... all colors
  },
  typography: {
    heading: { fontFamily: '...', sizes: { /* ... */ } },
    body: { fontFamily: '...', sizes: { /* ... */ } },
  },
  spacing: {
    // spacing scale
  },
  borderRadius: {
    sm: 'Xpx',
    md: 'Xpx',
    lg: 'Xpx',
  },
  shadows: {
    sm: '...',
    md: '...',
    lg: '...',
  },
};
```

#### B. Tailwind Config (if using Tailwind)

Update `tailwind.config.ts`:

```typescript
import { designTokens } from './src/styles/design-tokens';

export default {
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: designTokens.typography,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
    },
  },
};
```

#### C. Base Components

Create atomic components in `src/components/ui/`:

```typescript
// Button.tsx
export function Button({ variant, size, children }) {
  // Implement based on chosen style
}

// Input.tsx
// Card.tsx
// etc.
```

### 3. Create Sample Layout

Implement a realistic sample layout:

```typescript
// src/app/[project-route]/page.tsx
export default function SamplePage() {
  return (
    <main className="[style-name]-layout">
      {/* Showcase the style in action */}
    </main>
  );
}
```

### 4. Generate Builder Specification

Create `.claude/.smite/final-design-spec.md`:

```markdown
# Design Specification: [Project Name]

## Selected Style
**Style**: [Style Name]
**Date**: [Timestamp]

## Design System

### Color Palette
[Complete color specification]

### Typography
[Complete typography specification]

### Spacing & Layout
[Complete spacing system]

### Components
[Component specifications with props and variants]

## Implementation Guidelines

### Technical Stack
- Framework: [Next.js/React/etc]
- Styling: [Tailwind/CSS Modules/etc]
- Component Library: [Custom/Shadcn/etc]

### File Structure
```
src/
├── styles/
│   ├── design-tokens.ts
│   └── globals.css
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
└── app/
    └── [routes]
```

### Component Guidelines
- Use [pattern] for state management
- Follow [naming convention]
- Implement [accessibility features]

### Responsive Breakpoints
- Mobile: [max-width]
- Tablet: [min-width]
- Desktop: [min-width]

## Success Criteria
- [ ] All components implemented
- [ ] Responsive on all breakpoints
- [ ] Accessible (WCAG AA)
- [ ] Performance optimized
- [ ] TypeScript strict mode

## Next Steps
1. Builder agent implements remaining features
2. Test component interactions
3. Verify responsive behavior
4. Accessibility audit
```

### 5. Clean Up Preview Workspace

```bash
# Remove temporary workspace
rm -rf .claude/.smite/preview-workspace

# Or archive for reference
mv .claude/.smite/preview-workspace .claude/.smite/preview-archive-[timestamp]
```

### 6. Update Project Documentation

Update `docs/DESIGN_SYSTEM.md` (if exists):

```markdown
# Design System

## Style
**Based on**: [Style Name] variation
**Last updated**: [Date]

## Design Tokens
[Link to design-tokens.ts]

## Component Library
[Documentation of UI components]

## Usage Examples
[Code examples]
```

## Subagent Usage

Use the **ux** subagent for final refinement:

```typescript
// Launch UX agent
Agent: ux
Task: Refine implemented design
Context:
  - Chosen style: [Style Name]
  - Implemented components: [List]
  - User feedback: [Any feedback from preview]
Output: Refined design with improved UX
```

Use the **frontend** subagent for implementation:

```typescript
// Launch frontend agent
Agent: frontend
Task: Implement chosen style in main project
Context:
  - Style: [Style Name]
  - Design tokens: [From preview]
  - Target: Main project src/
Output: Complete design system implementation
```

## Output

- ✅ Design tokens implemented in main project
- ✅ Base components created
- ✅ Sample layout implemented
- ✅ Builder specification generated
- ✅ Preview workspace cleaned up
- ✅ Documentation updated

## Handoff to Builder

The Builder agent can now use:
- `.claude/.smite/final-design-spec.md` - Complete specification
- `src/styles/design-tokens.ts` - Reusable tokens
- `src/components/ui/` - Base components

## Success Criteria

- [ ] User's chosen style fully implemented
- [ ] No leftover preview files
- [ ] Builder specification is complete
- [ ] Documentation is up to date
- [ ] Project is ready for feature implementation

---

**Workflow Complete!** 🎉

The design is now ready for the Builder agent to implement features using this design system.
