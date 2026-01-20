# quality-gate

Code quality gate system with automatic validation, testing, and documentation synchronization.

## Description

The quality-gate skill provides comprehensive code quality validation through:
- **Complexity Analysis**: Cyclomatic complexity thresholds
- **Security Scanning**: SQL injection, XSS, weak crypto, and more
- **Semantic Validation**: Type consistency and naming conventions
- **Test Execution**: Automated test running
- **Documentation Sync**: Automatic documentation updates via MCP

## When to Use

Use this skill when:
- Writing or modifying code
- Before committing changes
- Reviewing pull requests
- Ensuring code quality standards
- Automating documentation updates

## Commands

- **[quality-gate quality-check](../../commands/quality-check.md)** - Run quality checks
- **[quality-gate quality-config](../../commands/quality-config.md)** - Configure quality gate
- **[quality-gate docs-sync](../../commands/docs-sync.md)** - Sync documentation

## Configuration

Create `.claude/.smite/quality.json`:

```json
{
  "enabled": true,
  "complexity": {
    "enabled": true,
    "threshold": 10
  },
  "security": {
    "enabled": true
  },
  "semantic": {
    "enabled": true
  },
  "tests": {
    "enabled": true,
    "command": "npm test"
  },
  "documentation": {
    "enabled": true,
    "triggers": {
      "onCodeAccept": true
    }
  }
}
```

## Workflow

```
Write Code → Quality Gate Analyzes → Feedback Loop
                      ↓
              Issues Found?
           ↙          ↘
         Yes            No
         ↓              ↓
    Retry/Fix    Tests Run → Docs Sync → Complete
```

## Features

### Complexity Analysis
- Cyclomatic complexity calculation
- Per-function thresholds
- File-level aggregation
- Trend tracking

### Security Scanning
- SQL injection detection
- XSS vulnerability scanning
- Weak cryptography detection
- Hardcoded secrets finding
- Insecure dependency checks

### Semantic Validation
- Type consistency checks
- Naming convention validation
- Import/export verification
- Dead code detection

### Test Execution
- Jest/Vitest/Mocha support
- pytest support
- Custom test commands
- Coverage reporting

### Documentation Sync
- OpenAPI spec generation
- README updates
- JSDoc generation
- Automatic on code accept

## Integration

Works with:
- **@smite/docs-editor-mcp** - Documentation automation
- **Pre-commit hooks** - Git workflow integration
- **CI/CD pipelines** - Quality gates in deployment

## Documentation

- **[Installation Guide](../../../docs/plugins/quality-gate/INSTALL.md)**
- **[Configuration Reference](../../../docs/plugins/quality-gate/CONFIG_REFERENCE.md)**
- **[Architecture](../../../docs/plugins/quality-gate/ARCHITECTURE.md)**
- **[Integration Guide](../../../docs/plugins/quality-gate/INTEGRATION.md)**
- **[Troubleshooting](../../../docs/plugins/quality-gate/TROUBLESHOOTING.md)**

## Examples

```bash
# Initialize configuration
node ~/.claude/plugins/quality-gate/dist/cli.js quality-config --init

# Run quality checks
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check

# Check specific file
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --files src/auth/jwt.ts

# Check only staged files
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --staged

# Sync documentation
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync

# Show current configuration
node ~/.claude/plugins/quality-gate/dist/cli.js quality-config --show
```

## Error Handling

The quality gate provides:
- Detailed error messages
- File and line location
- Suggested fixes
- Retry mechanism with feedback loop
- Configurable failure thresholds

## Best Practices

1. **Start with defaults** - Use default config first
2. **Adjust gradually** - Tune thresholds based on codebase
3. **Enable incrementally** - Turn on features one at a time
4. **Review feedback** - Use suggestions to improve code
5. **Keep tests passing** - Enable tests only after they pass
6. **Sync docs regularly** - Keep documentation up to date
