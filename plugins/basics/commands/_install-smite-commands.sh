#!/bin/bash
# SMITE Commands Installer
# This script is called by the /smite command

# Find smite plugin directory
SMITE_DIR="$(pwd)/plugins/smite"
if [ ! -d "$SMITE_DIR" ]; then
    # Try relative to script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SMITE_DIR="$(dirname "$SCRIPT_DIR")"
fi

COMMANDS_DIR="$SMITE_DIR/commands"
AGENTS_DIR="$SMITE_DIR/agents"
TARGET_COMMANDS_DIR="$HOME/.claude/commands"
TARGET_AGENTS_DIR="$HOME/.claude/agents"

echo "🔥 SMITE Commands & Agents Installer"
echo "===================================="
echo ""

if [ ! -d "$COMMANDS_DIR" ]; then
    echo "❌ Error: Cannot find smite commands directory"
    echo "   Looked for: $COMMANDS_DIR"
    exit 1
fi

# Create target directories if needed
mkdir -p "$TARGET_COMMANDS_DIR"
mkdir -p "$TARGET_AGENTS_DIR"

# Copy all commands
echo "📦 Installing commands to: $TARGET_COMMANDS_DIR"
cp -f "$COMMANDS_DIR"/*.md "$TARGET_COMMANDS_DIR/" 2>/dev/null

# Copy all agents
echo "📦 Installing agents to: $TARGET_AGENTS_DIR"
if [ -d "$AGENTS_DIR" ]; then
    cp -f "$AGENTS_DIR"/*.md "$TARGET_AGENTS_DIR/" 2>/dev/null
    AGENTS_INSTALLED=true
else
    echo "⚠️  No agents directory found (skipping agents)"
    AGENTS_INSTALLED=false
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully installed SMITE:"
    echo "   Commands:"
    ls "$COMMANDS_DIR"/*.md 2>/dev/null | xargs -n1 basename | sed 's/.md$/   → \//' | sed 's/^/     /'
    if [ "$AGENTS_INSTALLED" = true ]; then
        echo "   Agents:"
        ls "$AGENTS_DIR"/*.md 2>/dev/null | xargs -n1 basename | sed 's/^/     /'
    fi
    echo ""
    echo "🚀 All commands and agents are now available!"
else
    echo "❌ Failed to copy files"
    exit 1
fi
