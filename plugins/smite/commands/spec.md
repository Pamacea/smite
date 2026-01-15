---
description: "Spec-first workflow - Analyze, Plan, then Execute"
argument-hint: "<feature-description>"
---

<objective>
Implement #$ARGUMENTS using the Spec-First methodology.

This workflow decouples thinking from action by creating a technical specification BEFORE any coding begins. This improves decision quality by validating logic 100% before syntax work.
</objective>

<process>
1. **SPEC GENERATION** (THINKING PHASE):
   - Read .claudesrules to understand spec-first protocol
   - Create .smite/current_spec.md with:
     * Objective: Clear statement of what needs to be achieved
     * Approach: Technical approach and architectural decisions
     * Implementation Steps: Breakdown with file paths, function signatures, dependencies
     * Validation Criteria: How to verify success
     * Known Risks: Potential issues and mitigations
   - DO NOT write any code yet
   - Focus on Quoi/Comment (What/How), not Syntax

2. **SPEC VALIDATION**:
   - Re-read the spec completely
   - Check for coherence:
     * Is objective clear?
     * Is approach well-defined?
     * Are steps complete with files/signatures?
     * Are validation criteria specified?
     * Are dependencies correct?
   - If gaps found: UPDATE spec before proceeding
   - Validate against engineering.md rules

3. **CODE EXECUTION** (if spec validated):
   - Read spec completely one more time
   - Implement steps EXACTLY as defined
   - Follow file paths, signatures, dependencies from spec
   - DO NOT deviate without updating spec first
   - If logic gap found: STOP, report gap, update spec, then resume

4. **VALIDATION**:
   - Run lint and typecheck
   - Verify against acceptance criteria from spec
   - Update spec with actual implementation details
   - Archive spec to .smite/specs/[story-id]-spec.md
</process>

<rules>
**Critical constraints:**
- NO CODING until spec is created and validated
- SPEC MUST include: objective, approach, steps, validation criteria, risks
- STEPS MUST include: file paths, function signatures, dependencies
- STOP immediately if logic gap found - update spec first
- FOLLOW spec exactly - no deviation without spec update
- VALIDATE spec coherence before coding (check all fields are complete)
- ARCHIVE spec after implementation to .smite/specs/

**Spec Template:**
```markdown
# Technical Specification: [Story-ID]

## Objective
[Clear statement]

## Approach
[Technical approach]

## Implementation Steps

### Step 1: [Description]
- **Files**: [list]
- **Function Signatures**: [types]
- **Dependencies**: [what this depends on]

### Step 2: [Description]
...

## Validation Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Known Risks
- [Risk]: [Mitigation]
```
</rules>

<success_criteria>
- .smite/current_spec.md created with all required sections
- Spec validated for coherence before coding
- Implementation follows spec exactly
- Code passes linting and type checking
- Spec archived to .smite/specs/
- No logic gaps or deviations from spec
</success_criteria>

# Spec-First Mode Documentation

Autonomous spec-first workflow that decouples thinking from action.

## How It Works

1. **Analysis Phase**: Creates `.smite/current_spec.md` with technical specification
2. **Review Phase**: Validates spec for coherence and completeness
3. **Execution Phase**: Implements based on approved spec
4. **Lock Mechanism**: Pauses if logic gaps detected, waits for spec update

## Usage

```bash
# Basic spec-first workflow
/spec "Implement user authentication with JWT and refresh tokens"

# With explicit tech stack
/spec --tech=nextjs "Build task management CRUD with Prisma"

# With validation only (no execution)
/spec --validate-only "Design database schema for multi-tenant app"
```

## Process

### Phase 1: Analysis & Spec Creation
- Analyzes the requirement thoroughly
- Identifies technical approach
- Breaks down into implementation steps
- Documents function signatures
- Identifies risks and mitigations

### Phase 2: Spec Validation
- Checks objective clarity
- Validates approach completeness
- Verifies step dependencies
- Ensures validation criteria exist
- Flags potential issues

### Phase 3: Execution (if validation passes)
- Reads approved spec completely
- Implements steps in defined order
- Follows spec EXACTLY
- Stops on logic gaps
- Reports completion

### Phase 4: Lock Handling (if gaps found)
- Agent pauses execution immediately
- Reports the logical gap
- Waits for spec update
- Resumes only after lock released

## Spec Template

The generated spec follows this structure:

```markdown
# Technical Specification: [Story ID]

## Objective
[Clear statement of what needs to be achieved]

## Approach
[Technical approach and architectural decisions]

## Implementation Steps

### Step 1: [Description]
- **Files**: [list]
- **Function Signatures**: [types/specs]
- **Dependencies**: [what this depends on]

### Step 2: [Description]
...

## Validation Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Known Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]
```

## Spec Lock Commands

When an agent encounters a logic gap:

```bash
# Check lock status
/spec --status

# Release lock after fixing spec
/spec --release

# View current spec
/spec --view
```

## Benefits

- **Better Decisions**: Logic validated 100% before syntax work
- **Less Rework**: Gaps found before coding begins
- **Clearer Execution**: Step-by-step plan to follow
- **Pause on Issues**: Automatic detection of logical problems
- **Traceable**: Full specification history in `.smite/specs/`

## Output Files

- `.smite/current_spec.md` - Active specification
- `.smite/specs/[story-id]-spec.md` - Archived specifications
- `.smite/spec-lock.json` - Lock state (if active)

## Integration with Ralph

When used within Ralph workflows:
- Specs auto-generated for each user story
- Validated before agent invocation
- Passed to agents with spec-first mode enabled
- Lock mechanism integrates with batch execution

## Examples

```bash
# Simple feature
/spec "Add dark mode toggle with localStorage persistence"

# Complex feature
/spec "Implement real-time collaboration with WebSocket and CRDT"

# Architecture change
/spec "Refactor monolithic auth service into microservices"

# Bug fix
/spec "Fix memory leak in WebSocket connection handler"
```
