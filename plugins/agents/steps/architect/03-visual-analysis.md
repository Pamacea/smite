# Step 3: Visual Analysis

**Flag**: `-v` or `--vision`
**Optional Flag**: `-i <url>` or `--image <url>` to analyze specific image

## Purpose

Use Vision MCP to analyze reference images and extract concrete design patterns, layouts, and components.

## What To Do

### Option A: Analyze Research References (No -i flag)

1. **Select Top References**

From `design-research.md`, pick 5-8 most relevant images/URLs to analyze.

2. **Analyze Each Reference**

For each reference image or URL:

```markdown
## Analysis: [Reference Name/URL]

### Layout Structure
- Grid system: [Description]
- Hierarchy: [Primary/Secondary/Tertiary areas]
- Spacing pattern: [Description]
- Responsive behavior: [Observations]

### Color Scheme
- Primary colors: [Hex codes + usage]
- Secondary colors: [Hex codes + usage]
- Background/surface: [Hex codes]
- Accent colors: [Hex codes + where used]

### Typography
- Headings: [Font + weight + size]
- Body: [Font + weight + size]
- Hierarchy: [How sizes relate]

### Components Identified
- [Component 1]: [Style + interactions]
- [Component 2]: [Style + interactions]

### Visual Patterns
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

### What to Adopt
- [Specific element to use in our design]
```

### Option B: Analyze Specific Image (With -i flag)

1. **Get Image URL from user**

2. **Use Vision MCP**

```markdown
## Visual Analysis of User Image

### Overall Style
- Style category: [Minimalist/Brutalist/etc]
- Mood: [Description]
- Key characteristics: [List]

### Extractable Elements
1. [Element 1]: [How to recreate]
2. [Element 2]: [How to recreate]

### Technical Implementation Notes
- CSS techniques needed: [List]
- Layout approach: [Grid/Flex/absolute]
- Potential challenges: [List]
```

3. **MCP Tools to Use**

For URL analysis:
- `mcp__web-reader__webReader` - Fetch page content
- `mcp__zai-mcp-server__analyze_image` - Analyze screenshots

For direct image analysis:
- `mcp__zai-mcp-server__analyze_image` - Extract design elements
- `mcp__zai-mcp-server__ui_to_artifact` - Convert UI to code specs

4. **Compile Analysis Summary**

```markdown
# Visual Analysis Summary

## Common Patterns Across References
- [Pattern 1]: [Found in X references]
- [Pattern 2]: [Found in Y references]

## Color Trends
- Most common: [Colors]
- Unique combinations: [Colors]

## Layout Trends
- [Trend 1]: [Description]
- [Trend 2]: [Description]

## Component Patterns
### [Component Type]
- Style variations: [List]
- Interaction patterns: [List]

## Implementation Insights
- [Technical observation 1]
- [Technical observation 2]
```

## Output

- ✅ Visual analysis of 5-8 references
- ✅ Extracted design tokens (colors, typography, spacing)
- ✅ Identified component patterns
- ✅ Implementation notes for each pattern
- ✅ Saved to `.claude/.smite/visual-analysis.md`

## Next Step

Proceed to `04-styles.md` to generate 5 style variations based on research and analysis
