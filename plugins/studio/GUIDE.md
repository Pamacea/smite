# Studio Plugin Guide v3.0.0

Complete guide to mastering the Studio Plugin - from quick builds to complex multi-agent orchestration.

---

## The Story: From Chaos to Clarity

Imagine you're building a house. Without a contractor, you'd have to:
- Find your own architects
- Coordinate electricians and plumbers
- Ensure materials arrive on time
- Handle permits and inspections

That's what coding was like before **SMITE Studio**.

Studio acts as your **AI general contractor** - coordinating specialized agents, managing workflows, ensuring quality, and delivering results.

---

## Part 1: The 4-Flag System

The secret to Studio's power is its simplicity. **Just 4 flags** that combine to handle any coding task:

```
--speed     (Fast, surgical changes)
--scale     (Comprehensive workflow)
--quality    (Quality-gated implementation)
--team       (Parallel agent teams)
```

### The Beauty of Composition

Like colors blend to create new shades, flags combine to create custom workflows:

```bash
# Quick fix
/studio build --speed "fix button"

# Thorough implementation
/studio build --scale "build auth system"

# Production-ready code
/studio build --quality "implement payment"

# Large project with parallel work
/studio build --team "build SaaS platform"

# Combined: Thorough + Validated
/studio build --scale --quality "complex feature"

# Maximum power: All flags
/studio build --scale --quality --team "massive feature"
```

---

## Part 2: Understanding Each Flag

### --speed: The Quick Fix

**When to use:** Small changes, obvious bugs, quick iterations

```bash
/studio build --speed "fix typo in header"
/studio build --speed "update button color"
/studio build --speed "add console.log for debugging"
```

**What happens:**
- Minimal exploration
- Direct implementation
- Basic validation
- No over-engineering

**Time:** 2-5 minutes

---

### --scale: The Comprehensive Workflow

**When to use:** New features, multi-file changes, architectural decisions

```bash
/studio build --scale "add user authentication"
/studio build --scale "implement data fetching"
/studio build --scale "create dashboard layout"
```

**What happens:**
- EXPLORE: Search codebase thoroughly
- PLAN: Create implementation strategy
- CODE: Follow patterns exactly
- TEST: Validate functionality

**Time:** 15-30 minutes

---

### --quality: The Production Gatekeeper

**When to use:** Critical code, security-sensitive features, public APIs

```bash
/studio build --quality "implement payment processing"
/studio build --quality "add authentication middleware"
/studio build --quality "create public API"
```

**What happens:**
- All --scale steps PLUS:
- Security audit
- Performance profiling
- Type safety validation
- Documentation generation

**Time:** 30-60 minutes

---

### --team: The Parallel Force Multiplier

**When to use:** Large projects, multi-domain work, time-sensitive tasks

```bash
/studio build --team "build full-stack feature"
/studio build --team "create design system"
```

**What happens:**
- Spawns multiple specialized agents
- Parallel work on different aspects
- Coordination via team lead
- Results integration

**Time:** 10-20 minutes (wall clock), but 30-60 minutes of parallel work

---

## Part 3: Real-World Examples

### Example 1: Fixing a Bug

```bash
# User: "The login button doesn't work"
/studio build --speed "fix login button"
```

**Studio's process:**
1. Find login button component
2. Identify the bug (missing onClick?)
3. Fix it directly
4. Test basic functionality

**Result:** Fixed in 3 minutes

---

### Example 2: Building a Feature

```bash
# User: "I need user profile pages"
/studio build --scale "build user profile page"
```

**Studio's process:**
1. **EXPLORE**: Search for existing user components, routing patterns
2. **PLAN**: Create profile component, add route, fetch user data
3. **CODE**: Implement following existing patterns
4. **TEST**: Verify page loads and displays data

**Result:** Complete feature in 20 minutes

---

### Example 3: Critical Payment System

```bash
# User: "Add Stripe payment integration"
/studio build --quality --scale "integrate Stripe payments"
```

**Studio's process:**
1. **EXPLORE**: Research Stripe SDK, security best practices
2. **PLAN**: Design secure payment flow, error handling, webhook processing
3. **CODE**: Implement with type safety, input validation, error handling
4. **TEST**: Unit tests, integration tests, security audit
5. **VALIDATE**: Check OWASP compliance, performance benchmarks
6. **DOCUMENT**: Generate API docs, setup guide

**Result:** Production-ready payment system in 45 minutes

---

## Part 4: Quality Gates

Studio includes automatic quality scoring:

```
Code Quality: 85/100
├── Tests: ✓ Passing
├── Types: ✓ 100% coverage
├── Barrels: ✓ All exports proper
└── Complexity: ✓ Acceptable

Status: READY FOR MERGE
```

**Quality Metrics:**
- Test coverage (target: 80%+)
- Type coverage (target: 100%)
- Barrel exports (all proper)
- Code complexity (acceptable)
- Documentation (complete)

---

## Part 5: Integration with Other Plugins

Studio works seamlessly with other SMITE plugins:

### With Agents Plugin
```bash
# Discover specialized agents first
/agents discover --tech=nextjs

# Then use them in your build
/studio build --tech=nextjs --scale "build auth feature"
```

### With Essentials Plugin
```bash
# After building, get automatic rename
# Essentials watches for new files and suggests names
```

### With Core Plugin
```bash
# Use templates from Core
# Studio automatically loads relevant templates
```

---

## Part 6: Tips and Tricks

### 1. Start Simple

```bash
# Don't overthink it
/studio build "fix button"  # Auto-detects as --speed
```

### 2. Combine Flags

```bash
# Speed + Quality = Fast but validated
/studio build --speed --quality "quick but correct"

# Scale + Quality = Thorough + Validated
/studio build --scale --quality "comprehensive + safe"
```

### 3. Use --team for Large Work

```bash
# Don't struggle alone
/studio build --team "build this whole module"
```

### 4. Let Auto-Detection Help

```bash
# No flags? Studio figures it out
/studio build "add button"  # Detects --speed
/studio build "build feature"  # Detects --scale
```

---

## Part 7: Common Workflows

### Quick Bug Fix Workflow
```bash
1. /studio build --speed "fix bug"
2. Test the fix
3. Commit changes
```

### Feature Development Workflow
```bash
1. /agents discover --tech=<stack>
2. /studio build --scale "build feature"
3. /studio build --quality "review and validate"
4. Create PR
```

### Large Project Workflow
```bash
1. /studio build --team "plan architecture"
2. /studio build --team --scale "implement features"
3. /studio build --quality "final review"
4. Deploy
```

---

## Conclusion

Studio Plugin is your **AI development partner** - coordinating expertise, ensuring quality, and delivering results.

**Remember:**
- Start with auto-detection
- Add flags as needed
- Combine for custom behavior
- Trust the quality gates

**Happy Building!**

---

*Studio Plugin v3.0.0 | Part of SMITE v2.5.0*
