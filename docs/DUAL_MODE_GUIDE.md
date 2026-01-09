# 🚀 Parallel Execution with Task Tool

**Guide for running multiple SMITE agents simultaneously**

---

## 📖 Overview

The **Task tool** allows you to run multiple SMITE agents in parallel with real-time "Running X Agents" progress tracking. This is perfect for independent tasks that can be executed simultaneously.

---

## 🔄 Skill vs Task Tool

### Skill Tool (Sequential)

**Purpose:** Load an agent's prompt from a markdown file and execute it sequentially.

**Characteristics:**
- ✅ Simple invocation via CLI (`/smite-explorer`)
- ✅ Programmatic via `Skill(skill="...")` tool
- ❌ No "Running X Agents" UI
- ❌ No parallel execution
- ✅ Best for: Single agent tasks

**Usage:**
```typescript
// Via Skill tool
Skill(skill="smite-explorer:explorer")

// Via CLI command
/smite:explorer --task=map-architecture
```

### Task Tool (Parallel) ⭐

**Purpose:** Create true parallel subagents with real-time progress tracking.

**Characteristics:**
- ✅ "Running X Agents" UI appears
- ✅ Multiple agents execute simultaneously
- ✅ Real-time progress for each agent
- ✅ ~2-3x faster for independent tasks
- ✅ Best for: Multi-agent workflows

**Usage:**
```typescript
// Launch 3 agents in parallel - ALL IN ONE MESSAGE
Task(subagent_type="general-purpose", prompt="Explore codebase architecture")
Task(subagent_type="general-purpose", prompt="Check for lint errors")
Task(subagent_type="general-purpose", prompt="Update documentation")

// Result:
// 🚀 Running 3 Agents in parallel...
// [Real-time progress for each agent]
// ✅ All 3 Agents completed
```

---

## 💡 When to Use Each

### Use Task Tool (Parallel) When:

1. **Multiple Independent Tasks**
   - Tasks that don't depend on each other
   - Can be executed simultaneously
   - Example: Code exploration + Lint check + Doc update

2. **Need Real-Time Progress**
   - Want to see "Running X Agents" UI
   - Monitor each agent's progress
   - Track execution in real-time

3. **Faster Execution Required**
   - Time-sensitive workflows
   - Large codebases
   - Multiple analysis types needed

### Use Skill Tool or CLI Commands (Sequential) When:

1. **Single Agent Tasks**
   - Only one agent needed
   - Simple one-off operations
   - Example: Just explore the codebase

2. **Chained Workflows**
   - Output of one agent → Input of next
   - Sequential dependencies
   - Example: Explorer → Constructor → Gatekeeper

3. **Simple Operations**
   - Quick tasks
   - Don't need progress tracking
   - Example: Quick code review

---

## 📝 Practical Examples

### Example 1: Codebase Analysis (3 Agents Parallel)

**Scenario:** Need to explore code, check lint, and update docs simultaneously.

```typescript
// Launch all 3 agents in ONE message
Task(subagent_type="general-purpose", prompt=`You are the SMITE Explorer agent.
Analyze the codebase architecture and create a dependency map.
Focus on: plugins/, docs/, and .claude-plugin/ directories.
Output: Architecture report with diagrams.`)

Task(subagent_type="general-purpose", prompt=`You are the Linter Sentinel agent.
Check for TypeScript errors, ESLint violations, and formatting issues.
Report all findings with file paths and line numbers.
Output: Lint report with fixable issues.`)

Task(subagent_type="general-purpose", prompt=`You are the Doc Maintainer agent.
Review README.md and all documentation for accuracy.
Check if all 11 plugins are documented correctly.
Output: Documentation analysis with update suggestions.`)

// Result: 🚀 Running 3 Agents in parallel...
```

### Example 2: Feature Development (Sequential)

**Scenario:** Implement a new feature step-by-step.

```bash
# Step 1: Explore codebase
/smite:explorer --task=find-component --target=Button

# Step 2: Implement feature (depends on step 1)
/smite-constructor --tech=nextjs

# Step 3: Validate (depends on step 2)
/smite-gatekeeper --mode=test

# Step 4: Document (depends on step 3)
/smite-handover
```

### Example 3: Quality Check (2 Agents Parallel)

**Scenario:** Quick quality validation before commit.

