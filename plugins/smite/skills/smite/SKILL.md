---
name: smite
description: SMITE essential commands - oneshot, debug, commit, explore, memory, and more
version: 1.0.0
---

# 🚀 SMITE Commands

**Essential development commands for rapid iteration**

---

## 🎯 Purpose

This skill provides access to core SMITE development commands that can be called by agents and users for rapid development workflows.

---

## 📋 Available Commands

### Quick Implementation Commands

#### `/oneshot`
Ultra-fast feature implementation using Explore → Code → Test methodology.

**When to use:**
- Small to medium features
- Quick prototyping
- Single-session tasks
- Well-defined requirements

**Usage:**
```
Skill: smite:oneshot
Args: "Implement user authentication with email/password"
```

**Process:**
1. Quick codebase exploration
2. Direct implementation
3. Basic testing
4. Completion

---

#### `/debug`
Systematic bug debugging with deep analysis and resolution.

**When to use:**
- Bug reports
- Unexpected behavior
- Error diagnosis
- Production issues

**Usage:**
```
Skill: smite:debug
Args: "Authentication fails on Safari browser"
```

**Process:**
1. Deep error analysis
2. Root cause identification
3. Targeted fix
4. Verification

---

#### `/explore`
Quick codebase exploration and understanding.

**When to use:**
- Understand architecture
- Find patterns
- Locate features
- Map dependencies

**Usage:**
```
Skill: smite:explore
Args: "How is user authentication implemented?"
```

**Process:**
1. Fast codebase search
2. Pattern identification
3. Context mapping
4. Clear explanation

---

### Code Management Commands

#### `/commit`
Quick commit and push with clean, descriptive messages.

**When to use:**
- After completing work
- Saving progress
- Pre-PR commits
- Quick saves

**Usage:**
```
Skill: smite:commit
Args: "feat: add user authentication"
```

**Process:**
1. Stage changes
2. Generate clean message
3. Commit
4. Push (optional)

---

#### `/pr`
Create and push pull request with auto-generated description.

**When to use:**
- Ready for review
- Feature completion
- Bug fix completion
- Integration ready

**Usage:**
```
Skill: smite:pr
Args: (optional) - uses current branch by default
```

**Process:**
1. Check git status
2. Create PR if needed
3. Generate description
4. Push PR

---

### Planning & Documentation Commands

#### `/spec`
Spec-first workflow: Analyze → Plan → Execute.

**When to use:**
- Complex features
- Architecture decisions
- Multi-file changes
- Team coordination

**Usage:**
```
Skill: smite:spec
Args: "Implement real-time collaboration with WebSockets"
```

**Process:**
1. Requirements analysis
2. Implementation plan
3. Architecture design
4. Execution guide

---

#### `/memory`
Create and update CLAUDE.md files with project knowledge.

**When to use:**
- Project setup
- Architecture decisions
- Important patterns
- Team onboarding

**Usage:**
```
Skill: smite:memory
Args: "Document authentication architecture"
```

**Process:**
1. Extract key knowledge
2. Format as CLAUDE.md
3. Update project memory
4. Link related files

---

#### `/explain`
Analyze and explain architectural patterns and decisions.

**When to use:**
- Understanding code
- Documenting patterns
- Code review
- Knowledge sharing

**Usage:**
```
Skill: smite:explain
Args: "Explain the dependency injection pattern"
```

**Process:**
1. Pattern identification
2. Context analysis
3. Clear explanation
4. Example usage

---

### Advanced Workflow Commands

#### `/apex`
APEX methodology: Analyze → Plan → Execute → eXamine.

**When to use:**
- Complex features requiring thorough analysis
- Production-critical changes
- Architecture modifications

**Usage:**
```
Skill: smite:apex
Args: "Refactor payment processing system"
```

**Process:**
1. Deep analysis
2. Detailed planning
3. Implementation
4. Examination & verification

---

#### `/epct`
E-P-C-T workflow: Explore → Plan → Code → Test.

**When to use:**
- Systematic feature development
- Test-driven development
- Quality-critical features

**Usage:**
```
Skill: smite:epct
Args: "Implement API rate limiting"
```

**Process:**
1. Exploration
2. Planning
3. Coding
4. Testing

