# Step 1: Analyze Code

**Flag**: `-a` or `--analyze`

## Purpose

Detect and catalog all code quality issues, complexity problems, and technical debt in the specified scope.

## What To Do

### 1. Determine Scope

Based on flags provided:
- `--scope=file <path>` - Single file analysis
- `--scope=directory <path>` - Directory analysis
- `--scope=recent` - Recently modified files (default)
- `--scope=all` - Entire codebase

### 2. Run Detection Tools

Use toolkit or direct analysis to detect:

```markdown
## Detection Categories

### Complexity Issues
- Cyclomatic complexity > 10
- Cognitive complexity > 15
- Nesting depth > 4
- Function length > 50 lines
- Parameter count > 5

### Code Smells
- Long parameter list
- Feature envy
- God object/class
- Shotgun surgery
- Divergent change
- Lazy class
- Data clumps
- Primitive obsession

### Duplications
- Identical code blocks
- Similar patterns (3+ occurrences)
- Copy-pasted logic
- Repeated structures

### Maintainability Issues
- Poor naming conventions
- Magic numbers/strings
- Dead code
- Commented out code
- TODO/FIXME comments

### Type Safety
- Missing types
- Any types
- Type assertions
- Missing null checks
```

### 3. Use MCP Tools

When available:

**Toolkit MCP:**
- `/toolkit detect --patterns="complexity,duplication,code-smells"`
- `/toolkit graph --impact` - Understand complexity hotspots

**Semantic Search:**
- Find similar patterns: `grepai search "pattern"`
- Locate duplications

### 4. Generate Analysis Report

Create comprehensive report:

```markdown
# Code Analysis Report

**Scope**: [scope description]
**Files Analyzed**: [N]
**Timestamp**: [ISO timestamp]

## Summary Statistics
- Total issues found: [N]
- Critical: [N] 🔴
- High: [N] 🟠
- Medium: [N] 🟡
- Low: [N] 🟢

## Complexity Issues

### Critical (Complexity > 15)
1. **[File:Line]** - [Function name]
   - Cyclomatic: [X]
   - Cognitive: [X]
   - Lines: [X]
   - Why: [Explanation]

### High (Complexity 11-15)
2. **[File:Line]** - [Function name]
   - Cyclomatic: [X]
   - Cognitive: [X]
   - Lines: [X]
   - Why: [Explanation]

## Code Smells

### God Objects
1. **[File:Line]** - [Class name]
   - Lines: [X]
   - Methods: [X]
   - Responsibilities: [List]
   - Suggestion: [Extract classes]

### Long Parameter List
2. **[File:Line]** - [Function name]
   - Parameters: [X]
   - Names: [List]
   - Suggestion: [Use parameter object]

## Duplications

### Exact Duplicates
1. **Pattern found in [N] locations:**
   - [File:Line]
   - [File:Line]
   - [File:Line]
   - Suggestion: [Extract to shared utility]
   - Estimated savings: [X] lines

### Similar Patterns
2. **Pattern found in [N] locations with variations:**
   - [File:Line]
   - [File:Line]
   - [File:Line]
   - Suggestion: [Parameterize differences]

## Maintainability Issues

### Naming Problems
1. **[File:Line]** - [Element name]
   - Issue: [Poor/descriptive/etc]
   - Suggestion: [Better name]

### Magic Values
2. **[File:Line]** - [Value]
   - Usage: [Context]
   - Suggestion: [Extract as constant]

## Technical Debt Score

**Overall Score**: [X]/100
- Complexity: [X]/100
- Duplication: [X]/100
- Code Smells: [X]/100
- Maintainability: [X]/100

**Interpretation**:
- 0-25: Excellent ✅
- 26-50: Good 🟢
- 51-75: Needs attention 🟡
- 76-100: Critical action needed 🔴

## Files Requiring Attention

### Priority 1 (Critical)
1. [File path] - [Score] - [Issue count]

### Priority 2 (High)
2. [File path] - [Score] - [Issue count]

### Priority 3 (Medium)
3. [File path] - [Score] - [Issue count]
```

### 5. Save Report

- Location: `.claude/.smite/refactor-analysis.md`
- Machine-readable format: `.claude/.smite/refactor-analysis.json`

### 6. JSON Format for Tooling

```json
{
  "scope": "recent",
  "timestamp": "2025-01-22T10:00:00Z",
  "summary": {
    "totalIssues": 42,
    "critical": 5,
    "high": 12,
    "medium": 18,
    "low": 7
  },
  "issues": [
    {
      "id": 1,
      "type": "complexity",
      "severity": "critical",
      "file": "src/components/UserForm.tsx",
      "line": 45,
      "function": "handleSubmit",
      "metrics": {
        "cyclomatic": 18,
        "cognitive": 24,
        "lines": 67
      }
    }
  ],
  "debtScore": 72
}
```

## Output

- ✅ Analysis report with all detected issues
- ✅ Prioritized by severity
- ✅ Machine-readable JSON for tooling
- ✅ Saved to `.claude/.smite/refactor-analysis.md`
- ✅ Ready for review step

## MCP Tools Used

- ✅ Toolkit detect patterns (if available)
- ✅ Semantic search for duplications
- ✅ Dependency graph for impact analysis
- ✅ Type checker for type safety issues

## Next Step

Proceed to `02-review.md` (use `-r` flag) to prioritize and plan changes
