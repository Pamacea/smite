---
description: Collaborative brainstorming with exploration, challenging, and synthesis phases
---

<objective>
Brainstorm ideas and solutions for #$ARGUMENTS using the Brainstorm workflow system with modular step execution.

The Brainstorm workflow uses separate markdown files for each phase (00-07), generating diverse ideas, challenging assumptions, and synthesizing the best solutions.

**Workflow Steps:**
- 00_INIT: Parse flags, create output folder, initialize brainstorm state
- 01_ANALYZE: Understand problem domain, gather context, identify stakeholders
- 02_PLAN: Create exploration strategy, define challenge angles, set synthesis approach
- 03_EXECUTE: Explore ideas (multi-agent), challenge (adversarial), synthesize using TodoWrite
- 04_VALIDATE: Verify solutions meet criteria, assess feasibility and risks
- 05_EXAMINE: Adversarial solution review (multi-agents) [if -examine]
- 06_RESOLVE: Address concerns and refine solutions [if issues found]
- 07_FINISH: Create documentation PR [if -pr] or COMPLETE
</objective>

<variables>
TOPIC = extract topic from $ARGUMENTS
FLAGS = parse flags from $ARGUMENTS

AUTO_MODE = check if '-auto' or '-a' in FLAGS
EXAMINE_MODE = check if '-examine' or '-x' in FLAGS
PR_MODE = check if '-pr' or '-p' in FLAGS
PARTICIPANTS = extract 'participants=N' or default to 3
DEPTH = extract 'depth=level' or default to 'medium'
</variables>

<process>

## BRAINSTORM WORKFLOW

You will execute the Brainstorm workflow by following the steps defined in the workflow markdown files.

### Step 00: INIT

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/00_INIT.md`

Initialize the brainstorm session.

---

### Step 01: ANALYZE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/01_ANALYZE.md`

Understand the problem space and context.

---

### Step 02: PLAN

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/02_PLAN.md`

Create exploration and challenge strategy.

**Check AUTO_MODE**: If enabled, skip approval.

---

### Step 03: EXECUTE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/03_EXECUTE.md`

Launch PARTICIPANTS parallel idea generators, challenge ideas adversarially, and synthesize top solutions using TodoWrite.

---

### Step 04: VALIDATE

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/04_VALIDATE.md`

Verify solutions meet criteria and assess feasibility.

---

### Step 05: EXAMINE (Conditional)

**Check EXAMINE_MODE**: If enabled, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/05_EXAMINE.md`

Launch adversarial solution review agents.

---

### Step 06: RESOLVE (Conditional)

If EXAMINE found issues, read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/06_RESOLVE.md`

Refine solutions based on feedback.

---

### Step 07: FINISH

Read and execute:
!`cat ~/.claude/plugins/cache/smite/predator/1.0.0/workflows/brainstorm/steps/07_FINISH.md`

**Check PR_MODE**: If enabled, create documentation PR. Otherwise, save summary locally.

</process>

<verification>
After each step:
- **INIT**: Session initialized with configuration
- **ANALYZE**: Problem understood, context gathered
- **PLAN**: Strategy created with participant roles
- **EXECUTE**: Ideas generated, challenged, synthesized
- **VALIDATE**: Solutions verified feasible
- **EXAMINE**: Solutions reviewed (if enabled)
- **RESOLVE**: Solutions refined (if needed)
- **FINISH**: Documentation created
</verification>

<success_criteria>

- All 8 workflow steps executed in order
- Diverse ideas generated (PARTICIPANTS agents)
- Ideas challenged adversarially
- Top solutions identified and ranked
- Feasibility and risk assessed
- Documentation saved to .predator/brainstorm/runs/
</success_criteria>

<execution_rules>

- **Read workflow files**: Use cat to read each step's .md file
- **Launch parallel agents**: Generate ideas simultaneously
- **Challenge thoroughly**: Adversarial review of each idea
- **Synthesize objectively**: Rank by clear criteria
- **Document everything**: Save all artifacts
</execution_rules>

<parameter_reference>

**Available Flags:**
- `-auto` / `-a` - Skip user approvals
- `-examine` / `-x` - Enable adversarial solution review
- `-pr` / `-p` - Create documentation PR
- `-participants=N` - Number of idea generators (default: 3)
- `-depth=level` - Exploration depth: shallow/medium/deep (default: medium)

**Usage Examples:**
```
/brainstorm "How to improve user onboarding"
/brainstorm -participants=5 "Generate many feature ideas"
/brainstorm -examine "Critical architectural decision"
/brainstorm -depth=deep "Thorough exploration of topic"
```

</parameter_reference>
