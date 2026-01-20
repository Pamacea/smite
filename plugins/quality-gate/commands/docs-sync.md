# quality-gate docs-sync

Synchronize documentation with codebase using MCP Scribe integration.

## Usage

```bash
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync [options]
```

## Options

- `--openapi, -o` - Generate/update OpenAPI specification
- `--readme, -r` - Update README architecture section
- `--jsdoc, -j` - Generate JSDoc comments
- `--all, -a` - Sync all documentation (default)
- `--force, -f` - Force regeneration
- `--watch, -w` - Watch mode for automatic updates

## Examples

```bash
# Sync all documentation
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync

# Generate OpenAPI spec only
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync --openapi

# Update README architecture
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync --readme

# Add JSDoc to codebase
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync --jsdoc

# Watch for changes
node ~/.claude/plugins/quality-gate/dist/cli.js docs-sync --watch
```

## What it does

### OpenAPI Sync
- Scans Express/Next.js routes
- Generates OpenAPI 3.0 spec
- Merges with existing specs
- Preserves manual annotations

### README Update
- Analyzes project structure
- Updates architecture section
- Syncs dependencies
- Preserves custom content

### JSDoc Generation
- Adds JSDoc to TypeScript files
- Generates from type definitions
- Preserves existing comments
- Formats with prettier

## Configuration

Configure in `.claude/.smite/quality.json`:

```json
{
  "documentation": {
    "enabled": true,
    "triggers": {
      "onCodeAccept": true
    },
    "openapi": {
      "enabled": true,
      "outputPath": "docs/openapi.json"
    },
    "readme": {
      "enabled": true,
      "updateArchitecture": true
    },
    "jsdoc": {
      "enabled": true,
      "formatWithPrettier": true
    }
  }
}
```

## Integration

Works with **@smite/docs-editor-mcp** MCP server. Requires:

```bash
/plugin install docs-editor-mcp@smite
```

## See Also

- **[quality-gate quality-check](commands/quality-check.md)** - Run quality checks
- **[quality-gate quality-config](commands/quality-config.md)** - Configure quality gate
- **[MCP Integration Guide](../../docs/plugins/quality-gate/MCP_INTEGRATION.md)**
- **[Docs Editor Documentation](../../docs/plugins/docs-editor-mcp/)**
