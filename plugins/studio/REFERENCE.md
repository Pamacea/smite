# Studio Plugin Reference v3.0.0

Quick reference card for SMITE Studio Plugin commands and patterns.

---

## Commands Reference

### Primary Command

```bash
/studio build [flags] "task description"
```

### Flags

| Flag | Aliases | Effect | Use Case |
|------|---------|--------|----------|
| `--speed` | `--fast`, `--quick` | Fast, surgical | Quick fixes, small changes |
| `--scale` | `--thorough`, `--epct` | Comprehensive | Complex features, multi-file |
| `--quality` | `--validate`, `--predator` | Quality gates | Critical code, production |
| `--team` | `--swarm`, `--ralph` | Parallel agents | Large projects, multi-domain |

---

## Flag Combinations

| Command | Effect | Use For |
|---------|--------|---------|
| `/studio build --speed` | Quick implementation | Small fixes |
| `/studio build --scale` | Full EPCT workflow | Features |
| `/studio build --quality` | Quality-gated | Critical code |
| `/studio build --team` | Parallel execution | Large projects |
| `/studio build --speed --quality` | Fast + Validated | Quick but correct |
| `/studio build --scale --quality` | Thorough + Validated | Important features |
| `/studio build --scale --team` | Parallel thorough | Complex projects |
| `/studio build --scale --quality --team` | Maximum power | Production systems |

---

## Auto-Detection

Studio auto-detects the best flag when none specified:

| Task Pattern | Detected As |
|--------------|-------------|
| "fix button" | `--speed` |
| "build feature" | `--scale` |
| "payment system" | `--quality` |
| "full SaaS platform" | `--team` |

---

## Workflows

### Bug Fix
```bash
/studio build --speed "fix [bug]"
```
1. Find issue
2. Fix directly
3. Basic test

### Feature
```bash
/studio build --scale "build [feature]"
```
1. EXPLORE codebase
2. PLAN strategy
3. CODE implementation
4. TEST validation

### Critical Feature
```bash
/studio build --quality --scale "build [critical feature]"
```
1. All EPCT steps
2. Security audit
3. Performance check
4. Documentation

### Large Project
```bash
/studio build --team "build [large project]"
```
1. Spawn team
2. Parallel work
3. Coordinate results
4. Integrate

---

## Tech Stack Support

```bash
# Discover specialized agents
/agents discover --tech=nextjs
/agents discover --tech=react
/agents discover --tech=python
/agents discover --tech=rust

# Use in build
/studio build --tech=nextjs --scale "build feature"
```

---

## Quality Gates

```
Code Quality: XX/100
├── Tests: [✓/✗]
├── Types: [✓/✗]
├── Barrels: [✓/✗]
└── Complexity: [✓/✗]

Status: [READY/NEEDS WORK]
```

---

## MCP Integration

### Memory Server
- Stores patterns and solutions
- Semantic search for reuse
- Learning from past builds

### Analytics Server
- Tracks build metrics
- Performance insights
- Cost optimization

---

## Hooks

| Hook | Event | Action |
|------|-------|--------|
| PreBuild | Before build | Validate environment |
| PostBuild | After build | Save patterns, metrics |
| QualityGate | During build | Check quality score |

---

## Examples

### Quick Fix
```bash
/studio build --speed "fix login button color"
```

### Feature
```bash
/studio build --scale "add user profile page"
```

### Critical
```bash
/studio build --quality "implement Stripe payments"
```

### Large
```bash
/studio build --team "build e-commerce platform"
```

---

## File Structure

```
plugins/studio/
├── skills/
│   └── core/build/          # Main build skill
├── mcp/
│   ├── memory-server.js     # Pattern storage
│   └── analytics-server.js  # Metrics tracking
├── scripts/
│   └── quality-gate.sh      # Quality scoring
├── hooks/
│   └── hooks.json           # Hook configuration
├── README.md                # Overview
├── GUIDE.md                 # This guide
└── REFERENCE.md             # Quick reference
```

---

## Success Criteria

- [ ] Correct flag chosen
- [ ] Implementation follows flag behavior
- [ ] Tests passing
- [ ] No regressions
- [ ] Quality score acceptable

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build too slow | Add `--speed` flag |
| Quality issues | Add `--quality` flag |
| Too large for one agent | Add `--team` flag |
| Not thorough enough | Add `--scale` flag |

---

*Studio Plugin v3.0.0 | Reference Card*
