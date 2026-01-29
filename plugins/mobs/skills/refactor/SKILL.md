# Refactor Skill

## 🔴 TOOL GATEKEEPER - NON-NEGOTIABLE

═══════════════════════════════════════════════════════
🚫 PROHIBITED WITHOUT EXCEPTION:
   grep | egrep | find | ack | ag | ls | dir | glob

✅ MANDATORY REPLACEMENT:
   grepai search "pattern" | /toolkit search "query"

🎯 DECISION TREE:
   Need to search? → grepai or /toolkit search
   Need to explore? → grepai search "" (empty pattern)
   Need to read?    → Read tool (NOT cat/head)
═══════════════════════════════════════════════════════

---

## Mission

Systematic code refactoring with comprehensive validation, ensuring safe improvements while preserving functionality through a structured 5-step workflow.

## Core Workflow

1. **Analyze** - Detect code quality issues (complexity, duplications, smells)
2. **Review** - Prioritize by business value and assess impact
3. **Validate** - Ensure changes are safe before implementing
4. **Resolve** - Apply proven refactoring patterns incrementally
5. **Verify** - Confirm improvements and no regressions

## Key Principles

- **Safety First** - Validate all changes before implementation
- **Incremental** - Small, verifiable steps
- **Evidence-Based** - Use metrics to guide decisions
- **Test Continuously** - Run tests after each change
- **Document Thoroughly** - Explain what and why

## Workflow Steps

### Step 1: Analyze (`-a`)
Detect and catalog all code quality issues using:
- Complexity analysis (cyclomatic, cognitive, nesting)
- Duplication detection
- Code smell identification
- Maintainability assessment
- Technical debt scoring

### Step 2: Review (`-r`)
Review detected issues and create action plan:
- Classify by severity (P1-P4)
- Assess business impact
- Estimate effort and risk
- Identify quick wins
- Create timeline

### Step 3: Validate (`-v`)
Validate proposed changes are safe:
- Verify functionality preservation
- Analyze test coverage
- Assess impact and dependencies
- Identify risks and mitigations
- Approve/reject changes

### Step 4: Resolve (`-x`)
Apply validated refactoring changes:
- Apply proven patterns
- Make incremental changes
- Test continuously
- Commit in logical steps
- Document all changes

### Step 5: Verify (`-t`)
Comprehensive verification of results:
- All tests passing
- No type errors
- Metrics improved
- No regressions
- Deployment ready

## Subagent Collaboration

### Reviewer Subagent
**Purpose**: Code review and prioritization

**Launched by**: Step 2 (`-r`)

**Capabilities**:
- Issue classification and prioritization
- Impact assessment
- Effort estimation
- Risk evaluation
- Action plan creation

**Output**: Prioritized review report

### Validator Subagent
**Purpose**: Safety and validation

**Launched by**: Step 3 (`-v`)

**Capabilities**:
- Functionality preservation verification
- Test coverage analysis
- Impact analysis
- Risk assessment
- Approval decision

**Output**: Validation report (APPROVED/CONDITIONAL/REJECTED)

### Resolver Subagent
**Purpose**: Refactoring implementation

**Launched by**: Step 4 (`-x`)

**Capabilities**:
- Apply refactoring patterns
- Incremental changes
- Continuous testing
- Documentation
- Safe commits

**Output**: Resolved code with documentation

## Modes

### Quick Mode (`--quick`)
Automatically refactor low-risk items:
- Risk score < 30
- Complexity < 8
- Test coverage > 80%

### Full Mode (`-a -r -v -x -t`)
Complete workflow with full control:
- Analyze all issues
- Review and prioritize
- Validate each change
- Resolve incrementally
- Verify thoroughly

### Step Mode
Execute individual steps:
- `-a` - Analyze only
- `-r` - Review only
- `-v --item=<ID>` - Validate specific item
- `-x --item=<ID>` - Resolve specific item
- `-t --item=<ID>` - Verify specific item

## Configuration

- **Analysis scope**: Recent changes, file, directory, or all
- **Severity filter**: Critical, high, medium, low
- **Risk threshold**: Maximum acceptable risk score
- **Test coverage target**: Minimum coverage requirement

## Integration

- **Works after**: builder (implementation)
- **Triggers**: Manual invocation, automatic after changes
- **Integrates with**: toolkit (analysis), reviewer/validator/resolver (subagents)

## MCP Tools

When available:
- **Bug Detection** - Identify issues
- **Semantic Search** - Find patterns
- **Dependency Graph** - Impact analysis
- **Refactoring API** - Safe transformations
- **Type Checker** - Type safety

## Output Files

- `refactor-analysis.md` - Detected issues
- `refactor-review.md` - Prioritized action plan
- `refactor-validation-[ID].md` - Safety assessment
- `refactor-resolution-[ID].md` - Changes applied
- `refactor-verification-[ID].md` - Final verification

## Error Handling

- **Tests failing**: Fix or revert changes
- **Validation rejected**: Address blocking issues
- **Type errors**: Resolve before proceeding
- **Regressions detected**: Rollback and investigate

## Success Criteria

- ✅ All tests passing
- ✅ No type errors
- ✅ Complexity reduced
- ✅ Coverage increased
- ✅ No regressions
- ✅ Team satisfied

## Best Practices

1. **Always validate first** - Never skip validation
2. **Start with quick wins** - Build momentum
3. **Test continuously** - After each small change
4. **Commit logically** - Small, reviewable commits
5. **Document thoroughly** - Explain reasoning

## Common Patterns

- **Extract Method** - Reduce complexity
- **Introduce Parameter Object** - Simplify signatures
- **Replace Magic Numbers** - Improve clarity
- **Decompose Conditional** - Reduce nesting
- **Extract Class** - Improve organization
- **Move Method** - Better placement

---
*Refactor Skill - Systematic code refactoring with validation*
