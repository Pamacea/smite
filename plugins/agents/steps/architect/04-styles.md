# Step 4: Generate Style Variations

**Flag**: None (automatic after research and analysis)

## Purpose

Generate 5 distinct UI style variations based on research findings and visual analysis. Each variation will be a complete, implementation-ready design specification.

## The 5 Style Frameworks

1. **Minimalist** - Clean, whitespace-focused, typography-driven
2. **Brutalist** - Raw, bold, high-contrast, unconventional
3. **Glassmorphism** - Translucent layers, blur effects, depth
4. **Neumorphism** - Soft shadows, extruded shapes, subtle
5. **Bento/Grid** - Card-based, modular, organized grid

## What To Do

For each style variation, create a complete specification:

```markdown
# Style Variation [N]: [Style Name]

## Design Philosophy
- [Description of the style's core principles]
- [Why it fits this project]
- [Key differentiators]

## Color Palette
### Semantic Colors
- Primary: `#HEX` - [Usage]
- Secondary: `#HEX` - [Usage]
- Accent: `#HEX` - [Usage]

### Functional Colors
- Background: `#HEX`
- Surface: `#HEX`
- Border: `#HEX`
- Text Primary: `#HEX`
- Text Secondary: `#HEX`
- Text Muted: `#HEX`

### Status Colors
- Success: `#HEX`
- Warning: `#HEX`
- Error: `#HEX`
- Info: `#HEX`

## Typography
### Font Families
- Headings: [Font Name]
- Body: [Font Name]
- Monospace: [Font Name] (optional)

### Type Scale
- Display: [Size] / [Weight] / [Line Height]
- H1: [Size] / [Weight] / [Line Height]
- H2: [Size] / [Weight] / [Line Height]
- H3: [Size] / [Weight] / [Line Height]
- Body: [Size] / [Weight] / [Line Height]
- Small: [Size] / [Weight] / [Line Height]
- Caption: [Size] / [Weight] / [Line Height]

## Spacing System
- Base unit: [X]px
- Scale: [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12] * base unit

## Border Radius
- Sm: [X]px - [Usage]
- Md: [X]px - [Usage]
- Lg: [X]px - [Usage]
- Full: [X]px - [Usage]

## Shadows
- Sm: [CSS shadow]
- Md: [CSS shadow]
- Lg: [CSS shadow]
- Xl: [CSS shadow]

## Component Examples

### Button
```tsx
// [Brief code example or description]
```
Variants: [Primary, Secondary, Ghost, etc.]

### Input
```tsx
// [Brief code example or description]
```
States: [Default, Focus, Error, Disabled]

### Card
```tsx
// [Brief code example or description]
```
Variants: [Default, Elevated, Outlined]

## Layout Principles
- Grid system: [Description]
- Container widths: [Sizes]
- Breakpoints: [Values]
- Spacing patterns: [Description]

## Unique Elements
- [Special component 1]: [Description]
- [Special component 2]: [Description]
- [Special pattern 1]: [Description]

## Implementation Notes
- Tailwind config needed: [Yes/No + details]
- Custom CSS needed: [Yes/No + details]
- Potential challenges: [List]
```

## Compile Master Document

After generating all 5 variations, create:

```markdown
# Design Style Variations

## Overview
[Brief summary of the project and the 5 proposed styles]

## Quick Comparison

| Style | Mood | Best For | Complexity |
|-------|------|----------|------------|
| Minimalist | Clean | Data-heavy apps | Low |
| Brutalist | Bold | Creative/edgy brands | Medium |
| Glassmorphism | Modern | Tech/SaaS products | High |
| Neumorphism | Soft | Mobile apps | High |
| Bento/Grid | Organized | Dashboard/multi-content | Medium |

## Detailed Variations
[Link or include each of the 5 style specs above]

## Recommendation
Based on [Project goals], we recommend: [Style Name]

**Reasons:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]
```

## Output

- ✅ 5 complete style specifications
- ✅ Master comparison document
- ✅ Recommendation based on project goals
- ✅ All saved to `.claude/.smite/design-styles.md`

## Next Step

Proceed to `05-preview.md` (use `-x` flag) to create interactive previews