---

#### `/tasks`
Execute GitHub issues with full EPCT workflow and PR creation.

**When to use:**
- GitHub issue triage
- Automated PR creation
- Issue resolution workflow
- Project management

**Usage:**
```
Skill: smite:tasks
Args: "https://github.com/user/repo/issues/123"
```

**Process:**
1. Issue analysis
2. Full EPCT workflow
3. PR creation
4. Documentation

---

### Utility Commands

#### `/cleanup`
Optimize memory bank files by removing duplicates and consolidating.

**When to use:**
- Memory maintenance
- Duplicate removal
- Organization
- Performance optimization

**Usage:**
```
Skill: smite:cleanup
Args: (optional) - defaults to all .claude directories
```

**Process:**
1. Scan memory files
2. Identify duplicates
3. Consolidate content
4. Archive obsolete

---

#### `/smite`
Install all SMITE commands automatically.

**When to use:**
- Initial setup
- Command installation
- Updates
- Reinstallation

**Usage:**
```
Skill: smite:smite
Args: (optional)
```

**Process:**
1. Detect platform
2. Copy commands
3. Verify installation
4. Show confirmation

---

## 🎯 Agent Usage Guidelines

### When to Call SMITE Commands

**Use `/oneshot` when:**
- Task is well-defined
- Can be completed in one session
- Requirements are clear
- Complexity is low to medium

**Use `/debug` when:**
- Investigating bugs
- Unexpected behavior
- Error diagnosis needed
- Root cause unclear

**Use `/commit` when:**
- Work is complete
- Ready to save progress
- Clean commit needed
- Before PR

**Use `/spec` when:**
- Feature is complex
- Architecture decisions needed
- Multiple files affected
- Planning required

### Command Selection Flow

```
Start
  │
  ├─ Is it a bug? → Use /debug
  │
  ├─ Is it complex? → Use /spec
  │
  ├─ Is it quick/well-defined? → Use /oneshot
  │
  ├─ Need to save work? → Use /commit
  │
  └─ Ready for review? → Use /pr
```

---

## 📊 Best Practices

### For Agents Calling These Commands

1. **Choose the right command** for the task
2. **Provide clear context** in arguments
3. **Use appropriate workflow** (oneshot vs spec)
4. **Follow up** with commit/pr when needed

### Example Agent Workflows

**Workflow 1: Quick Feature**
```
1. Receive feature request
2. Call smite:oneshot with task description
3. Wait for implementation
4. Call smite:commit to save changes
```

**Workflow 2: Bug Fix**
```
1. Receive bug report
2. Call smite:debug with error description
3. Review fix proposal
4. Call smite:oneshot to implement fix
5. Call smite:commit to save
```

**Workflow 3: Complex Feature**
```
1. Receive complex requirement
2. Call smite:spec to create specification
3. Review specification
4. Call smite:apex for implementation
5. Call smite:pr to create review
```

---

## ✨ Integration

**These commands integrate with:**
- architect: System design and planning
- builder: Production implementation
- explorer: Codebase analysis
- finalize: QA and review
- simplifier: Code refactoring

**Typical agent workflow:**
1. Use smite:explore to understand
2. Use architect to design
3. Use smite:oneshot or smite:apex to implement
4. Use smite:commit to save
5. Use finalize to review
6. Use smite:pr to create PR

---

## 🎯 Quick Reference

| Task | Command | When to Use |
|------|---------|-------------|
| Quick implementation | `/oneshot` | Well-defined, small-medium tasks |
| Bug fixing | `/debug` | Error diagnosis and fix |
| Understand code | `/explore` | Architecture understanding |
| Save work | `/commit` | Commit and push changes |
| Create PR | `/pr` | Pull request creation |
| Complex feature | `/spec` | Planning and architecture |
| Document | `/memory` | CLAUDE.md creation |
| Explain pattern | `/explain` | Architecture explanation |
| Systematic dev | `/apex` | APEX methodology |
| TDD workflow | `/epct` | E-P-C-T methodology |
| GitHub issues | `/tasks` | Issue to PR automation |
| Maintenance | `/cleanup` | Memory optimization |

---

**Built with ❤️ by SMITE v1.0**
*Rapid Development Commands*
