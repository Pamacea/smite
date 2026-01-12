# 🧹 SMITE Simplifier

**Code simplification and refactoring agent for clarity, consistency, and maintainability**

---

## 🎯 Overview

SMITE Simplifier automatically analyzes, simplifies, and refines code to improve clarity and maintainability while preserving exact functionality. Based on Anthropic's official [code-simplifier plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier), it's adapted for SMITE's zero-debt engineering philosophy.

---

## ✨ Features

- **Automatic Code Refinement**: Proactively simplifies code after modifications
- **Project Standards Integration**: Follows CLAUDE.md coding conventions
- **Functionality Preservation**: Never changes behavior, only improves structure
- **Smart Scoping**: Focuses on recent changes or targets specific files/directories
- **Complexity Reduction**: Eliminates nesting, redundancy, and over-complication
- **Balance Maintained**: Avoids over-simplification that hurts maintainability

---

## 🚀 Quick Start

### Installation

```bash
# Add to SMITE marketplace (already included)
/plugin install simplifier@smite
```

### Basic Usage

```bash
# Simplify recent changes
/simplifier

# Simplify specific file
/simplifier --scope=file src/components/Button.tsx

# Simplify directory
/simplifier --scope=directory src/components

# Simplify entire project
/simplifier --scope=all
```

---

## 📋 What Simplifier Does

### ✅ Improves

- **Clarity**: Makes code intent obvious through better structure
- **Consistency**: Applies uniform patterns and naming conventions
- **Readability**: Reduces nesting, complexity, and redundancy
- **Maintainability**: Consolidates logic, improves names, removes duplication

### ✅ Preserves

- **Functionality**: No behavior changes whatsoever
- **Features**: All original features remain intact
- **Outputs**: Identical inputs produce identical outputs
- **Tests**: All tests continue to pass

### ✅ Avoids

- **Over-simplification**: Keeps helpful abstractions
- **Clever code**: Prefers explicit over clever
- **Nested ternaries**: Uses switch/if-else instead
- **Premature consolidation**: Maintains separation of concerns

---

## 🎯 Integration with SMITE

### Ralph Orchestrator

The simplifier integrates seamlessly with Ralph's workflow:

```json
{
  "id": "US-005",
  "title": "Simplify and refactor code",
  "description": "Apply code simplification to recent changes",
  "acceptanceCriteria": [
    "Code complexity reduced",
    "Functionality preserved",
    "All tests passing"
  ],
  "priority": 2,
  "agent": "simplifier",
  "dependencies": ["US-002", "US-003"],
  "passes": false,
  "notes": ""
}
```

### Automatic Triggers

- **After Builder**: Automatically runs after implementation
- **During Finalize**: Part of code review phase
- **Manual**: Invoke via `/simplifier` anytime

---

## 📊 Example Transformations

### Before ❌

```typescript
// Complex nesting
const processUser = (u: any) => {
  if (u) {
    if (u.active) {
      if (u.role === 'admin') {
        return u.permissions?.admin ?? [];
      } else {
        return u.permissions?.user ?? [];
      }
    }
  }
  return [];
};
```

### After ✅

```typescript
// Clear and explicit
function getUserPermissions(user: User | null): Permission[] {
  if (!user?.active) return [];

  return user.role === 'admin'
    ? user.permissions.admin ?? []
    : user.permissions.user ?? [];
}
```

---

## 🔧 Configuration

### Project Standards

Simplifier follows conventions defined in `CLAUDE.md`:

- ES modules with proper imports
- `function` keyword over arrows
- Explicit return type annotations
- Proper React patterns
- Consistent error handling
- Uniform naming conventions

### Scope Control

```bash
# Default: Recent changes only
/simplifier

# Specific file
/simplifier --scope=file path/to/file.ts

# Directory
/simplifier --scope=directory path/to/directory

# Entire codebase
/simplifier --scope=all
```

---

## 📈 Metrics

Simplifier tracks:

- **Complexity Reduction**: Cyclomatic complexity before/after
- **Lines of Code**: Net reduction from consolidation
- **Nesting Depth**: Maximum nesting level reduction
- **Functionality**: Verification that behavior is unchanged
- **Tests**: Confirmation that all tests pass

---

## 🚫 Anti-Patterns

### ❌ Nested Ternaries

```typescript
// Don't do this
const result = a ? b ? c : d : e

// Do this instead
function getResult() {
  if (a) return b ? c : d
  return e
}
```

### ❌ Over-Clever Code

```typescript
// Don't do this
const f = x => x > 0 ? (x < 10 ? x * 2 : x * 3) : 0

// Do this instead
function calculateMultiplier(value: number): number {
  if (value <= 0) return 0
  if (value < 10) return value * 2
  return value * 3
}
```

### ❌ Removing Helpful Abstractions

```typescript
// Don't inline everything
async function process(id: string) {
  const user = await db.findOne(id)
  const token = bcrypt.hash(user.pw, 10)
  await db.sessions.create({ token })
  return token
}

// Keep separation of concerns
async function getUser(id: string) { /* ... */ }
async function createToken(data: string) { /* ... */ }
async function createSession(userId: string) { /* ... */ }
```

---

## 🔗 Resources

- **Original Plugin**: [Anthropic code-simplifier](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier)
- **Documentation**: [SKILL.md](skills/simplifier/SKILL.md)
- **Agent Definition**: [agents/simplifier.task.md](agents/simplifier.task.md)

---

## 🤝 Contributing

This agent is part of the SMITE v3.0 marketplace. To contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details

---

**Built with ❤️ by SMITE v3.0**

_Code Clarity & Maintainability Excellence_

Based on [Anthropic's code-simplifier](https://github.com/anthropics/claude-plugins-official)
