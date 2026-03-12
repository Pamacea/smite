#!/bin/bash
# SMITE Studio - Command Validation Hook
# Validates bash commands before execution

set -euo pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Read input
INPUT=$(cat 2>/dev/null || echo '{}')
COMMAND=$(echo "$INPUT" | grep -oP '"command":"\K[^"]+' || echo "")

# Skip if no command
if [ -z "$COMMAND" ]; then
    exit 0
fi

# Block dangerous patterns
DANGEROUS=("rm -rf" "dd if=" "mkfs" "format" "> \\.\\.")
for pattern in "${DANGEROUS[@]}"; do
    if [[ "$COMMAND" =~ $pattern ]]; then
        echo -e "${RED}[SMITE]🚫 Blocked dangerous command: $COMMAND${NC}" >&2
        exit 2
    fi
done

# Warn about risky operations
RISKY=("git push" "npm publish" "docker push" "rm ")
for pattern in "${RISKY[@]}"; do
    if [[ "$COMMAND" =~ $pattern ]]; then
        echo -e "${YELLOW}[SMITE]⚠️  Risky operation: $COMMAND${NC}" >&2
    fi
done

exit 0