```typescript
// Run both checks in parallel
Task(subagent_type="general-purpose", prompt="Check all TypeScript files for type errors and compilation issues. List all files with errors.")
Task(subagent_type="general-purpose", prompt="Review recent code changes for best practices violations. Check for: console.logs, any types, TODO comments.")

// Result: 🚀 Running 2 Agents in parallel...
```

---

## ⚙️ Task Tool Reference

### Basic Syntax

```typescript
Task(subagent_type="general-purpose", prompt="<your prompt here>")
```

### Parameters

- **subagent_type**: Type of agent to create
  - `"general-purpose"` - Universal agent (most common)
  - Other specialized types available

- **prompt**: The task instructions
  - Can be multi-line
  - Include agent role/mode
  - Specify output format
  - Add context and constraints

### Best Practices

1. **Launch in One Message**
   - Put ALL `Task()` calls in a SINGLE message
   - This creates true parallel execution
   - Each message creates sequential execution

2. **Clear Prompts**
   - Specify agent role ("You are the SMITE Explorer")
   - Define task scope clearly
   - Request specific output format

3. **Independent Tasks**
   - Only parallelize truly independent tasks
   - Dependencies should run sequentially
   - Consider blast radius

---

## 🎯 Real-World Workflows

### Full Feature Development (Mixed Approach)

```typescript
// Phase 1: Exploration (Sequential)
/smite:explorer --task=map-architecture

// Phase 2: Analysis (Parallel)
Task(subagent_type="general-purpose", prompt="Analyze business requirements and estimate complexity")
Task(subagent_type="general-purpose", prompt="Review technical stack and identify dependencies")
Task(subagent_type="general-purpose", prompt="Check security considerations and compliance")

// Phase 3: Implementation (Sequential)
/smite-constructor --tech=nextjs

// Phase 4: Validation (Parallel)
Task(subagent_type="general-purpose", prompt="Run all tests and check coverage")
Task(subagent_type="general-purpose", prompt="Perform code review and check best practices")
Task(subagent_type="general-purpose", prompt="Validate performance and check for bottlenecks")

// Phase 5: Documentation (Sequential)
/smite-handover
```

### Bug Investigation (Mixed Approach)

```typescript
// Phase 1: Diagnosis (Parallel)
Task(subagent_type="general-purpose", prompt="Search codebase for similar bug patterns")
Task(subagent_type="general-purpose", prompt="Analyze git history for recent changes")
Task(subagent_type="general-purpose", prompt="Check error logs and stack traces")

// Phase 2: Fix (Sequential)
/smite-constructor --tech=nextjs

// Phase 3: Validation (Parallel)
Task(subagent_type="general-purpose", prompt="Run regression tests")
Task(subagent_type="general-purpose", prompt="Verify fix doesn't break other features")
```

---

## 🔍 Troubleshooting

### "Running X Agents" doesn't appear

**Problem:** No parallel UI when using Task tool.

**Solution:** Make sure to put ALL `Task()` calls in ONE message, not multiple messages.

### Agents run sequentially instead of parallel

**Problem:** Agents execute one after another.

**Solution:** Check that you're using `Task()` tool, not `Skill()` tool. Skill tool is always sequential.

### One agent fails, others continue

**Problem:** Error in one agent stops all agents.

**Solution:** This is expected behavior with Task tool. Each agent has independent error handling.

---

## 📊 Performance Comparison

| Approach | Time | UI | Best For |
|----------|------|-----|----------|
| **Sequential (3 tasks)** | ~9 min | None | Chained workflows |
| **Parallel (3 tasks)** | ~3 min | "Running 3 Agents" | Independent tasks |
| **Speedup** | **3x faster** | ✅ Real-time tracking | Multi-agent workflows |

---

## ✅ Key Takeaways

1. **Task Tool = Parallel + Progress UI**
   - Use for multiple independent tasks
   - Real-time "Running X Agents" display
   - ~2-3x faster execution

2. **Skill Tool/CLI = Sequential**
   - Use for single agent tasks
   - Chained workflows
   - Simple operations

3. **Launch Tasks in One Message**
   - ALL `Task()` calls must be in SINGLE message
   - Creates true parallel execution

4. **Match Tool to Workflow**
   - Independent tasks → Task tool
   - Dependent tasks → Sequential
   - Mixed workflows → Combine both

---

**Last Updated:** January 9, 2026
**SMITE Marketplace v2.0**
