# Installation Guide - @smite/docs-editor-mcp

Complete installation guide for the Smite Docs Editor MCP server.

## Prerequisites

Before installing, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **TypeScript**: Version 5.0.0 or higher (for development)
- **Smite**: Version 1.0.0 or higher (optional, for integration)

Verify your environment:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 8.0.0
tsc --version   # Should be >= 5.0.0
```

## Quick Start

### 1. Navigate to Plugin Directory

```bash
cd plugins/docs-editor-mcp
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required dependencies including:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `unified` - Text processing framework
- `remark-parse` - Markdown parser
- `remark-stringify` - Markdown serializer
- `zod` - Schema validation
- `glob` - File pattern matching

### 3. Build the Plugin

```bash
npm run build
```

This compiles TypeScript source files to the `dist/` directory.

## Verification

Verify the installation was successful:

```bash
# Check built files exist
test -f dist/index.js && echo "Build successful"
test -f dist/server.js && echo "Server built"

# Test MCP server
npm start
# Should show MCP server initialization
```

Expected output:
```
Build successful
Server built
MCP server running on stdio
```

## Configuration

After installation, create your configuration file at `.claude/.smite/docs-config.json`:

```json
{
  "enabled": true,
  "readme": {
    "autoUpdate": true,
    "preserveManualEdits": true,
    "generateDiff": true,
    "sections": ["installation", "architecture", "structure"]
  },
  "openapi": {
    "enabled": false,
    "path": "docs/openapi.json"
  },
  "jsdoc": {
    "enabled": false,
    "outputPath": "docs/jsdoc/"
  }
}
```

See [docs-config.example.json](./docs-config.example.json) for a fully documented example.

## Usage

### As a Standalone MCP Server

Start the server:

```bash
npm start
```

The server runs on stdio and implements the [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/).

### With Claude Code

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "smite-docs": {
      "command": "node",
      "args": ["path/to/smite/plugins/docs-editor-mcp/dist/index.js"]
    }
  }
}
```

### Integration with Quality Gate

When used with the Smite Quality Gate, documentation updates trigger automatically after code validation passes:

```bash
# Quality gate validates code
# If validation passes:
#   → Docs Editor MCP updates README
#   → Generates diff for review
#   → Preserves manual edits
```

## Available Tools

### update_readme_architecture

Update README sections based on project structure:

```json
{
  "name": "update_readme_architecture",
  "arguments": {
    "projectPath": "/path/to/project",
    "readmePath": "README.md",
    "sectionsToUpdate": ["installation", "structure"],
    "generateDiff": true,
    "preserveMarkers": true
  }
}
```

**Parameters**:
- `projectPath` (required): Root directory of the project
- `readmePath` (optional): Path to README.md (default: "README.md")
- `sectionsToUpdate` (optional): Which sections to update (default: ["all"])
  - Options: "installation", "architecture", "structure", "all"
- `generateDiff` (optional): Generate diff preview (default: true)
- `preserveMarkers` (optional): Preserve manual edit markers (default: true)

**Output**:
```json
{
  "success": true,
  "sectionsUpdated": ["installation", "structure"],
  "dependenciesAdded": 5,
  "dependenciesUpdated": 2,
  "dependenciesRemoved": 0,
  "modulesAdded": 3,
  "modulesRemoved": 0,
  "diff": "...",
  "readmePath": "/path/to/project/README.md"
}
```

## Manual Edit Preservation

To preserve manual edits in your README:

```markdown
## Installation

<!-- SMITE:MANUAL:START -->
This section contains manual edits that will be preserved.
Custom installation notes go here.
<!-- SMITE:MANUAL:END -->

npm install my-package
```

Auto-generated sections can be marked with:

```markdown
<!-- SMITE:AUTO -->
This content will be automatically regenerated on updates.
```

## Post-Installation Steps

### 1. Test the MCP Server

Create a test to verify the server is working:

```bash
npm start &
# In another terminal, call the tool
echo '{"name": "update_readme_architecture", "arguments": {"projectPath": "."}}' | \
  node -e "process.stdin.on('data', d => console.log(d.toString()))"
```

### 2. Configure Integration

If using with the Quality Gate, add to `.claude/.smite/quality.json`:

```json
{
  "enabled": true,
  "postValidation": {
    "triggerDocsUpdate": true,
    "mcpServer": "smite-docs"
  }
}
```

### 3. Customize Sections

Edit `.claude/.smite/docs-config.json` to control which sections are updated:

```json
{
  "readme": {
    "autoUpdate": true,
    "sections": ["installation", "structure"]
  }
}
```

## Installation Modes

### Local Installation (Recommended)

Install per-project as shown above. This allows project-specific configuration.

```bash
cd plugins/docs-editor-mcp
npm install
npm run build
```

### Global Installation

For system-wide usage:

```bash
cd plugins/docs-editor-mcp
npm install -g .
smite-docs --help
```

## Troubleshooting

### Server Won't Start

**Problem**: MCP server fails to start

**Solution**:
```bash
# Verify build
npm run build

# Check for errors
npm start 2>&1 | tee server.log

# Verify dependencies
npm list
```

### Tool Not Found

**Problem**: Tools not available in MCP client

**Solution**:
```bash
# Rebuild the server
npm run clean
npm run build

# Check server initialization
npm start
# Should show: "Available tools: update_readme_architecture"
```

### Configuration Not Loading

**Problem**: Custom config not being applied

**Solution**:
```bash
# Verify config exists
cat .claude/.smite/docs-config.json

# Validate JSON syntax
cat .claude/.smite/docs-config.json | jq .

# Check file permissions
ls -la .claude/.smite/docs-config.json
```

### README Not Updating

**Problem**: Changes not applied to README

**Solution**:
```bash
# Check manual edit markers
grep "SMITE:MANUAL" README.md

# Verify sections are enabled
cat .claude/.smite/docs-config.json | grep sections

# Test manually
npm start
# Then call update_readme_architecture tool
```

## Uninstallation

To completely remove the docs editor:

```bash
# Remove dependencies
cd plugins/docs-editor-mcp
npm uninstall

# Remove config (optional)
rm -f .claude/.smite/docs-config.json

# Remove build artifacts
rm -rf dist/
```

## Next Steps

- Read the [README](./README.md) for detailed usage
- Check [docs-config.example.json](./docs-config.example.json) for configuration options
- Review the [MARKETPLACE.md](./MARKETPLACE.md) for feature list
- Report issues at [GitHub Issues](https://github.com/pamacea/smite/issues)

## Support

- Documentation: [README.md](./README.md)
- MCP Specification: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- Issues: [GitHub Issues](https://github.com/pamacea/smite/issues)
- Discussions: [GitHub Discussions](https://github.com/pamacea/smite/discussions)
