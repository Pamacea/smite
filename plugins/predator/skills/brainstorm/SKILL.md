---
name: brainstorm
description: Collaborative brainstorming with exploration, challenging, and synthesis phases
version: 1.0.0
---

# Brainstorm Workflow Skill

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

Generate diverse ideas, challenge assumptions through adversarial review, and synthesize the best solutions using multi-agent collaboration and modular workflow execution.

## Core Workflow

**8-Step Modular Execution**:

1. **INIT** - Parse flags, initialize brainstorm state
2. **ANALYZE** - Understand problem domain, identify stakeholders
3. **PLAN** - Create exploration strategy, define challenge angles
4. **EXECUTE** - Explore ideas, challenge adversarially, synthesize
5. **VALIDATE** - Verify solutions meet criteria, assess feasibility
6. **EXAMINE** - Adversarial solution review [if -examine]
7. **RESOLVE** - Address concerns and refine solutions
8. **FINISH** - Create documentation PR [if -pr] or COMPLETE

## Key Principles

- **Diverse Ideas**: Launch parallel idea generators
- **Challenge Thoroughly**: Adversarial review of each idea
- **Synthesize Objectively**: Rank by clear criteria
- **Document Everything**: Save all artifacts

## Flags

| Flag | Description |
|------|-------------|
| `-auto` / `-a` | Skip user approvals |
| `-examine` / `-x` | Enable adversarial solution review |
| `-pr` / `-p` | Create documentation PR |
| `-participants=N` | Number of idea generators (default: 3) |
| `-depth=level` | Exploration depth: shallow/medium/deep (default: medium) |

## Usage

```bash
/brainstorm "How to improve user onboarding"
/brainstorm -participants=5 "Generate many feature ideas"
/brainstorm -examine "Critical architectural decision"
/brainstorm -depth=deep "Thorough exploration of topic"
```

## Workflow Steps

### Step 00: INIT
Parse flags, create output folder, initialize brainstorm state.

### Step 01: ANALYZE
Understand the problem space and context.

### Step 02: PLAN
Create exploration and challenge strategy.

### Step 03: EXECUTE
Launch PARTICIPANTS parallel idea generators, challenge ideas adversarially, and synthesize top solutions.

### Step 04: VALIDATE
Verify solutions meet criteria and assess feasibility.

### Step 05: EXAMINE (Conditional)
Launch adversarial solution review agents if -examine flag set.

### Step 06: RESOLVE (Conditional)
Refine solutions based on feedback if issues found.

### Step 07: FINISH
Create documentation PR or save summary locally.

## Integration

- **Works with**: `/toolkit search` for context gathering
- **Related to**: `/predator` (feature implementation)
- **Requires**: Workflow step files in `workflows/brainstorm/steps/`
- **Best used for**: Complex decisions requiring diverse perspectives

## Success Criteria

- ✅ All 8 workflow steps executed in order
- ✅ Diverse ideas generated (PARTICIPANTS agents)
- ✅ Ideas challenged adversarially
- ✅ Top solutions identified and ranked
- ✅ Feasibility and risk assessed
- ✅ Documentation saved

## Error Handling

- **Few ideas generated**: Increase participants or depth
- **Ideas too similar**: Challenge assumptions more aggressively
- **No consensus**: Re-run synthesis with different criteria
- **Feasibility unclear**: Request domain expert input

---
*Brainstorm Workflow Skill v1.0.0 - Collaborative idea generation*
