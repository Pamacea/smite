#!/bin/bash
# Claude Code Aliases Installer (macOS/Linux Bash/Zsh)
# This script installs cc and ccc aliases for Claude Code

set -e

# Color helpers
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${CYAN}$1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
info "🔥 Installing Claude Code Shell Aliases"
info "======================================"
echo ""

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_TYPE="zsh"
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_TYPE="bash"
    # Check for .bash_profile (macOS) or .bashrc (Linux)
    if [ "$(uname)" = "Darwin" ]; then
        SHELL_CONFIG="$HOME/.bash_profile"
        # Also check for .bashrc on macOS
        if [ -f "$HOME/.bashrc" ]; then
            SHELL_CONFIG="$HOME/.bashrc"
        fi
    else
        SHELL_CONFIG="$HOME/.bashrc"
    fi
else
    error "Unsupported shell. Please use Bash or Zsh."
    exit 1
fi

info "Detected: $SHELL_TYPE"
info "Config file: $SHELL_CONFIG"
echo ""

# Create config if it doesn't exist
if [ ! -f "$SHELL_CONFIG" ]; then
    warning "Config file does not exist, creating: $SHELL_CONFIG"
    touch "$SHELL_CONFIG"
fi

# Create backup
BACKUP_PATH="$SHELL_CONFIG.backup"
cp "$SHELL_CONFIG" "$BACKUP_PATH"
success "Backed up config to: $BACKUP_PATH"

# Alias definitions
ALIAS_MARKER="# Claude Code aliases"
ALIAS_CONTENT="

$ALIAS_MARKER
alias cc='claude'
alias ccc='claude --bypass-permissions'
# End Claude Code aliases
"

# Check if aliases already exist
if grep -q "$ALIAS_MARKER" "$SHELL_CONFIG"; then
    warning "Aliases already installed in config"
    echo "   Skipping installation..."
    echo ""
    success "Aliases already configured!"
    echo ""
    info "📝 Available aliases:"
    echo -e "   ${CYAN}cc    → claude${NC}"
    echo -e "   ${CYAN}ccc   → claude --bypass-permissions${NC}"
    echo ""
    info "🔄 Reload your shell:"
    echo -e "   ${CYAN}source $SHELL_CONFIG${NC}"
    exit 0
fi

# Append aliases to config
echo "$ALIAS_CONTENT" >> "$SHELL_CONFIG"

success "Installed aliases to: $SHELL_CONFIG"
echo ""

info "📝 Aliases added:"
echo -e "   ${CYAN}cc    → claude${NC}"
echo -e "   ${CYAN}ccc   → claude --bypass-permissions${NC}"
echo ""

info "🔄 Reload your shell to use aliases:"
if [ "$SHELL_TYPE" = "zsh" ]; then
    echo -e "   ${CYAN}source ~/.zshrc${NC}"
else
    echo -e "   ${CYAN}source $SHELL_CONFIG${NC}"
fi
echo "   Then close and reopen your terminal"
echo ""

success "✅ Done! You can now use: cc and ccc"
