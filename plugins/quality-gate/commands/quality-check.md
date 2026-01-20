# quality-gate quality-check

Run quality gate checks on your codebase.

## Usage

```bash
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check [options]
```

## Options

- `--scope, -s <path>` - Specific file or directory to check
- `--complexity, -c` - Only check complexity
- `--security, -s` - Only check security
- `--semantic, -s` - Only check semantic consistency
- `--fix, -f` - Auto-fix issues when possible
- `--verbose, -v` - Detailed output

## Examples

```bash
# Check entire codebase
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check

# Check specific files
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --files src/components/Button.tsx,src/utils/helpers.ts

# Check only staged files
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --staged

# Check with detailed output
node ~/.claude/plugins/quality-gate/dist/cli.js quality-check --print
```

## What it checks

- **Complexity**: Cyclomatic complexity thresholds
- **Security**: SQL injection, XSS, weak crypto, etc.
- **Semantic**: Type consistency and naming conventions
- **Tests**: Runs test suite if configured

## Configuration

Configure in `.claude/.smite/quality.json`:

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
  }
}
```

## See Also

- **[quality-gate quality-config](commands/quality-config.md)** - Configure quality gate
- **[quality-gate docs-sync](commands/docs-sync.md)** - Sync documentation
- **[Configuration Guide](../../docs/plugins/quality-gate/CONFIG_REFERENCE.md)**
