# Step 1: Design Brief Creation

**Flag**: `-b` or `--brief`

## Purpose

Create a comprehensive design brief based on the user's prompt. This brief will guide all subsequent design decisions.

## What To Do

1. **Analyze User Prompt**
   - Extract core requirements
   - Identify project type (SaaS, e-commerce, portfolio, etc.)
   - Note any specific constraints or preferences

2. **Create Design Brief**

### Template

```markdown
# Design Brief: [Project Name]

## Project Overview
- **Type**: [SaaS/E-commerce/Portfolio/etc]
- **Goal**: [Primary objective]
- **Target Audience**: [Who will use this]

## Functional Requirements
- [Key feature 1]
- [Key feature 2]
- [Key feature 3]

## Brand Attributes
- **Tone**: [Professional/Playful/Minimal/etc]
- **Keywords**: [3-5 adjectives describing the vibe]
- **Constraints**: [Technical or design limitations]

## Technical Context
- **Framework**: [Next.js/React/Vue/etc]
- **Styling**: [Tailwind/CSS Modules/etc]
- **Device Priority**: [Mobile-first/Desktop-first/Responsive]

## Success Criteria
- [ ] [Specific measurable outcome]
- [ ] [Another success metric]

## References Provided
- [List any URLs or images provided by user]
```

3. **Save Brief**
   - Location: `.claude/.smite/design-brief.md`
   - Confirm with user before proceeding

## Output

- ✅ Design brief document saved
- ✅ User confirmation received
- ✅ Ready for research phase

## Next Step

Proceed to `02-research.md` (use `-w` flag)
