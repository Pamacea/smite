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
TARGET_DIR="$HOME/.claude/commands"

echo "🔥 SMITE Commands Installer"
echo "=========================="
echo ""

if [ ! -d "$COMMANDS_DIR" ]; then
    echo "❌ Error: Cannot find smite commands directory"
    echo "   Looked for: $COMMANDS_DIR"
    exit 1
fi

# Create target directory if needed
mkdir -p "$TARGET_DIR"

# Copy all commands
echo "📦 Installing commands to: $TARGET_DIR"
cp -f "$COMMANDS_DIR"/*.md "$TARGET_DIR/" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully installed SMITE commands:"
    ls "$COMMANDS_DIR"/*.md | xargs -n1 basename | sed 's/.md$/ → \//'
    echo ""
    echo "🚀 All commands are now available!"
else
    echo "❌ Failed to copy commands"
    exit 1
fi
