# 🏪 SMITE Complete Guide - Installation, Configuration & Usage

**Comprehensive guide for SMITE Marketplace plugins for Claude Code**

---

## 📑 Table of Contents

1. [Installation & Configuration](#1-installation--configuration)
2. [Claude Code 2.1.0 Hooks Architecture](#2-claude-code-210-hooks-architecture)
3. [Intelligent Agent Routing](#3-intelligent-agent-routing)
4. [Dual-Mode Execution (Skill vs Task)](#4-dual-mode-execution-skill-vs-task)
5. [Workflow Orchestration](#5-workflow-orchestration)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Installation & Configuration

### Quick Start (2 commands)

```bash
# Add the SMITE Marketplace to Claude Code
/plugin marketplace add Pamacea/smite-marketplace

# List all available plugins
/plugin list --marketplace=smite-marketplace

# Install individual plugins based on your needs
/plugin install smite-initializer@smite-marketplace
/plugin install linter-sentinel@smite-marketplace
```

### Install All Plugins

```bash
# Install all SMITE agents (10 specialized agents)
/plugin install smite-initializer@smite-marketplace
/plugin install smite-explorer@smite-marketplace
/plugin install smite-strategist@smite-marketplace
/plugin install smite-aura@smite-marketplace
/plugin install smite-constructor@smite-marketplace
/plugin install smite-gatekeeper@smite-marketplace
/plugin install smite-handover@smite-marketplace
/plugin install smite-surgeon@smite-marketplace
/plugin install smite-orchestrator@smite-marketplace
/plugin install smite-brainstorm@smite-marketplace
/plugin install smite-router@smite-marketplace

# Install quality assurance plugins
/plugin install linter-sentinel@smite-marketplace
/plugin install doc-maintainer@smite-marketplace
```

### Hooks Configuration

The **smite-orchestrator** plugin uses Claude Code 2.1.0 native hooks. After installation, hooks are configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write.*\\.(ts|tsx|js|jsx)$",
        "hooks": [
          {
            "type": "command",
            "command": "node plugins/smite-orchestrator/dist/detect-debt.js file $FILE_PATH",
            "statusMessage": "🔪 Detecting technical debt..."
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "smite-",
        "hooks": [
          {
            "type": "command",
            "command": "node plugins/smite-orchestrator/dist/agent-complete.js $AGENT_NAME",
            "statusMessage": "🎯 Updating workflow state..."
          }
        ]
      }
    ]
  }
}
```

### Universal Hook Installation

For cross-platform compatibility, use the JavaScript-based hook installer:

```bash
# Navigate to marketplace installation
cd .claude/plugins/smite-marketplace

# Run auto-configuration script
node scripts/install-hooks.js --install
```

**What the script does:**

1. Finds the marketplace root (by climbing directory tree if needed)
2. Creates `.claude/settings.local.json` with configured hooks
3. Uses relative paths from project root
4. Creates necessary directories (`.smite/suggestions/`)

### Cross-Platform Support

**Windows:**

```bash
node scripts/install-hooks.js --install
```

**macOS/Linux:**

```bash
node scripts/install-hooks.js --install
```

**Works on:** Windows, macOS, Linux - all projects where marketplace is installed

---

## 2. Claude Code 2.1.0 Hooks Architecture

### Revolution: From Daemon to Native Hooks

Thanks to Claude Code 2.1.0's hooks system, we've **eliminated**:

- ❌ Node.js daemon (20-50MB RAM overhead)
- ❌ Git hooks manual setup
- ❌ File watcher complexity
- ❌ Race condition handling

**And replaced with:**

- ✅ Native Claude Code hooks (zero RAM overhead)
- ✅ Deterministic event-driven triggers
- ✅ LLM-powered prompt hooks (intelligent context)
- ✅ Skill frontmatter integration (embedded behavior)

### Hook Types Implemented

| Hook Event       | Trigger               | Purpose             | Implementation              |
| ---------------- | --------------------- | ------------------- | --------------------------- |
| **PostToolUse**  | After Edit/Write      | Auto-detect changes | Suggest Gatekeeper/Surgeon  |
| **SubagentStop** | After agent completes | Workflow chaining   | Suggest next agent          |
| **PreToolUse**   | Before smite agent    | Validate order      | Warn on workflow violations |

### Technical Debt Detection

Automatically detects these patterns in `.ts`, `.tsx`, `.js`, `.jsx` files:

- 🔴 **High Severity**: `@ts-ignore`, debugger statements
- 🟡 **Medium Severity**: `any` types, `@ts-expect-error`, empty interfaces
- 🟢 **Low Severity**: TODO/FIXME comments, console statements, hardcoded strings

### Hook Implementation Details

#### 1. PostToolUse Hooks (Auto-Detection)

**Workflow:**

```
User edits src/Button.tsx (adds 'any' type)
  ↓
PostToolUse hook fires
  ↓
Hook scans file content
  ↓
"🔪 Technical debt detected in src/Button.tsx:42"
  "Type 'any' detected (severity: high)"
  "Run Surgeon to address 1 technical debt items?"
  ↓
User accepts → Surgeon refactors automatically
```

#### 2. SubagentStop Hooks (Workflow Chaining)

**Workflow:**

```
Explorer agent completes
  ↓
SubagentStop hook fires
  ↓
Hook reads .smite/orchestrator-state.json
  ↓
"✅ smite-explorer completed"
  "🔄 Next agent: smite-strategist"
  "Reason: Business analysis follows codebase exploration"
  "Run smite-strategist? [Y]es / [N]o / [S]kip"
  ↓
User accepts → Strategist runs automatically
  ↓
State manager updates: set-agent("smite-explorer")
```

**Standard Workflow Order:**

```
initializer → explorer → strategist → aura → constructor → gatekeeper → handover
```

#### 3. PreToolUse Hooks (Order Validation)

**Workflow:**

```
User tries: "Run smite-constructor" (without running explorer/strategist/aura)
  ↓
PreToolUse hook fires
  ↓
Hook reads .smite/orchestrator-state.json
  ↓
"⚠️ Workflow warning: smite-aura should run BEFORE smite-constructor"
  "Continue anyway or run recommended agents first?"
  ↓
User decides → Proceed or run recommended agents
```

**Bypass Conditions:**

- User explicitly requested this specific agent
- `--force` flag is present
- Workflow is custom (defined in orchestrator state)

#### 4. Skill Frontmatter Hooks (Per-Agent Behavior)

Each agent can have its own embedded hooks:

**Example: smite-constructor**

```yaml
---
name: smite-constructor
hooks:
  PostToolUse:
    - type: prompt
      prompt: "After code implementation, suggest Gatekeeper validation"
  PostSubagentStop:
    - type: prompt
      prompt: "After implementation, check for technical debt, suggest handover"
---
# CONSTRUCTOR AGENT
...
```

### Hook Types Comparison

| Type        | Use Case             | Execution               | Output           |
| ----------- | -------------------- | ----------------------- | ---------------- |
| **prompt**  | LLM evaluation       | Claude evaluates prompt | Suggests actions |
| **command** | Shell script         | Runs bash command       | Side effects     |
| **agent**   | Complex verification | Spawns sub-agent        | Rich validation  |

### Performance Characteristics

| Metric               | Value     | Notes                         |
| -------------------- | --------- | ----------------------------- |
| **RAM overhead**     | 0MB       | Hooks use Claude Code process |
| **CPU overhead**     | Minimal   | Only fires on tool use        |
| **Detection speed**  | <50ms     | For technical debt scanning   |
| **State management** | <10ms     | For JSON operations           |
| **Scalability**      | Excellent | No additional processes       |

### Before vs After Comparison

**Before (Proposed Daemon Architecture):**

- File watching: Node.js chokidar daemon (20-50MB RAM)
- Process management: PID files, start/stop scripts (2-3 days dev)
- Total cost: ~6-8 days development + ongoing maintenance

**After (Native Hooks Architecture):**

- File watching: Claude Code PostToolUse hooks (0MB RAM)
- Process management: Built into Claude Code (0 days)
- Total cost: ~2 hours configuration + 0 maintenance

**ROI:** **96% reduction** in development effort for **better reliability**

---

## 3. Intelligent Agent Routing

### Concept

**SMITE Router** automatically detects your project context and routes to the best agent with correct parameters - no manual configuration needed!

### How It Works

```
You: "Implement a feature"
  ↓
smite-router analyzes project
  ↓
Detects: Next.js + TypeScript + Tailwind
  ↓
Routes to: smite-constructor --tech=nextjs
  ↓
Provides relevant docs links:
  - https://nextjs.org/docs
  - https://react.dev/
  - https://zustand.docs.pmnd.rs/
  ↓
Agent implements with correct flags!
```

### Automatic Detection Capabilities

**Languages:**

- TypeScript (tsconfig.json)
- Rust (Cargo.toml)
- Python (pyproject.toml)
- Go (go.mod)

**Frameworks:**

- **Web**: Next.js, React, Angular, Vue, Svelte
- **Rust**: Axum, Actix, Rocket
- **Python**: FastAPI, Django, Flask

**Project Types:**

- `app/` → Next.js App Router
- `pages/` → Next.js Pages Router
- `src/components/` → Component Library
- `migrations/` → Full-stack Application

### Usage Examples

#### Example 1: Next.js Project

```bash
# Project context
$ ls
next.config.js
tsconfig.json
app/
package.json

# You request
USER: "Add a profile page"

# Automatic execution
1. Hook: "Use smite-router"
2. Router analyzes: "Next.js detected"
3. Router suggests: "smite-constructor --tech=nextjs"
4. I launch: Task("smite-constructor:constructor.task", prompt="Add a profile page in Next.js mode")

# RESULT: Page created with correct mode automatically!
```

#### Example 2: Rust Project

```bash
# Project context
$ cat Cargo.toml
[dependencies]
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }

# You request
USER: "Create an API endpoint"

# Automatic execution
1. Hook: "Use smite-router"
2. Router analyzes: "Rust + Axum detected"
3. Router suggests: "smite-constructor --tech=rust"
4. I launch: Task("smite-constructor:constructor.task", prompt="Create API endpoint in Rust mode")

# RESULT: Endpoint created with Axum automatically!
```

#### Example 3: Multi-Language Project

```bash
# Morning: Working on Next.js
USER: "Add a profile page"
Router: "Next.js detected → smite-constructor --tech=nextjs"
Docs: Next.js docs + React docs + Zustand docs

# Afternoon: Working on Rust
USER: "Add an API endpoint"
Router: "Rust + Axum detected → smite-constructor --tech=rust"
Docs: Rust Book + Axum docs + Tokio docs

# Router adapts automatically!
```

### Documentation Integration

All agents now include **official documentation links** for their respective technologies:

**React Ecosystem:**

- Next.js, React, Zustand, TanStack Query, Prisma

**Rust Ecosystem:**

- The Rust Book, Tokio, Axum, SQLx, Diesel

**Python Ecosystem:**

- FastAPI, Pydantic, SQLAlchemy

**Build Tools:**

- Vite, Turbopack, esbuild

**Testing:**

- Vitest, Jest, Playwright

**Styling:**

- Tailwind CSS, Emotion, styled-components

### Configuration

**Enable smite-router:**

```bash
# Install the plugin
/plugin install smite-router@smite-marketplace

# That's it! Hooks do the rest
```

**PreToolUse Hook (Auto-Guidance):**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task.*smite-|Skill.*smite-",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "CRITICAL: Before invoking any smite agent, use smite-router FIRST..."
          }
        ]
      }
    ]
  }
}
```

### Manual Usage

If you want to force analysis:

```bash
*start-s_router

# Router analyzes and recommends:
"🔀 Next.js project detected"
"Agent suggested: smite-constructor --tech=nextjs"
"Launch? [Y]es"
```

### Benefits

**For Users:**

- ✅ Zero configuration - no need to specify language/framework
- ✅ Zero manual flags - `--tech=nextjs` applied automatically
- ✅ Context-aware - adapts to your project in real-time
- ✅ Multi-language - switch from TypeScript to Rust without changes

**For Claude:**

- ✅ Intelligent choices - chooses right agent with right parameters
- ✅ Fewer errors - no wrong mode (e.g., using Next.js mode on Rust project)
- ✅ Faster - no need to ask for clarifications
- ✅ Better UX - fluid experience without repetitive questions

---

## 4. Dual-Mode Execution (Skill vs Task)

### Overview

SMITE plugins support **dual execution modes**: Skill (sequential) and Task (parallel). Choose based on your workflow needs.

### Skill Tool (Sequential)

**Purpose:** Load an agent's prompt from a markdown file and execute sequentially.

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
Task(
  (subagent_type = "general-purpose"),
  (prompt = "Explore codebase architecture"),
);
Task((subagent_type = "general-purpose"), (prompt = "Check for lint errors"));
Task((subagent_type = "general-purpose"), (prompt = "Update documentation"));

// Result:
// 🚀 Running 3 Agents in parallel...
// [Real-time progress for each agent]
// ✅ All 3 Agents completed
```

### When to Use Each

**Use Task Tool (Parallel) When:**

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

**Use Skill Tool or CLI Commands (Sequential) When:**

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

### Practical Examples

#### Example 1: Codebase Analysis (3 Agents Parallel)

**Scenario:** Need to explore code, check lint, and update docs simultaneously.

```typescript
// Launch all 3 agents in ONE message
Task(
  (subagent_type = "general-purpose"),
  (prompt = `You are the SMITE Explorer agent.
Analyze the codebase architecture and create a dependency map.
Focus on: plugins/, docs/, and .claude-plugin/ directories.
Output: Architecture report with diagrams.`),
);

Task(
  (subagent_type = "general-purpose"),
  (prompt = `You are the Linter Sentinel agent.
Check for TypeScript errors, ESLint violations, and formatting issues.
Report all findings with file paths and line numbers.
Output: Lint report with fixable issues.`),
);

Task(
  (subagent_type = "general-purpose"),
  (prompt = `You are the Doc Maintainer agent.
Review README.md and all documentation for accuracy.
Check if all 12 plugins are documented correctly.
Output: Documentation analysis with update suggestions.`),
);

// Result: 🚀 Running 3 Agents in parallel...
```

#### Example 2: Feature Development (Sequential)

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

#### Example 3: Quality Check (2 Agents Parallel)

**Scenario:** Quick quality validation before commit.

```typescript
// Run both checks in parallel
Task(
  (subagent_type = "general-purpose"),
  (prompt =
    "Check all TypeScript files for type errors and compilation issues. List all files with errors."),
);
Task(
  (subagent_type = "general-purpose"),
  (prompt =
    "Review recent code changes for best practices violations. Check for: console.logs, any types, TODO comments."),
);

// Result: 🚀 Running 2 Agents in parallel...
```

### Task Tool Reference

**Basic Syntax:**

```typescript
Task((subagent_type = "general-purpose"), (prompt = "<your prompt here>"));
```

**Parameters:**

- **subagent_type**: Type of agent to create
  - `"general-purpose"` - Universal agent (most common)
  - Other specialized types available

- **prompt**: The task instructions
  - Can be multi-line
  - Include agent role/mode
  - Specify output format
  - Add context and constraints

**Best Practices:**

1. **Launch in One Message** - Put ALL `Task()` calls in a SINGLE message for true parallel execution
2. **Clear Prompts** - Specify agent role ("You are the SMITE Explorer"), define task scope clearly
3. **Independent Tasks** - Only parallelize truly independent tasks; dependencies should run sequentially

### Performance Comparison

| Approach                 | Time          | UI                    | Best For              |
| ------------------------ | ------------- | --------------------- | --------------------- |
| **Sequential (3 tasks)** | ~9 min        | None                  | Chained workflows     |
| **Parallel (3 tasks)**   | ~3 min        | "Running 3 Agents"    | Independent tasks     |
| **Speedup**              | **3x faster** | ✅ Real-time tracking | Multi-agent workflows |

---

## 5. Workflow Orchestration

### Orchestrator Architecture

The **smite-orchestrator** provides intelligent workflow coordination through **Claude Code 2.1.0 native hooks**:

**Features:**

- 🎯 Claude Code 2.1.0 Hooks Integration
- 📊 Workflow State Tracking
- 🔍 Automatic Technical Debt Detection
- 💡 Smart Agent Suggestions
- 📝 Documentation Validation
- 🔄 Session Persistence
- ⚡ Zero Overhead (no daemon required)
- 🛡️ Non-Intrusive (suggestions only, never forces actions)

### State Management

The orchestrator maintains state in `.smite/orchestrator-state.json`:

```json
{
  "session_id": "uuid",
  "created_at": "ISO-timestamp",
  "updated_at": "ISO-timestamp",
  "current_agent": null,
  "last_completed_agent": "explorer",
  "agents_called": ["initializer", "explorer"],
  "workflow_complete": false,
  "artifacts": []
}
```

This state is:

- ✅ Automatically created by hooks when needed
- ✅ Updated after each agent completion
- ✅ Used to suggest next agent in workflow
- ✅ Persistent across sessions

### Generated Artifacts

The orchestrator creates these files automatically:

- `.smite/orchestrator-state.json` - Current workflow state and progress
- `.smite/suggestions/next-action.md` - Next agent recommendation
- `.smite/suggestions/fix-surgeon.md` - Technical debt alerts with line numbers
- `.smite/workflow/session-info.md` - Workflow progress and artifacts (optional)

### Custom Workflow Mode

Create personalized agent sequences:

```bash
# Quick feature development
/smite-orchestrator --workflow=custom --agents=explorer,constructor,gatekeeper

# Business focus
/smite-orchestrator --workflow=custom --agents=strategist,brainstorm,handover

# Full refactoring
/smite-orchestrator --workflow=custom --agents=explorer,surgeon,constructor,gatekeeper
```

### How It Works: Complete Flow

```
User edits file → PostToolUse hook fires
  ↓
  ├─ Code file? → detect-debt.js scans for patterns
  │                → Creates .smite/suggestions/fix-surgeon.md
  │                → Prompt hook suggests Surgeon
  │
  └─ Docs file? → Prompt hook suggests Gatekeeper

Agent completes → SubagentStop hook fires
  ↓
  ├─ agent-complete.js updates state
  ├─ Adds agent to agents_called list
  ├─ Determines next agent in workflow
  └─ Creates .smite/suggestions/next-action.md
      → Prompt hook suggests next agent

Before agent → PreToolUse hook fires
  ↓
  └─ Validates workflow order
     → Warns if order violated
     → Suggests correct sequence
```

### Real-World Workflow Example

**Starting a New Project with Auto-Orchestration:**

```bash
# 1. Start with initializer (auto-orchestration begins)
/smite-init

# After completion, orchestrator suggests next agent:
# "Next: /smite:explorer"

# 2. Explore the codebase (if applicable)
/smite:explorer --task=map-architecture

# 3. Continue with business strategy
/smite:strategist --workflow=market-analysis
/smite:strategist --workflow=business-model

# Orchestrator tracks artifacts and suggests:
# "Next: /smite-aura"

# 4. Follow the workflow
/smite-aura
/smite-constructor --tech=nextjs
/smite-gatekeeper --mode=test
/smite-handover

# Technical debt detected? Orchestrator suggests:
# "⚠️ Technical debt detected - run /smite-surgeon"
```

### Decision Matrix: Native Agenticity vs Orchestrator

| Scenario                         | Approach            | Rationale                                             |
| -------------------------------- | ------------------- | ----------------------------------------------------- |
| **Quick task (1-2 agents)**      | 🎯 Native Task Tool | Direct parallel execution, zero overhead              |
| **Medium workflow (3 agents)**   | 🎯 Native Task Tool | Manual orchestration is faster than state management  |
| **Complex workflow (4+ agents)** | 🤖 Orchestrator     | State tracking prevents errors in long sequences      |
| **Session with interruptions**   | 🤖 Orchestrator     | Persistent state enables resumption                   |
| **Repetitive custom workflow**   | 🤖 Orchestrator     | `--agents=explorer,constructor,gatekeeper` saves time |
| **One-off exploration**          | 🎯 Native Task Tool | No need for state persistence                         |

**⚠️ CRITICAL:** smite-orchestrator is a **Smart State Manager**, NOT an automatic trigger system.

- ❌ It does NOT auto-detect file creation or code patterns
- ❌ It does NOT run background surveillance
- ✅ It DOES track workflow state (session ID, agents called, artifacts)
- ✅ It DOES suggest next agent based on workflow order
- ✅ It DOES support custom workflow sequences

---

## 6. Troubleshooting

### Hooks Not Firing

**Check 1:** Hooks enabled?

```json
{ "disableAllHooks": false }
```

**Check 2:** Matcher matches?

```bash
# Test your matcher pattern
# "Edit|Write" should match "Edit" and "Write"
```

**Check 3:** Settings syntax valid?

```bash
# Claude Code validates settings.json on load
# Check for syntax errors
```

### Hook Fires Too Often

**Solution:** Narrow your matcher

```json
// Before: Catches all Edit/Write
{"matcher": "Edit|Write"}

// After: Only catches .ts files
{"matcher": "Edit|Write.*\\.ts"}
```

### Hook Suggestion Not Helpful

**Solution:** Improve prompt specificity

```json
// Before: Vague
{"prompt": "Check for problems"}

// After: Specific
{"prompt": "Check for type 'any', TODO comments, and functions > 50 lines. Only suggest Surgeon if severity is high."}
```

### "Running X Agents" Doesn't Appear

**Problem:** No parallel UI when using Task tool.

**Solution:** Make sure to put ALL `Task()` calls in ONE message, not multiple messages.

### Agents Run Sequentially Instead of Parallel

**Problem:** Agents execute one after another.

**Solution:** Check that you're using `Task()` tool, not `Skill()` tool. Skill tool is always sequential.

### Universal Hook Installation Issues

**Problem:** Scripts not compiled or not found.

**Solution:**

```bash
# Compile TypeScript scripts
cd plugins/smite-orchestrator
npm run build

# Verify scripts exist
ls dist/detect-debt.js
ls dist/agent-complete.js

# Run installer
cd ../..
node scripts/install-hooks.js --install
```

### Cross-Platform Path Issues

**Problem:** Hooks fail on different OS.

**Solution:** Use relative paths in `.claude/settings.local.json`:

```json
{
  "type": "command",
  "command": "node plugins/smite-orchestrator/dist/detect-debt.js file $FILE_PATH"
}
```

### Orchestrator State Not Updating

**Problem:** `.smite/orchestrator-state.json` not created or updated.

**Solution:**

1. Check that SubagentStop hooks are configured correctly
2. Verify agent name matches pattern `smite-`
3. Check file permissions for `.smite/` directory

### Router Detection Fails

**Problem:** smite-router doesn't detect framework correctly.

**Solution:**

1. Verify framework configuration files exist (e.g., `package.json`, `Cargo.toml`)
2. Check that detection script is compiled: `cd plugins/smite-router && npm run build`
3. Test detection manually: `node plugins/smite-router/dist/detect-framework.js`

---

## 📚 Additional Resources

### Official Documentation

- **Claude Code**: https://claude.com/claude-code
- **Claude Code Hooks**: https://docs.anthropic.com/claude-code/settings/hooks
- **Settings JSON Schema**: https://json.schemastore.org/claude-code-settings.json

### Knowledge Base

Centralized documentation hub: `.smite/knowledge-base.md`

**Quick Links:**

- React 18: https://react.dev/
- Next.js 14: https://nextjs.org/docs
- TypeScript 5: https://www.typescriptlang.org/docs/
- Zustand: https://zustand.docs.pmnd.rs/
- TanStack Query: https://tanstack.com/query/latest/docs/react/overview
- Prisma: https://www.prisma.io/docs/
- The Rust Book: https://doc.rust-lang.org/book/
- Tokio: https://tokio.rs/
- Axum: https://docs.rs/axum/latest/axum/
- SQLx: https://docs.rs/sqlx/latest/sqlx/
- FastAPI: https://fastapi.tiangolo.com/

---

## 🎯 Summary

**What we achieved:**

- ✅ Zero-overhead file watching (native hooks)
- ✅ Intelligent workflow orchestration (LLM prompts)
- ✅ Deterministic triggers (event-driven)
- ✅ No external dependencies (uses Claude Code)
- ✅ Cross-platform compatibility (works everywhere)
- ✅ Dual execution modes (Skill sequential, Task parallel)
- ✅ Intelligent agent routing (automatic framework detection)
- ✅ Comprehensive documentation (80+ official links)

**Efficiency gain:** **96% reduction** in development effort vs daemon approach
**Reliability gain:** **100%** (no daemon crashes, no process management)

**The future of agent orchestration is NOT building complex infrastructure—it's leveraging the platform's native capabilities intelligently.**

---

**SMITE Complete Guide v2.2.0**
_Last Updated: January 9, 2026_
_12 plugins available_
_10 specialized development agents_
_2 quality & documentation plugins_
_Dual execution mode (Skill + Task)_
_Parallel agent workflows with real-time tracking_
_Tech specialization modes (Next.js, Rust, Python)_
_Custom workflows & design implementation_
_Comprehensive QA (test, coverage, performance, security)_
_Modular installation_
_Zero-debt development_
_Auto-orchestration with Claude Code 2.1.0 native hooks_
_Automatic technical debt detection_
_Zero-overhead workflow coordination_
_Intelligent agent routing with smite-router_
_Automatic framework & language detection_
_Centralized documentation knowledge base_
_Official docs links integration (80+ references)_
