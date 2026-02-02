# Step 5: Interactive Preview

**Flag**: `-x` or `--preview`

## Purpose

Create a temporary subworkspace, implement all 5 style variations as actual UI components, and provide interactive previews for the user to choose from.

## What To Do

### 1. Create Temporary Subworkspace

```bash
# Create isolated workspace
mkdir -p .claude/.smite/preview-workspace
cd .claude/.smite/preview-workspace

# Initialize minimal Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --yes --app --src-dir --import-alias "@/*"

# Create style preview pages
mkdir -p src/app/preview/styles
```

### 2. Implement Each Style Variation

For each of the 5 styles:

#### A. Create Style-Specific Design Tokens

`src/styles/[style-name].css` or Tailwind config:

```css
/* Example: minimalist.css */
:root {
  --color-primary: #0F172D;
  --color-secondary: #64748B;
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  /* ... more tokens */
}
```

#### B. Create Preview Components

`src/app/preview/styles/[style-name]/page.tsx`:

```tsx
export default function StylePreview() {
  return (
    <div className="preview-container">
      {/* Show all common components in this style */}
      <section className="components-showcase">
        {/* Buttons */}
        {/* Inputs */}
        {/* Cards */}
        {/* Navigation */}
        {/* Sample Layout */}
      </section>

      {/* Interactive element examples */}
      <section className="interactive-examples">
        {/* Hover states */}
        {/* Focus states */}
        {/* Animations */}
      </section>

      {/* Sample application UI */}
      <section className="sample-ui">
        {/* Realistic component composition */}
      </section>
    </div>
  );
}
```

#### C. Create Comparison Page

`src/app/preview/page.tsx`:

```tsx
export default function PreviewComparison() {
  const styles = ['minimalist', 'brutalist', 'glassmorphism', 'neumorphism', 'bento'];

  return (
    <div>
      <h1>Choose Your Design Style</h1>
      <div className="style-grid">
        {styles.map(style => (
          <div key={style} className="style-card">
            <Link href={`/preview/styles/${style}`}>
              <h2>{style}</h2>
              <p>[Brief description]</p>
              <button>View Full Preview</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Launch Development Server

```bash
cd .claude/.smite/preview-workspace
npm run dev
```

Provide the user with:
- Local URL: `http://localhost:3000/preview`
- Instructions on how to navigate
- What to look for in each style

### 4. User Selection Flow

Create selection interface:

```markdown
# Style Selection

Review all 5 styles at: http://localhost:3000/preview

## Selection Process

1. **Browse**: Navigate through each style's preview page
2. **Interact**: Test hover states, focus states, animations
3. **Compare**: Use the comparison page to see styles side-by-side
4. **Select**: Tell me which style you prefer

## Selection Command

Once you've decided, run:

```bash
/architect --select=<style-name>
```

Example: `/architect --select=minimalist`
```

## Subagent Usage

Use the **frontend** subagent for implementation:

```typescript
// Launch frontend agent for each style
Agent: frontend
Task: Implement preview for [style-name] style
Context:
  - Design tokens from [style-name] specification
  - Components: Button, Input, Card, Navigation
  - Sample UI: Dashboard layout with [project-specific elements]
Output: Working Next.js preview page
```

## Cleanup Strategy

After user selection:

```bash
# Keep chosen style, remove others
rm -rf .claude/.smite/preview-workspace

# Or move chosen style to main project
cp -r .claude/.smite/preview-workspace/src/styles/[chosen-style]/* ../../src/styles/
```

## Output

- ✅ Temporary Next.js workspace created
- ✅ All 5 styles implemented as interactive previews
- ✅ Development server running
- ✅ Comparison page created
- ✅ User can select preferred style

## User Selection

User runs: `/architect --select=<style-name>`

## Next Step

Proceed to `06-implement.md` to implement the chosen style in the main project
