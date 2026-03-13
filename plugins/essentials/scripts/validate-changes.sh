#!/bin/bash
# SMITE Essentials - File Changes Validation Hook
# Validates file writes/edits for security and size constraints

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Read input from stdin
INPUT=$(cat 2>/dev/null || echo '{}')

# Extract file path
FILE=$(echo "$INPUT" | grep -oP '"file_path":"\K[^"]+' || echo "")

# Skip if no file
if [ -z "$FILE" ]; then
    exit 0
fi

# Security checks
SENSITIVE_PATTERNS=("\.env$" "\.pem$" "\.key$" "secret" "password" "credentials")
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if [[ "$FILE" =~ $pattern ]]; then
        echo -e "${YELLOW}[SMITE]⚠️  Sensitive file detected: $FILE${NC}" >&2
        echo -e "${YELLOW}[SMITE]   Ensure no secrets are committed${NC}" >&2
    fi
done

# Size check (prevent huge writes)
CONTENT=$(echo "$INPUT" | grep -oP '"content":"\K[^"]+' || echo "")
SIZE=${#CONTENT}

if [ "$SIZE" -gt 100000 ]; then
    echo -e "${YELLOW}[SMITE]⚠️  Large file: ${SIZE} bytes (max recommended: 100KB)${NC}" >&2
fi

# TypeScript quality check
if [[ "$FILE" =~ \.(ts|tsx)$ ]]; then
    # Check for 'any' usage
    if echo "$CONTENT" | grep -q ": any"; then
        echo -e "${YELLOW}[SMITE]⚠️  Using 'any' type in $FILE${NC}" >&2
    fi
fi

exit 0
